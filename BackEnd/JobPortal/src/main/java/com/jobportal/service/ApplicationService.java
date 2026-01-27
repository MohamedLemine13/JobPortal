package com.jobportal.service;

import com.jobportal.dto.application.*;
import com.jobportal.dto.common.PaginationResponse;
import com.jobportal.entity.*;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ConflictException;
import com.jobportal.exception.ForbiddenException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import com.jobportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public ApplicationDto applyJob(ApplyJobRequest request) {
        UUID applicantId = securityUtils.getCurrentUserId();
        UUID jobId;
        try {
            jobId = UUID.fromString(request.getJobId());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid job ID format");
        }

        // Validate user is job seeker
        if (!securityUtils.isJobSeeker()) {
            throw new ForbiddenException("Only job seekers can apply to jobs");
        }

        // Find job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        // Check if job is active
        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        // Check if already applied
        if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicantId)) {
            throw new ConflictException("You have already applied to this job");
        }

        // Get applicant user
        User applicant = userRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", applicantId));

        // Get applicant profile for CV (optional)
        String cvUrl = null;
        JobSeekerProfile profile = jobSeekerProfileRepository.findByUserId(applicantId).orElse(null);
        if (profile != null && profile.getCvFileUrl() != null) {
            cvUrl = profile.getCvFileUrl();
        }

        // Create application
        Application application = Application.builder()
                .job(job)
                .applicant(applicant)
                .coverLetter(request.getCoverLetter())
                .cvUrl(cvUrl)
                .status(ApplicationStatus.PENDING)
                .appliedAt(java.time.LocalDateTime.now())
                .build();

        application = applicationRepository.save(application);

        // Increment applicants count
        // update_applicants_count trigger will handle this in DB, but for JPA cache
        // consistency we might need to refresh
        // For now rely on DB trigger or manually update job entity
        job.setApplicantsCount(job.getApplicantsCount() + 1);
        jobRepository.save(job);

        return mapToApplicationDto(application);
    }

    @Transactional(readOnly = true)
    public ApplicationListResponse getMyApplications(String status, int page, int limit) {
        UUID applicantId = securityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<Application> applicationsPage;
        if (status != null && !status.isEmpty()) {
            ApplicationStatus appStatus = ApplicationStatus.fromValue(status);
            applicationsPage = applicationRepository.findByApplicantIdAndStatus(applicantId, appStatus, pageable);
        } else {
            applicationsPage = applicationRepository.findByApplicantId(applicantId, pageable);
        }

        List<ApplicationDto> applicationDtos = applicationsPage.getContent().stream()
                .map(this::mapToApplicationDto)
                .collect(Collectors.toList());

        return ApplicationListResponse.builder()
                .applications(applicationDtos)
                .pagination(PaginationResponse.of(page, limit, applicationsPage.getTotalElements()))
                .build();
    }

    @Transactional(readOnly = true)
    public ApplicationListResponse getEmployerApplications(int page, int limit) {
        UUID employerId = securityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<Application> applicationsPage = applicationRepository.findByEmployerId(employerId, pageable);

        List<ApplicationDto> applicationDtos = applicationsPage.getContent().stream()
                .map(this::mapToApplicationDto)
                .collect(Collectors.toList());

        return ApplicationListResponse.builder()
                .applications(applicationDtos)
                .pagination(PaginationResponse.of(page, limit, applicationsPage.getTotalElements()))
                .build();
    }

    @Transactional(readOnly = true)
    public ApplicationListResponse getJobApplications(UUID jobId, String status, int page, int limit) {
        // Validate job ownership
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        UUID currentUserId = securityUtils.getCurrentUserId();
        if (!job.getEmployer().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to view applications for this job");
        }

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<Application> applicationsPage;
        if (status != null && !status.isEmpty()) {
            ApplicationStatus appStatus = ApplicationStatus.fromValue(status);
            applicationsPage = applicationRepository.findByJobIdAndStatus(jobId, appStatus, pageable);
        } else {
            applicationsPage = applicationRepository.findByJobId(jobId, pageable);
        }

        List<ApplicationDto> applicationDtos = applicationsPage.getContent().stream()
                .map(this::mapToApplicationDto)
                .collect(Collectors.toList());

        return ApplicationListResponse.builder()
                .applications(applicationDtos)
                .pagination(PaginationResponse.of(page, limit, applicationsPage.getTotalElements()))
                .build();
    }

    @Transactional
    public ApplicationDto updateApplicationStatus(UUID id, UpdateApplicationStatusRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        // Validate job ownership
        UUID currentUserId = securityUtils.getCurrentUserId();
        if (!application.getJob().getEmployer().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to update this application");
        }

        ApplicationStatus status = ApplicationStatus.fromValue(request.getStatus());
        application.setStatus(status);

        if (status == ApplicationStatus.REVIEWED && application.getReviewedAt() == null) {
            application.setReviewedAt(java.time.LocalDateTime.now());
        }

        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }

        application = applicationRepository.save(application);
        return mapToApplicationDto(application);
    }

    private ApplicationDto mapToApplicationDto(Application application) {
        Job job = application.getJob();
        EmployerProfile employerProfile = employerProfileRepository.findByUser(job.getEmployer()).orElse(null);

        ApplicationDto.CompanyInfo companyInfo = null;
        if (employerProfile != null) {
            companyInfo = ApplicationDto.CompanyInfo.builder()
                    .name(employerProfile.getCompanyName())
                    .logo(employerProfile.getCompanyLogo())
                    .build();
        }

        ApplicationDto.JobInfo jobInfo = ApplicationDto.JobInfo.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .company(companyInfo)
                .location(job.getLocation())
                .employerId(job.getEmployer() != null ? job.getEmployer().getId().toString() : null)
                .build();

        ApplicationDto.ApplicantInfo applicantInfo = null;
        // Only include full applicant info if user is employer
        if (securityUtils.isEmployer()) {
            JobSeekerProfile applicantProfile = jobSeekerProfileRepository.findByUser(application.getApplicant())
                    .orElse(null);
            if (applicantProfile != null) {
                applicantInfo = ApplicationDto.ApplicantInfo.builder()
                        .id(applicantProfile.getId().toString())
                        .fullName(applicantProfile.getFullName())
                        .email(application.getApplicant().getEmail())
                        .phone(applicantProfile.getPhone())
                        .avatar(applicantProfile.getAvatarUrl())
                        .location(applicantProfile.getLocation())
                        .bio(applicantProfile.getBio())
                        .skills(applicantProfile.getSkills())
                        .build();
            } else {
                // Fallback when profile doesn't exist - use email as name
                String email = application.getApplicant().getEmail();
                String displayName = email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
                applicantInfo = ApplicationDto.ApplicantInfo.builder()
                        .id(application.getApplicant().getId().toString())
                        .fullName(displayName)
                        .email(email)
                        .build();
            }
        }

        return ApplicationDto.builder()
                .id(application.getId().toString())
                .job(jobInfo)
                .applicant(applicantInfo)
                .status(application.getStatus().getValue())
                .coverLetter(application.getCoverLetter())
                .cvUrl(application.getCvUrl())
                .appliedAt(application.getAppliedAt())
                .reviewedAt(application.getReviewedAt())
                .notes(application.getNotes())
                .build();
    }
}
