package com.jobportal.dto.job;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJobRequest {

    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    private String description;

    private List<String> requirements;

    @Size(max = 255, message = "Location must be at most 255 characters")
    private String location;

    private String type;

    @Size(max = 100, message = "Category must be at most 100 characters")
    private String category;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private String salaryPeriod;
    private String experienceLevel;
    private List<String> skills;
    private List<String> benefits;
    private String status;
    private LocalDateTime expiresAt;
}
