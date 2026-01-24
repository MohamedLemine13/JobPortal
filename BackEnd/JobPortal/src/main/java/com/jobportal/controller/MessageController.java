package com.jobportal.controller;

import com.jobportal.dto.common.ApiResponse;
import com.jobportal.dto.message.*;
import com.jobportal.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationDto>> startConversation(
            @Valid @RequestBody StartConversationRequest request) {
        ConversationDto response = messageService.startConversation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Conversation started"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationListResponse>> getConversations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        ConversationListResponse response = messageService.getConversations(page, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<ConversationDetailResponse>> getConversationMessages(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit) {
        ConversationDetailResponse response = messageService.getConversationMessages(id, page, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody SendMessageRequest request) {
        MessageDto response = messageService.sendMessage(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Message sent"));
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        messageService.markConversationAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = messageService.getTotalUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(
                Collections.singletonMap("unreadCount", count)));
    }
}
