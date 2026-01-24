package com.jobportal.repository;

import com.jobportal.entity.Job;
import com.jobportal.entity.JobStatus;
import com.jobportal.entity.JobType;
import com.jobportal.entity.ExperienceLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {

    // Find jobs by employer
    Page<Job> findByEmployerId(UUID employerId, Pageable pageable);

    Page<Job> findByEmployerIdAndStatus(UUID employerId, JobStatus status, Pageable pageable);

    // Find active jobs
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    // Search jobs with filters
    @Query("SELECT j FROM Job j WHERE j.status = :status " +
            "AND LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')) " +
            "AND (:type IS NULL OR j.type = :type) " +
            "AND LOWER(j.category) LIKE LOWER(CONCAT('%', :category, '%')) " +
            "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
            "AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "    OR LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("search") String search,
            @Param("location") String location,
            @Param("type") JobType type,
            @Param("category") String category,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            Pageable pageable);

    // Count jobs by employer
    long countByEmployerId(UUID employerId);

    long countByEmployerIdAndStatus(UUID employerId, JobStatus status);

    // Increment view count
    @Modifying
    @Query("UPDATE Job j SET j.viewsCount = j.viewsCount + 1 WHERE j.id = :jobId")
    void incrementViewCount(@Param("jobId") UUID jobId);

    // Get employer stats
    @Query("SELECT SUM(j.applicantsCount) FROM Job j WHERE j.employer.id = :employerId")
    Long getTotalApplicantsByEmployer(@Param("employerId") UUID employerId);
}
