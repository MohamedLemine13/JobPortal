package com.jobportal.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDetailDto {
    private String id;
    private String title;
    private String companyName;
    private String description;
    private String requirements;
    private String location;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String jobType;
    private String experienceLevel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int applicationCount;
    private String employerId;
}
