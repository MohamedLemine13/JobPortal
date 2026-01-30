package com.jobportal.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDto {
    private String id;
    private String applicantName;
    private String applicantEmail;
    private String coverLetter;
    private String resumeUrl;
    private String status;
    private LocalDateTime appliedAt;
}
