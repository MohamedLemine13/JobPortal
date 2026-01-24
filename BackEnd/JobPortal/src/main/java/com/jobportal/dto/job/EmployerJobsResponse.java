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
public class EmployerJobsResponse {
    private List<JobListItemDto> jobs;
    private EmployerJobStats stats;
    private PaginationResponse pagination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployerJobStats {
        private Long totalJobs;
        private Long activeJobs;
        private Long totalApplicants;
        private Long hiredCount;
    }
}
