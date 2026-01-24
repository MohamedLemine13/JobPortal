package com.jobportal.repository;

import com.jobportal.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    // Find messages in a conversation
    Page<Message> findByConversationIdOrderBySentAtDesc(UUID conversationId, Pageable pageable);

    // Get last message in conversation
    Optional<Message> findFirstByConversationIdOrderBySentAtDesc(UUID conversationId);

    // Count unread messages in conversation for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadInConversation(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    // Count total unread messages for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
            "(m.conversation.participant1.id = :userId OR m.conversation.participant2.id = :userId) " +
            "AND m.sender.id != :userId AND m.isRead = false")
    long countTotalUnread(@Param("userId") UUID userId);

    // Mark messages as read
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId AND m.isRead = false")
    void markAsRead(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);
}
