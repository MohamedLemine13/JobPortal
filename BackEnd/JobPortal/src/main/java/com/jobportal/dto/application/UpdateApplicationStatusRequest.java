package com.jobportal.dto.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateApplicationStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "pending|reviewed|shortlisted|interview|hired|rejected", message = "Invalid status value")
    private String status;

    private String notes;
}
