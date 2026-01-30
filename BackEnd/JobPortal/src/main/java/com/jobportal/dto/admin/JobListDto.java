package com.jobportal.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobListDto {
    private String id;
    private String title;
    private String companyName;
    private String location;
    private String status;
    private LocalDateTime createdAt;
    private int applicationCount;
}
