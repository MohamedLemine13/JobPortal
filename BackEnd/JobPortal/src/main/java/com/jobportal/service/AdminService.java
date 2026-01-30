package com.jobportal.service;

import com.jobportal.dto.admin.*;
import com.jobportal.entity.*;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;

    /**
     * Get dashboard statistics
     */
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalJobSeekers = userRepository.countByRole(UserRole.JOB_SEEKER);
        long totalEmployers = userRepository.countByRole(UserRole.EMPLOYER);
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus(JobStatus.ACTIVE);
        long totalApplications = applicationRepository.count();

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalJobSeekers(totalJobSeekers)
                .totalEmployers(totalEmployers)
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .totalApplications(totalApplications)
                .build();
    }

    /**
     * Get all users with pagination
     */
    public Page<UserListDto> getAllUsers(Pageable pageable, String role) {
        Page<User> users;
        if (role != null && !role.isEmpty()) {
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                users = userRepository.findByRole(userRole, pageable);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll(pageable);
            }
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::mapToUserListDto);
    }

    /**
     * Get user details by ID
     */
    public UserDetailDto getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        return mapToUserDetailDto(user);
    }

    /**
     * Delete a user
     */
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        // Prevent deleting admin users
        if (user.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Cannot delete admin users");
        }

        userRepository.delete(user);
        log.info("Admin deleted user: {}", userId);
    }

    /**
     * Toggle user verification status
     */
    @Transactional
    public UserDetailDto toggleUserVerification(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        user.setIsVerified(!user.getIsVerified());
        userRepository.save(user);

        log.info("Admin toggled verification for user {}: now {}", userId, user.getIsVerified());
        return mapToUserDetailDto(user);
    }

    /**
     * Get all jobs with pagination (admin view)
     */
    public Page<JobListDto> getAllJobs(Pageable pageable, String status) {
        Page<Job> jobs;
        if (status != null && !status.isEmpty()) {
            try {
                JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
                jobs = jobRepository.findByStatus(jobStatus, pageable);
            } catch (IllegalArgumentException e) {
                jobs = jobRepository.findAll(pageable);
            }
        } else {
            jobs = jobRepository.findAll(pageable);
        }

        return jobs.map(this::mapToJobListDto);
    }

    /**
     * Delete a job
     */
    @Transactional
    public void deleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId.toString()));

        jobRepository.delete(job);
        log.info("Admin deleted job: {}", jobId);
    }

    private UserListDto mapToUserListDto(User user) {
        String name = null;
        if (user.getRole() == UserRole.JOB_SEEKER) {
            name = jobSeekerProfileRepository.findByUserId(user.getId())
                    .map(JobSeekerProfile::getFullName)
                    .orElse(null);
        } else if (user.getRole() == UserRole.EMPLOYER) {
            name = employerProfileRepository.findByUserId(user.getId())
                    .map(EmployerProfile::getFullName)
                    .orElse(null);
        } else if (user.getRole() == UserRole.ADMIN) {
            name = "Administrator";
        }

        return UserListDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(name)
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private UserDetailDto mapToUserDetailDto(User user) {
        UserDetailDto.Builder builder = UserDetailDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .failedLoginAttempts(user.getFailedLoginAttempts())
                .accountLockedUntil(user.getAccountLockedUntil());

        if (user.getRole() == UserRole.JOB_SEEKER) {
            jobSeekerProfileRepository.findByUserId(user.getId())
                    .ifPresent(profile -> {
                        builder.fullName(profile.getFullName());
                        builder.phone(profile.getPhone());
                        builder.location(profile.getLocation());
                    });
        } else if (user.getRole() == UserRole.EMPLOYER) {
            employerProfileRepository.findByUserId(user.getId())
                    .ifPresent(profile -> {
                        builder.fullName(profile.getFullName());
                        builder.companyName(profile.getCompanyName());
                        builder.location(profile.getLocation());
                    });
        } else if (user.getRole() == UserRole.ADMIN) {
            builder.fullName("Administrator");
        }

        return builder.build();
    }

    private JobListDto mapToJobListDto(Job job) {
        String companyName = employerProfileRepository.findByUserId(job.getEmployer().getId())
                .map(EmployerProfile::getCompanyName)
                .orElse("Unknown Company");

        return JobListDto.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .companyName(companyName)
                .location(job.getLocation())
                .status(job.getStatus().name())
                .createdAt(job.getCreatedAt())
                .applicationCount(job.getApplications() != null ? job.getApplications().size() : 0)
                .build();
    }
}
