package com.jobportal.dto.message;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobportal.dto.common.PaginationResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConversationDetailResponse {
    private ConversationInfo conversation;
    private List<MessageDto> messages;
    private PaginationResponse pagination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationInfo {
        private String id;
        private ConversationDto.ParticipantInfo participant;
        private ConversationDto.JobInfo job;
    }
}
