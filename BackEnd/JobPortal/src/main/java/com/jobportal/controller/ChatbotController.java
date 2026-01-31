package com.jobportal.controller;

import com.jobportal.dto.chatbot.ChatRequest;
import com.jobportal.dto.chatbot.ChatResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.ChatContextService;
import com.jobportal.service.RagClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatbotController {

    private static final Logger log = LoggerFactory.getLogger(ChatbotController.class);
    private static final int MAX_QUESTION_LENGTH = 2000;

    private final RagClientService ragClientService;
    private final ChatContextService chatContextService;
    private final UserRepository userRepository;

    public ChatbotController(
            RagClientService ragClientService,
            ChatContextService chatContextService,
            UserRepository userRepository) {
        this.ragClientService = ragClientService;
        this.chatContextService = chatContextService;
        this.userRepository = userRepository;
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> ask(@RequestBody ChatRequest request) {

        if (request == null || request.getQuestion() == null || request.getQuestion().isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ChatResponse("Error: Question cannot be empty.", List.of(), 0, 0, true, "Invalid input"));
        }

        if (request.getQuestion().length() > MAX_QUESTION_LENGTH) {
            return ResponseEntity.badRequest().body(
                    new ChatResponse(
                            "Error: Question is too long. Maximum " + MAX_QUESTION_LENGTH + " characters allowed.",
                            List.of(), 0, 0, true, "Question too long"));
        }

        log.info("Received chat question: {}",
                request.getQuestion().substring(0, Math.min(100, request.getQuestion().length())));

        // Inject dynamic context based on authenticated user
        String context = buildUserContext();
        if (context != null && !context.isEmpty()) {
            request.setContext(context);
            log.debug("Injected user context ({} characters)", context.length());
        }

        ChatResponse response = ragClientService.chat(request);

        // Return appropriate HTTP status based on response
        if (response.isError()) {
            return ResponseEntity.internalServerError().body(response);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Build context based on the authenticated user's role.
     * Returns empty string if user is not authenticated.
     */
    private String buildUserContext() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.debug("No authenticated user for chatbot context");
                return "";
            }

            String email = authentication.getName();
            if (email == null || "anonymousUser".equals(email)) {
                log.debug("Anonymous user, no context injected");
                return "";
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("Could not find user by email: {}", email);
                return "";
            }

            User user = userOpt.get();
            String context = chatContextService.buildContextForUser(user.getId(), user.getRole());
            log.info("Built context for user {} (role: {})", email, user.getRole());
            return context;

        } catch (Exception e) {
            log.error("Error building user context: {}", e.getMessage());
            return "";
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok(ragClientService.health());
    }

    @GetMapping("/available")
    public ResponseEntity<Boolean> isAvailable() {
        return ResponseEntity.ok(ragClientService.isAvailable());
    }
}
