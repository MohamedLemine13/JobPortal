package com.jobportal.service;

import com.jobportal.dto.common.PaginationResponse;
import com.jobportal.dto.job.*;
import com.jobportal.entity.*;
import com.jobportal.exception.ForbiddenException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.EmployerProfileRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.SavedJobRepository;
import com.jobportal.repository.UserRepository;
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
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SavedJobRepository savedJobRepository;
    private final ApplicationRepository applicationRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public JobListResponse getJobs(int page, int limit, String search, String location, String type,
            String category, String experienceLevel, String sortBy, String sortOrder) {

        // Prepare pagination and sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "postedAt");
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
            if ("salary".equalsIgnoreCase(sortBy)) {
                sort = Sort.by(direction, "salaryMax"); // Sort by max salary
            } else if ("title".equalsIgnoreCase(sortBy)) {
                sort = Sort.by(direction, "title");
            } else if ("postedAt".equalsIgnoreCase(sortBy)) {
                sort = Sort.by(direction, "postedAt");
            }
        }

        int pageIndex = (page > 0) ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageIndex, limit, sort);

        // Parse enums if present
        JobType jobType = null;
        if (type != null && !type.isEmpty()) {
            try {
                jobType = JobType.fromValue(type);
            } catch (Exception ignored) {
            }
        }

        ExperienceLevel expLevel = null;
        if (experienceLevel != null && !experienceLevel.isEmpty()) {
            try {
                expLevel = ExperienceLevel.fromValue(experienceLevel);
            } catch (Exception ignored) {
            }
        }

        // Sanitize string parameters to avoid null binding issues in Hibernate
        String safeSearch = search != null ? search : "";
        String safeLocation = location != null ? location : "";
        String safeCategory = category != null ? category : "";

        // Execute search
        Page<Job> jobsPage = jobRepository.searchJobs(
                JobStatus.ACTIVE,
                safeSearch,
                safeLocation,
                jobType,
                safeCategory,
                expLevel,
                pageable);

        List<JobListItemDto> jobDtos = jobsPage.getContent().stream()
                .map(this::mapToJobListItemDto)
                .collect(Collectors.toList());

        return JobListResponse.builder()
                .jobs(jobDtos)
                .pagination(PaginationResponse.of(page, limit, jobsPage.getTotalElements()))
                .build();
    }

    @Transactional
    public JobDetailResponse getJob(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        // Increment view count
        jobRepository.incrementViewCount(id);

        // Check if user has applied or saved (if authenticated)
        boolean hasApplied = false;
        boolean isSaved = false;
        UUID currentUserId = securityUtils.getCurrentUserId();

        if (currentUserId != null && securityUtils.isJobSeeker()) {
            hasApplied = applicationRepository.existsByJobIdAndApplicantId(id, currentUserId);
            isSaved = savedJobRepository.existsByUserIdAndJobId(currentUserId, id);
        }

        return JobDetailResponse.builder()
                .job(mapToJobDto(job))
                .hasApplied(hasApplied)
                .isSaved(isSaved)
                .build();
    }

    @Transactional
    public JobDto createJob(CreateJobRequest request) {
        UUID employerId = securityUtils.getCurrentUserId();
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", employerId));

        // Validate enums
        JobType type = JobType.fromValue(request.getType());
        SalaryPeriod salaryPeriod = null;
        if (request.getSalaryPeriod() != null) {
            salaryPeriod = SalaryPeriod.fromValue(request.getSalaryPeriod());
        }
        ExperienceLevel experienceLevel = null;
        if (request.getExperienceLevel() != null) {
            experienceLevel = ExperienceLevel.fromValue(request.getExperienceLevel());
        }
        JobStatus status = JobStatus.ACTIVE;
        if (request.getStatus() != null) {
            status = JobStatus.fromValue(request.getStatus());
        }

        Job job = Job.builder()
                .employer(employer)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .type(type)
                .category(request.getCategory())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .salaryCurrency(request.getSalaryCurrency() != null ? request.getSalaryCurrency() : "USD")
                .salaryPeriod(salaryPeriod)
                .experienceLevel(experienceLevel)
                .skills(request.getSkills())
                .benefits(request.getBenefits())
                .status(status)
                .postedAt(java.time.LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .applicantsCount(0)
                .viewsCount(0)
                .build();

        job = jobRepository.save(job);

        return mapToJobDto(job);
    }

    @Transactional
    public JobDto updateJob(UUID id, UpdateJobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        // Check ownership
        UUID currentUserId = securityUtils.getCurrentUserId();
        if (!job.getEmployer().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to update this job");
        }

        if (request.getTitle() != null)
            job.setTitle(request.getTitle());
        if (request.getDescription() != null)
            job.setDescription(request.getDescription());
        if (request.getRequirements() != null)
            job.setRequirements(request.getRequirements());
        if (request.getLocation() != null)
            job.setLocation(request.getLocation());

        if (request.getType() != null) {
            job.setType(JobType.fromValue(request.getType()));
        }

        if (request.getCategory() != null)
            job.setCategory(request.getCategory());
        if (request.getSalaryMin() != null)
            job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null)
            job.setSalaryMax(request.getSalaryMax());
        if (request.getSalaryCurrency() != null)
            job.setSalaryCurrency(request.getSalaryCurrency());

        if (request.getSalaryPeriod() != null) {
            job.setSalaryPeriod(SalaryPeriod.fromValue(request.getSalaryPeriod()));
        }

        if (request.getExperienceLevel() != null) {
            job.setExperienceLevel(ExperienceLevel.fromValue(request.getExperienceLevel()));
        }

        if (request.getSkills() != null)
            job.setSkills(request.getSkills());
        if (request.getBenefits() != null)
            job.setBenefits(request.getBenefits());

        if (request.getStatus() != null) {
            job.setStatus(JobStatus.fromValue(request.getStatus()));
        }

        if (request.getExpiresAt() != null)
            job.setExpiresAt(request.getExpiresAt());

        job = jobRepository.save(job);

        return mapToJobDto(job);
    }

    @Transactional
    public void deleteJob(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        // Check ownership
        UUID currentUserId = securityUtils.getCurrentUserId();
        if (!job.getEmployer().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public EmployerJobsResponse getEmployerJobs(String status, int page, int limit) {
        UUID employerId = securityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "postedAt"));

        Page<Job> jobsPage;
        if (status != null && !status.isEmpty()) {
            JobStatus jobStatus = JobStatus.fromValue(status);
            jobsPage = jobRepository.findByEmployerIdAndStatus(employerId, jobStatus, pageable);
        } else {
            jobsPage = jobRepository.findByEmployerId(employerId, pageable);
        }

        List<JobListItemDto> jobDtos = jobsPage.getContent().stream()
                .map(this::mapToJobListItemDto)
                .collect(Collectors.toList());

        // Calculate stats
        long totalJobs = jobRepository.countByEmployerId(employerId);
        long activeJobs = jobRepository.countByEmployerIdAndStatus(employerId, JobStatus.ACTIVE);
        Long totalApplicants = jobRepository.getTotalApplicantsByEmployer(employerId);
        long hiredCount = applicationRepository.countHiredByEmployer(employerId);

        EmployerJobsResponse.EmployerJobStats stats = EmployerJobsResponse.EmployerJobStats.builder()
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .totalApplicants(totalApplicants != null ? totalApplicants : 0)
                .hiredCount(hiredCount)
                .build();

        return EmployerJobsResponse.builder()
                .jobs(jobDtos)
                .stats(stats)
                .pagination(PaginationResponse.of(page, limit, jobsPage.getTotalElements()))
                .build();
    }

    private JobDto mapToJobDto(Job job) {
        EmployerProfile profile = employerProfileRepository.findByUser(job.getEmployer()).orElse(null);

        JobDto.CompanyDto companyDto = null;
        if (profile != null) {
            companyDto = JobDto.CompanyDto.builder()
                    .id(profile.getId().toString())
                    .name(profile.getCompanyName())
                    .logo(profile.getCompanyLogo())
                    .description(profile.getDescription())
                    .size(profile.getCompanySize())
                    .industry(profile.getIndustry())
                    .build();
        }

        return JobDto.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .company(companyDto)
                .location(job.getLocation())
                .type(job.getType().getValue())
                .category(job.getCategory())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryCurrency(job.getSalaryCurrency())
                .salaryPeriod(job.getSalaryPeriod() != null ? job.getSalaryPeriod().getValue() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().getValue() : null)
                .skills(job.getSkills())
                .benefits(job.getBenefits())
                .status(job.getStatus().getValue())
                .applicantsCount(job.getApplicantsCount())
                .viewsCount(job.getViewsCount())
                .postedAt(job.getPostedAt())
                .expiresAt(job.getExpiresAt())
                .build();
    }

    private JobListItemDto mapToJobListItemDto(Job job) {
        EmployerProfile profile = employerProfileRepository.findByUser(job.getEmployer()).orElse(null);

        JobListItemDto.CompanyInfo companyInfo = null;
        if (profile != null) {
            companyInfo = JobListItemDto.CompanyInfo.builder()
                    .id(profile.getId().toString())
                    .name(profile.getCompanyName())
                    .logo(profile.getCompanyLogo())
                    .build();
        }

        return JobListItemDto.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .company(companyInfo)
                .location(job.getLocation())
                .type(job.getType().getValue())
                .category(job.getCategory())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryCurrency(job.getSalaryCurrency())
                .salaryPeriod(job.getSalaryPeriod() != null ? job.getSalaryPeriod().getValue() : null)
                .postedAt(job.getPostedAt())
                .applicantsCount(job.getApplicantsCount())
                .build();
    }
}
