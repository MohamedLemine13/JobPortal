package com.jobportal.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserListDto {
    private String id;
    private String email;
    private String role;
    private String fullName;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
