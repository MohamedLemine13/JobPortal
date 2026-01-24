package com.jobportal.repository;

import com.jobportal.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {

    Page<SavedJob> findByUserId(UUID userId, Pageable pageable);

    List<SavedJob> findByUserId(UUID userId);

    Optional<SavedJob> findByUserIdAndJobId(UUID userId, UUID jobId);

    boolean existsByUserIdAndJobId(UUID userId, UUID jobId);

    void deleteByUserIdAndJobId(UUID userId, UUID jobId);
}
