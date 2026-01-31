package com.jobportal.service;

import com.jobportal.dto.chatbot.ChatRequest;
import com.jobportal.dto.chatbot.ChatResponse;
import com.jobportal.dto.chatbot.IndexRequest;
import com.jobportal.dto.chatbot.IndexResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;

@Service
public class RagClientService {
    
    private static final Logger log = LoggerFactory.getLogger(RagClientService.class);
    private final WebClient webClient;

    public RagClientService(WebClient webClient) {
        this.webClient = webClient;
    }


    public IndexResponse indexDocument(IndexRequest indexRequest) {
        try {
            log.info("Indexing {} file(s)", indexRequest.getFilePaths().size());
            
            return webClient.post()
                    .uri("/index")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(indexRequest)
                    .retrieve()
                    .bodyToMono(IndexResponse.class)
                    .block();
                    
        } catch (WebClientResponseException e) {
            log.error("RAG service error during indexing: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return new IndexResponse(false, "RAG service error: " + e.getMessage(), 0, 0);
        } catch (WebClientRequestException e) {
            log.error("Cannot connect to RAG service: {}", e.getMessage());
            return new IndexResponse(false, "Cannot connect to RAG service. Is it running?", 0, 0);
        } catch (Exception e) {
            log.error("Unexpected error during indexing: {}", e.getMessage());
            return new IndexResponse(false, "Unexpected error: " + e.getMessage(), 0, 0);
        }
    }


    public ChatResponse chat(ChatRequest chatRequest) {
        try {
            log.info("Processing chat question: {}", chatRequest.getQuestion());
            
            return webClient.post()
                    .uri("/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(chatRequest)
                    .retrieve()
                    .bodyToMono(ChatResponse.class)
                    .block();
                    
        } catch (WebClientResponseException e) {
            log.error("RAG service error during chat: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return new ChatResponse(
                    "Error: RAG service returned an error. Please try again later.",
                    List.of(), 0, 0, true, e.getMessage()
            );
        } catch (WebClientRequestException e) {
            log.error("Cannot connect to RAG service: {}", e.getMessage());
            return new ChatResponse(
                    "Error: Cannot connect to RAG service. Please ensure it is running.",
                    List.of(), 0, 0, true, "Connection failed"
            );
        } catch (Exception e) {
            log.error("Unexpected error during chat: {}", e.getMessage());
            return new ChatResponse(
                    "Error: An unexpected error occurred. Please try again.",
                    List.of(), 0, 0, true, e.getMessage()
            );
        }
    }


    public String health() {
        try {
            return webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("RAG service health check failed: {}", e.getMessage());
            return "{\"status\": \"unavailable\", \"error\": \"" + e.getMessage() + "\"}";
        }
    }


    public boolean isAvailable() {
        try {
            health();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
