package com.jobportal.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder(builderClassName = "Builder")
public class UserDetailDto {
    private String id;
    private String email;
    private String role;
    private String fullName;
    private String phone;
    private String location;
    private String companyName;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private Integer failedLoginAttempts;
    private LocalDateTime accountLockedUntil;
}
