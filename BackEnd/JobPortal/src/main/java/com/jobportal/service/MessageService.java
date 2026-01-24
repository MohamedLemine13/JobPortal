package com.jobportal.service;

import com.jobportal.dto.common.PaginationResponse;
import com.jobportal.dto.message.*;
import com.jobportal.entity.*;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ForbiddenException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import com.jobportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public ConversationDto startConversation(StartConversationRequest request) {
        UUID senderId = securityUtils.getCurrentUserId();
        UUID recipientId;
        try {
            recipientId = UUID.fromString(request.getRecipientId());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid recipient ID format");
        }

        // Prevent messaging self
        if (senderId.equals(recipientId)) {
            throw new BadRequestException("You cannot message yourself");
        }

        // Find users
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recipientId));

        // Setup job and application context if provided
        Job job = null;
        Application application = null;

        if (request.getApplicationId() != null) {
            application = applicationRepository.findById(UUID.fromString(request.getApplicationId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
            job = application.getJob();
        }

        // Check for existing conversation
        Optional<Conversation> existingConv;
        if (job != null) {
            existingConv = conversationRepository.findByParticipantsAndJob(senderId, recipientId, job.getId());
        } else {
            existingConv = conversationRepository.findByParticipants(senderId, recipientId);
        }

        Conversation conversation;
        if (existingConv.isPresent()) {
            conversation = existingConv.get();
            conversation.setLastMessageAt(LocalDateTime.now());
        } else {
            // Create new conversation
            conversation = Conversation.builder()
                    .participant1(sender)
                    .participant2(recipient)
                    .job(job)
                    .application(application)
                    .lastMessageAt(LocalDateTime.now())
                    .build();
        }

        conversation = conversationRepository.save(conversation);

        // Create initial message
        createMessage(conversation, sender, request.getContent());

        return mapToConversationDto(conversation, senderId);
    }

    @Transactional
    public MessageDto sendMessage(UUID conversationId, SendMessageRequest request) {
        UUID senderId = securityUtils.getCurrentUserId();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        // Validate participation
        if (!conversation.getParticipant1().getId().equals(senderId) &&
                !conversation.getParticipant2().getId().equals(senderId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId));

        Message message = createMessage(conversation, sender, request.getContent());

        // Update conversation timestamp
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return mapToMessageDto(message);
    }

    @Transactional(readOnly = true)
    public ConversationListResponse getConversations(int page, int limit) {
        UUID userId = securityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, limit);

        Page<Conversation> conversationsPage = conversationRepository.findByParticipant(userId, pageable);

        List<ConversationDto> conversationDtos = conversationsPage.getContent().stream()
                .map(conv -> mapToConversationDto(conv, userId))
                .collect(Collectors.toList());

        return ConversationListResponse.builder()
                .conversations(conversationDtos)
                .build();
    }

    @Transactional
    public ConversationDetailResponse getConversationMessages(UUID conversationId, int page, int limit) {
        UUID userId = securityUtils.getCurrentUserId();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        // Validate participation
        if (!conversation.getParticipant1().getId().equals(userId) &&
                !conversation.getParticipant2().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }

        // Mark messages as read
        messageRepository.markAsRead(conversationId, userId);

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "sentAt"));
        Page<Message> messagesPage = messageRepository.findByConversationIdOrderBySentAtDesc(conversationId, pageable);

        List<MessageDto> messageDtos = messagesPage.getContent().stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());

        // Build conversation info
        ConversationDto convDto = mapToConversationDto(conversation, userId);
        ConversationDetailResponse.ConversationInfo info = ConversationDetailResponse.ConversationInfo.builder()
                .id(convDto.getId())
                .participant(convDto.getParticipant())
                .job(convDto.getJob())
                .build();

        return ConversationDetailResponse.builder()
                .conversation(info)
                .messages(messageDtos)
                .pagination(PaginationResponse.of(page, limit, messagesPage.getTotalElements()))
                .build();
    }

    @Transactional
    public void markConversationAsRead(UUID conversationId) {
        UUID userId = securityUtils.getCurrentUserId();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        // Validate participation
        if (!conversation.getParticipant1().getId().equals(userId) &&
                !conversation.getParticipant2().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }

        messageRepository.markAsRead(conversationId, userId);
    }

    @Transactional(readOnly = true)
    public long getTotalUnreadCount() {
        UUID userId = securityUtils.getCurrentUserId();
        return messageRepository.countTotalUnread(userId);
    }

    private Message createMessage(Conversation conversation, User sender, String content) {
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .build();

        return messageRepository.save(message);
    }

    private ConversationDto mapToConversationDto(Conversation conversation, UUID currentUserId) {
        // Determine counterpart
        User counterpart = conversation.getParticipant1().getId().equals(currentUserId)
                ? conversation.getParticipant2()
                : conversation.getParticipant1();

        ConversationDto.ParticipantInfo participantInfo = getParticipantInfo(counterpart);

        ConversationDto.JobInfo jobInfo = null;
        if (conversation.getJob() != null) {
            jobInfo = ConversationDto.JobInfo.builder()
                    .id(conversation.getJob().getId().toString())
                    .title(conversation.getJob().getTitle())
                    .build();
        }

        // Get last message info
        Optional<Message> lastMessage = messageRepository
                .findFirstByConversationIdOrderBySentAtDesc(conversation.getId());
        ConversationDto.LastMessageInfo lastMessageInfo = null;
        if (lastMessage.isPresent()) {
            Message msg = lastMessage.get();
            lastMessageInfo = ConversationDto.LastMessageInfo.builder()
                    .content(msg.getContent())
                    .sentAt(msg.getSentAt())
                    .isRead(msg.getIsRead())
                    .build();
        }

        // Get unread count
        long unreadCount = messageRepository.countUnreadInConversation(conversation.getId(), currentUserId);

        return ConversationDto.builder()
                .id(conversation.getId().toString())
                .participant(participantInfo)
                .job(jobInfo)
                .lastMessage(lastMessageInfo)
                .unreadCount((int) unreadCount)
                .build();
    }

    private ConversationDto.ParticipantInfo getParticipantInfo(User user) {
        String name = "User";
        String avatar = null;

        if (user.getRole() == UserRole.JOB_SEEKER) {
            Optional<JobSeekerProfile> profile = jobSeekerProfileRepository.findByUser(user);
            if (profile.isPresent()) {
                name = profile.get().getFullName();
                avatar = profile.get().getAvatarUrl();
            }
        } else {
            Optional<EmployerProfile> profile = employerProfileRepository.findByUser(user);
            if (profile.isPresent()) {
                name = profile.get().getCompanyName() + " (" + profile.get().getFullName() + ")";
                avatar = profile.get().getAvatarUrl();
            }
        }

        return ConversationDto.ParticipantInfo.builder()
                .id(user.getId().toString())
                .name(name)
                .avatar(avatar)
                .build();
    }

    private MessageDto mapToMessageDto(Message message) {
        return MessageDto.builder()
                .id(message.getId().toString())
                .senderId(message.getSender().getId().toString())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .build();
    }
}
