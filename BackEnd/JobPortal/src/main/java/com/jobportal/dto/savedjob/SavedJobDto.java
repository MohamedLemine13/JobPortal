package com.jobportal.dto.savedjob;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobportal.dto.job.JobListItemDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SavedJobDto {
    private String id;
    private JobListItemDto job;
    private LocalDateTime savedAt;
}
