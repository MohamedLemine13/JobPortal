package com.jobportal.service;

import com.jobportal.entity.*;
import com.jobportal.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service that builds dynamic context for the chatbot based on user role and
 * question.
 * This context is injected into the RAG pipeline to provide real-time
 * application data.
 */
@Service
public class ChatContextService {

    private static final Logger log = LoggerFactory.getLogger(ChatContextService.class);
    private static final int MAX_JOBS_IN_CONTEXT = 20;
    private static final int MAX_APPLICATIONS_IN_CONTEXT = 15;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SavedJobRepository savedJobRepository;

    public ChatContextService(
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            JobSeekerProfileRepository jobSeekerProfileRepository,
            EmployerProfileRepository employerProfileRepository,
            SavedJobRepository savedJobRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.jobSeekerProfileRepository = jobSeekerProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.savedJobRepository = savedJobRepository;
    }

    /**
     * Build context for a user based on their role.
     *
     * @param userId The authenticated user's ID
     * @param role   The user's role (JOB_SEEKER or EMPLOYER)
     * @return Formatted context string for the LLM
     */
    public String buildContextForUser(UUID userId, UserRole role) {
        if (role == null || userId == null) {
            return "";
        }

        StringBuilder context = new StringBuilder();
        context.append("=== APPLICATION DATA CONTEXT ===\n\n");

        switch (role) {
            case JOB_SEEKER:
                context.append(buildJobSeekerContext(userId));
                break;
            case EMPLOYER:
                context.append(buildEmployerContext(userId));
                break;
            case ADMIN:
                context.append(buildAdminContext());
                break;
            default:
                return "";
        }

        context.append("\n=== END OF CONTEXT ===\n");
        return context.toString();
    }

    /**
     * Build context for a job seeker.
     */
    private String buildJobSeekerContext(UUID userId) {
        StringBuilder sb = new StringBuilder();

        // User profile
        jobSeekerProfileRepository.findByUserId(userId).ifPresent(profile -> {
            sb.append("YOUR PROFILE:\n");
            sb.append("- Name: ").append(profile.getFullName()).append("\n");
            if (profile.getLocation() != null) {
                sb.append("- Location: ").append(profile.getLocation()).append("\n");
            }
            if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                sb.append("- Skills: ").append(String.join(", ", profile.getSkills())).append("\n");
            }
            if (profile.getExperience() != null) {
                sb.append("- Experience: ").append(profile.getExperience()).append("\n");
            }
            if (profile.getCvFileUrl() != null) {
                sb.append("- CV uploaded: Yes\n");
            } else {
                sb.append("- CV uploaded: No (you need to upload a CV to apply for jobs)\n");
            }
            sb.append("\n");
        });

        // Available jobs
        var activeJobs = jobRepository.findByStatus(
                JobStatus.ACTIVE,
                PageRequest.of(0, MAX_JOBS_IN_CONTEXT, Sort.by(Sort.Direction.DESC, "postedAt")));

        if (!activeJobs.isEmpty()) {
            sb.append("AVAILABLE JOBS (").append(activeJobs.getTotalElements()).append(" total):\n");
            int index = 1;
            for (Job job : activeJobs.getContent()) {
                sb.append(index++).append(". ")
                        .append(job.getTitle())
                        .append(" at ").append(getCompanyName(job))
                        .append(" - ").append(job.getLocation())
                        .append(" (").append(formatJobType(job.getType())).append(")");

                if (job.getSalaryMin() != null && job.getSalaryMax() != null) {
                    sb.append(" - $").append(job.getSalaryMin().intValue())
                            .append("-$").append(job.getSalaryMax().intValue());
                }
                sb.append("\n");
            }
            sb.append("\n");
        }

        // User's applications
        var applications = applicationRepository.findByApplicantId(
                userId,
                PageRequest.of(0, MAX_APPLICATIONS_IN_CONTEXT, Sort.by(Sort.Direction.DESC, "appliedAt")));

        if (!applications.isEmpty()) {
            sb.append("YOUR APPLICATIONS (").append(applications.getTotalElements()).append(" total):\n");
            for (Application app : applications.getContent()) {
                sb.append("- ").append(app.getJob().getTitle())
                        .append(" at ").append(getCompanyName(app.getJob()))
                        .append(" - Status: ").append(formatStatus(app.getStatus()));

                if (app.getAppliedAt() != null) {
                    sb.append(" (Applied: ").append(app.getAppliedAt().format(DATE_FORMAT)).append(")");
                }
                sb.append("\n");
            }
            sb.append("\n");
        } else {
            sb.append("YOUR APPLICATIONS: You haven't applied to any jobs yet.\n\n");
        }

        // Saved jobs
        var savedJobs = savedJobRepository.findByUserId(userId);
        if (!savedJobs.isEmpty()) {
            sb.append("YOUR SAVED JOBS (").append(savedJobs.size()).append("):\n");
            for (SavedJob saved : savedJobs) {
                sb.append("- ").append(saved.getJob().getTitle())
                        .append(" at ").append(getCompanyName(saved.getJob()))
                        .append("\n");
            }
        }

        return sb.toString();
    }

    /**
     * Build context for an employer.
     */
    private String buildEmployerContext(UUID userId) {
        StringBuilder sb = new StringBuilder();

        // Company profile
        employerProfileRepository.findByUserId(userId).ifPresent(profile -> {
            sb.append("YOUR COMPANY PROFILE:\n");
            sb.append("- Company: ").append(profile.getCompanyName()).append("\n");
            if (profile.getIndustry() != null) {
                sb.append("- Industry: ").append(profile.getIndustry()).append("\n");
            }
            if (profile.getCompanySize() != null) {
                sb.append("- Size: ").append(profile.getCompanySize()).append("\n");
            }
            if (profile.getLocation() != null) {
                sb.append("- Location: ").append(profile.getLocation()).append("\n");
            }
            sb.append("\n");
        });

        // Employer's jobs
        var jobs = jobRepository.findByEmployerId(
                userId,
                PageRequest.of(0, MAX_JOBS_IN_CONTEXT, Sort.by(Sort.Direction.DESC, "createdAt")));

        if (!jobs.isEmpty()) {
            sb.append("YOUR POSTED JOBS (").append(jobs.getTotalElements()).append(" total):\n");
            int totalApplications = 0;
            for (Job job : jobs.getContent()) {
                int appCount = job.getApplicantsCount() != null ? job.getApplicantsCount() : 0;
                totalApplications += appCount;
                sb.append("- ").append(job.getTitle())
                        .append(" (").append(job.getStatus()).append(")")
                        .append(" - ").append(appCount).append(" applications");

                if (job.getPostedAt() != null) {
                    sb.append(" - Posted: ").append(job.getPostedAt().format(DATE_FORMAT));
                }
                sb.append("\n");
            }
            sb.append("\nTotal applications received: ").append(totalApplications).append("\n\n");
        } else {
            sb.append("YOUR POSTED JOBS: You haven't posted any jobs yet.\n\n");
        }

        // Recent applications for employer's jobs
        var applications = applicationRepository.findByEmployerId(
                userId,
                PageRequest.of(0, MAX_APPLICATIONS_IN_CONTEXT, Sort.by(Sort.Direction.DESC, "appliedAt")));

        if (!applications.isEmpty()) {
            sb.append("RECENT APPLICATIONS TO YOUR JOBS:\n");

            // Group by status
            long pending = applications.getContent().stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.PENDING).count();
            long reviewed = applications.getContent().stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.REVIEWED).count();
            long shortlisted = applications.getContent().stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();
            long hired = applications.getContent().stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.HIRED).count();

            sb.append("Summary: ")
                    .append(pending).append(" pending, ")
                    .append(reviewed).append(" reviewed, ")
                    .append(shortlisted).append(" shortlisted, ")
                    .append(hired).append(" hired\n\n");

            sb.append("Latest applicants:\n");
            for (Application app : applications.getContent().stream().limit(10).collect(Collectors.toList())) {
                String applicantName = getApplicantName(app);
                sb.append("- ").append(applicantName)
                        .append(" applied for ").append(app.getJob().getTitle())
                        .append(" - ").append(formatStatus(app.getStatus()));

                if (app.getAppliedAt() != null) {
                    sb.append(" (").append(app.getAppliedAt().format(DATE_FORMAT)).append(")");
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    /**
     * Build context for an admin.
     */
    private String buildAdminContext() {
        StringBuilder sb = new StringBuilder();

        sb.append("PLATFORM STATISTICS:\n");

        // Job statistics
        long activeJobs = jobRepository.countByStatus(JobStatus.ACTIVE);
        long draftJobs = jobRepository.countByStatus(JobStatus.DRAFT);
        long closedJobs = jobRepository.countByStatus(JobStatus.CLOSED);
        long totalJobs = jobRepository.count();

        sb.append("- Total Jobs: ").append(totalJobs).append("\n");
        sb.append("  - Active: ").append(activeJobs).append("\n");
        sb.append("  - Draft: ").append(draftJobs).append("\n");
        sb.append("  - Closed: ").append(closedJobs).append("\n");

        // Application statistics
        long totalApplications = applicationRepository.count();
        sb.append("- Total Applications: ").append(totalApplications).append("\n");

        sb.append("\n");

        return sb.toString();
    }

    // Helper methods

    private String getCompanyName(Job job) {
        if (job.getEmployer() != null && job.getEmployer().getEmployerProfile() != null) {
            return job.getEmployer().getEmployerProfile().getCompanyName();
        }
        return "Unknown Company";
    }

    private String getApplicantName(Application app) {
        if (app.getApplicant() != null && app.getApplicant().getJobSeekerProfile() != null) {
            return app.getApplicant().getJobSeekerProfile().getFullName();
        }
        return "Unknown Applicant";
    }

    private String formatJobType(JobType type) {
        if (type == null)
            return "Unknown";
        return switch (type) {
            case FULL_TIME -> "Full-time";
            case PART_TIME -> "Part-time";
            case CONTRACT -> "Contract";
            case INTERNSHIP -> "Internship";
            case REMOTE -> "Remote";
        };
    }

    private String formatStatus(ApplicationStatus status) {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case PENDING -> "Pending";
            case REVIEWED -> "Reviewed";
            case SHORTLISTED -> "Shortlisted";
            case INTERVIEW -> "Interview";
            case HIRED -> "Hired";
            case REJECTED -> "Rejected";
        };
    }
}
