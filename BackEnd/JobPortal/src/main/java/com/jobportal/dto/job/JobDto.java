package com.jobportal.dto.job;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobDto {
    private String id;
    private String title;
    private String description;
    private List<String> requirements;
    private CompanyDto company;
    private String location;
    private String type;
    private String category;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private String salaryPeriod;
    private String experienceLevel;
    private List<String> skills;
    private List<String> benefits;
    private String status;
    private Integer applicantsCount;
    private Integer viewsCount;
    private LocalDateTime postedAt;
    private LocalDateTime expiresAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyDto {
        private String id;
        private String name;
        private String logo;
        private String description;
        private String size;
        private String industry;
    }
}
