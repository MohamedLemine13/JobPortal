package com.jobportal.dto.profile;

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
public class JobSeekerProfileDto {
    private String id;
    private String fullName;
    private String avatar;
    private String phone;
    private String location;
    private String bio;
    private List<String> skills;
    private String experience;
    private CvDto cv;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CvDto {
        private String fileName;
        private String fileUrl;
        private Integer fileSize;
        private LocalDateTime uploadedAt;
    }
}
