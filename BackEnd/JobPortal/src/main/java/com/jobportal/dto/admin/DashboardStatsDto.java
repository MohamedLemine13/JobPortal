package com.jobportal.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalUsers;
    private long totalJobSeekers;
    private long totalEmployers;
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
}
