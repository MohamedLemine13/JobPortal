package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    // Find applications by applicant
    Page<Application> findByApplicantId(UUID applicantId, Pageable pageable);

    Page<Application> findByApplicantIdAndStatus(UUID applicantId, ApplicationStatus status, Pageable pageable);

    // Find applications by job
    Page<Application> findByJobId(UUID jobId, Pageable pageable);

    Page<Application> findByJobIdAndStatus(UUID jobId, ApplicationStatus status, Pageable pageable);

    // Check if user already applied
    boolean existsByJobIdAndApplicantId(UUID jobId, UUID applicantId);

    Optional<Application> findByJobIdAndApplicantId(UUID jobId, UUID applicantId);

    // Count applications
    long countByJobId(UUID jobId);

    long countByApplicantId(UUID applicantId);

    // Count hired by employer
    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.employer.id = :employerId AND a.status = 'HIRED'")
    long countHiredByEmployer(@Param("employerId") UUID employerId);

    // Find applications by employer (for all jobs posted by this employer)
    @Query("SELECT a FROM Application a WHERE a.job.employer.id = :employerId ORDER BY a.appliedAt DESC")
    Page<Application> findByEmployerId(@Param("employerId") UUID employerId, Pageable pageable);
}
