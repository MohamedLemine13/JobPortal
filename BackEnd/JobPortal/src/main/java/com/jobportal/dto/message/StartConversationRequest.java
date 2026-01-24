package com.jobportal.dto.message;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartConversationRequest {

    @NotBlank(message = "Recipient ID is required")
    private String recipientId;

    private String applicationId;

    @NotBlank(message = "Message content is required")
    private String content;
}
