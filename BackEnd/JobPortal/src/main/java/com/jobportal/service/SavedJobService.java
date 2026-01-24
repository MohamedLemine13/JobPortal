package com.jobportal.service;

import com.jobportal.dto.job.JobListItemDto;
import com.jobportal.dto.savedjob.SavedJobDto;
import com.jobportal.dto.savedjob.SavedJobListResponse;
import com.jobportal.entity.EmployerProfile;
import com.jobportal.entity.Job;
import com.jobportal.entity.SavedJob;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.EmployerProfileRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.SavedJobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public void saveJob(UUID jobId) {
        UUID userId = securityUtils.getCurrentUserId();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        // Check if already saved
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return; // Already saved, idempotent
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .savedAt(LocalDateTime.now())
                .build();

        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(UUID jobId) {
        UUID userId = securityUtils.getCurrentUserId();

        // Check if job exists (optional, maybe we just want to delete the saved record)
        if (!jobRepository.existsById(jobId)) {
            throw new ResourceNotFoundException("Job", "id", jobId);
        }

        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    @Transactional(readOnly = true)
    public SavedJobListResponse getSavedJobs() {
        UUID userId = securityUtils.getCurrentUserId();

        List<SavedJob> savedJobs = savedJobRepository.findByUserId(userId);

        List<SavedJobDto> savedJobDtos = savedJobs.stream()
                .map(this::mapToSavedJobDto)
                .collect(Collectors.toList());

        return SavedJobListResponse.builder()
                .savedJobs(savedJobDtos)
                .build();
    }

    private SavedJobDto mapToSavedJobDto(SavedJob savedJob) {
        Job job = savedJob.getJob();
        EmployerProfile profile = employerProfileRepository.findByUser(job.getEmployer()).orElse(null);

        JobListItemDto.CompanyInfo companyInfo = null;
        if (profile != null) {
            companyInfo = JobListItemDto.CompanyInfo.builder()
                    .id(profile.getId().toString())
                    .name(profile.getCompanyName())
                    .logo(profile.getCompanyLogo())
                    .build();
        }

        JobListItemDto jobDto = JobListItemDto.builder()
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

        return SavedJobDto.builder()
                .id(savedJob.getId().toString())
                .job(jobDto)
                .savedAt(savedJob.getSavedAt())
                .build();
    }
}
