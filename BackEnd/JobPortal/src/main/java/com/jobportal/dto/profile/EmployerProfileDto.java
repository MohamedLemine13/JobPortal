package com.jobportal.dto.profile;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployerProfileDto {
    private String id;
    private String fullName;
    private String avatar;
    private String companyName;
    private String companyLogo;
    private String companyType;
    private String industry;
    private String companySize;
    private String website;
    private String location;
    private String description;
    private Integer foundedYear;
}
