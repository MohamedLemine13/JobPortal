package com.jobportal.dto.job;

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
public class JobListResponse {
    private List<JobListItemDto> jobs;
    private PaginationResponse pagination;
}
