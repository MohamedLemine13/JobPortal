package com.jobportal.service;

import com.jobportal.dto.profile.*;
import com.jobportal.entity.*;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import com.jobportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SecurityUtils securityUtils;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public ProfileResponse getCurrentUserProfile() {
        UUID userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Object profile;
        if (user.getRole() == UserRole.JOB_SEEKER) {
            profile = jobSeekerProfileRepository.findByUserId(userId)
                    .map(this::mapToJobSeekerProfileDto)
                    .orElse(null);
        } else {
            profile = employerProfileRepository.findByUserId(userId)
                    .map(this::mapToEmployerProfileDto)
                    .orElse(null);
        }

        return ProfileResponse.builder()
                .user(ProfileResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .role(user.getRole().name().toLowerCase())
                        .build())
                .profile(profile)
                .build();
    }

    @Transactional
    public JobSeekerProfileDto updateJobSeekerProfile(UpdateJobSeekerProfileRequest request) {
        UUID userId = securityUtils.getCurrentUserId();

        JobSeekerProfile profile = jobSeekerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getSkills() != null) {
            profile.setSkills(request.getSkills());
        }
        if (request.getExperience() != null) {
            profile.setExperience(request.getExperience());
        }

        profile = jobSeekerProfileRepository.save(profile);
        return mapToJobSeekerProfileDto(profile);
    }

    @Transactional
    public EmployerProfileDto updateEmployerProfile(UpdateEmployerProfileRequest request) {
        UUID userId = securityUtils.getCurrentUserId();

        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName());
        }
        if (request.getCompanyName() != null) {
            profile.setCompanyName(request.getCompanyName());
        }
        if (request.getCompanyType() != null) {
            profile.setCompanyType(request.getCompanyType());
        }
        if (request.getIndustry() != null) {
            profile.setIndustry(request.getIndustry());
        }
        if (request.getCompanySize() != null) {
            profile.setCompanySize(request.getCompanySize());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getDescription() != null) {
            profile.setDescription(request.getDescription());
        }
        if (request.getFoundedYear() != null) {
            profile.setFoundedYear(request.getFoundedYear());
        }

        profile = employerProfileRepository.save(profile);
        return mapToEmployerProfileDto(profile);
    }

    @Transactional
    public String uploadAvatar(MultipartFile file) {
        UUID userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate file
        validateImageFile(file);

        // Store file
        String avatarUrl = fileStorageService.storeFile(file, "avatars/" + userId);

        // Update profile
        if (user.getRole() == UserRole.JOB_SEEKER) {
            JobSeekerProfile profile = jobSeekerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            profile.setAvatarUrl(avatarUrl);
            jobSeekerProfileRepository.save(profile);
        } else {
            EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            profile.setAvatarUrl(avatarUrl);
            employerProfileRepository.save(profile);
        }

        return avatarUrl;
    }

    @Transactional
    public JobSeekerProfileDto.CvDto uploadCv(MultipartFile file) {
        UUID userId = securityUtils.getCurrentUserId();

        JobSeekerProfile profile = jobSeekerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        // Validate file
        validatePdfFile(file);

        // Store file
        String cvUrl = fileStorageService.storeFile(file, "cvs/" + userId);

        // Update profile
        profile.setCvFileName(file.getOriginalFilename());
        profile.setCvFileUrl(cvUrl);
        profile.setCvFileSize((int) file.getSize());
        profile.setCvUploadedAt(java.time.LocalDateTime.now());

        jobSeekerProfileRepository.save(profile);

        return JobSeekerProfileDto.CvDto.builder()
                .fileName(profile.getCvFileName())
                .fileUrl(profile.getCvFileUrl())
                .fileSize(profile.getCvFileSize())
                .uploadedAt(profile.getCvUploadedAt())
                .build();
    }

    @Transactional
    public void deleteCv() {
        UUID userId = securityUtils.getCurrentUserId();

        JobSeekerProfile profile = jobSeekerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (profile.getCvFileUrl() != null) {
            fileStorageService.deleteFile(profile.getCvFileUrl());
        }

        profile.setCvFileName(null);
        profile.setCvFileUrl(null);
        profile.setCvFileSize(null);
        profile.setCvUploadedAt(null);

        jobSeekerProfileRepository.save(profile);
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg") &&
                        !contentType.equals("image/png") &&
                        !contentType.equals("image/webp"))) {
            throw new BadRequestException("Only JPG, PNG, and WebP images are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new BadRequestException("File size must be less than 5MB");
        }
    }

    private void validatePdfFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new BadRequestException("Only PDF files are allowed");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new BadRequestException("File size must be less than 10MB");
        }
    }

    private JobSeekerProfileDto mapToJobSeekerProfileDto(JobSeekerProfile profile) {
        JobSeekerProfileDto.CvDto cvDto = null;
        if (profile.getCvFileUrl() != null) {
            cvDto = JobSeekerProfileDto.CvDto.builder()
                    .fileName(profile.getCvFileName())
                    .fileUrl(profile.getCvFileUrl())
                    .fileSize(profile.getCvFileSize())
                    .uploadedAt(profile.getCvUploadedAt())
                    .build();
        }

        return JobSeekerProfileDto.builder()
                .id(profile.getId().toString())
                .fullName(profile.getFullName())
                .avatar(profile.getAvatarUrl())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .bio(profile.getBio())
                .skills(profile.getSkills())
                .experience(profile.getExperience())
                .cv(cvDto)
                .build();
    }

    private EmployerProfileDto mapToEmployerProfileDto(EmployerProfile profile) {
        return EmployerProfileDto.builder()
                .id(profile.getId().toString())
                .fullName(profile.getFullName())
                .avatar(profile.getAvatarUrl())
                .companyName(profile.getCompanyName())
                .companyLogo(profile.getCompanyLogo())
                .companyType(profile.getCompanyType())
                .industry(profile.getIndustry())
                .companySize(profile.getCompanySize())
                .website(profile.getWebsite())
                .location(profile.getLocation())
                .description(profile.getDescription())
                .foundedYear(profile.getFoundedYear())
                .build();
    }
}
