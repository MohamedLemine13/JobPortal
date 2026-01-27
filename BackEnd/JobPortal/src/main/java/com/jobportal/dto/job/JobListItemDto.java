package com.jobportal.dto.job;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobListItemDto {
    private String id;
    private String title;
    private CompanyInfo company;
    private String location;
    private String type;
    private String category;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private String salaryPeriod;
    private LocalDateTime postedAt;
    private Integer applicantsCount;
    private String status;
    private Integer viewsCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyInfo {
        private String id;
        private String name;
        private String logo;
    }
}
