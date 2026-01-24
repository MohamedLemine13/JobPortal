package com.jobportal.dto.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationDto {
    private String id;
    private JobInfo job;
    private ApplicantInfo applicant;
    private String status;
    private String coverLetter;
    private String cvUrl;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String notes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobInfo {
        private String id;
        private String title;
        private CompanyInfo company;
        private String location;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyInfo {
        private String name;
        private String logo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicantInfo {
        private String id;
        private String fullName;
        private String avatar;
        private String location;
        private List<String> skills;
    }
}
