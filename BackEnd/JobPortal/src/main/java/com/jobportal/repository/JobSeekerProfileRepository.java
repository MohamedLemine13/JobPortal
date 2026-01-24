package com.jobportal.repository;

import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobSeekerProfileRepository extends JpaRepository<JobSeekerProfile, UUID> {

    Optional<JobSeekerProfile> findByUser(User user);

    Optional<JobSeekerProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
