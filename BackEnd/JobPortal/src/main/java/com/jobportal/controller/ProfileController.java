package com.jobportal.controller;

import com.jobportal.dto.common.ApiResponse;
import com.jobportal.dto.profile.*;
import com.jobportal.service.ProfileService;
import com.jobportal.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getCurrentProfile() {
        ProfileResponse response = profileService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me/job-seeker")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateJobSeekerProfile(
            @Valid @RequestBody UpdateJobSeekerProfileRequest request) {

        JobSeekerProfileDto profile = profileService.updateJobSeekerProfile(request);

        ProfileResponse response = ProfileResponse.builder()
                .user(ProfileResponse.UserInfo.builder()
                        .id(securityUtils.getCurrentUserId().toString())
                        .email(securityUtils.getCurrentUserEmail())
                        .role("job_seeker")
                        .build())
                .profile(profile)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }

    @PutMapping("/me/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateEmployerProfile(
            @Valid @RequestBody UpdateEmployerProfileRequest request) {

        EmployerProfileDto profile = profileService.updateEmployerProfile(request);

        ProfileResponse response = ProfileResponse.builder()
                .user(ProfileResponse.UserInfo.builder()
                        .id(securityUtils.getCurrentUserId().toString())
                        .email(securityUtils.getCurrentUserEmail())
                        .role("employer")
                        .build())
                .profile(profile)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("avatar") MultipartFile file) {

        String avatarUrl = profileService.uploadAvatar(file);
        return ResponseEntity.ok(
                ApiResponse.success(Collections.singletonMap("avatarUrl", avatarUrl), "Avatar uploaded successfully"));
    }

    @PostMapping(value = "/me/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<JobSeekerProfileDto.CvDto>> uploadCv(
            @RequestParam("cv") MultipartFile file) {

        JobSeekerProfileDto.CvDto cvDto = profileService.uploadCv(file);
        return ResponseEntity.ok(ApiResponse.success(cvDto, "CV uploaded successfully"));
    }

    @DeleteMapping("/me/cv")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<Void>> deleteCv() {
        profileService.deleteCv();
        return ResponseEntity.ok(ApiResponse.success("CV deleted successfully"));
    }
}
