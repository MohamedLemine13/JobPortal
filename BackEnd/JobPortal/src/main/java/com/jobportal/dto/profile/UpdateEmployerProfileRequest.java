package com.jobportal.dto.profile;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployerProfileRequest {

    @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
    private String fullName;

    @Size(min = 2, max = 255, message = "Company name must be between 2 and 255 characters")
    private String companyName;

    @Size(max = 100, message = "Company type must be at most 100 characters")
    private String companyType;

    @Size(max = 100, message = "Industry must be at most 100 characters")
    private String industry;

    @Size(max = 50, message = "Company size must be at most 50 characters")
    private String companySize;

    @Size(max = 500, message = "Website must be at most 500 characters")
    private String website;

    @Size(max = 255, message = "Location must be at most 255 characters")
    private String location;

    private String description;

    private Integer foundedYear;
}
