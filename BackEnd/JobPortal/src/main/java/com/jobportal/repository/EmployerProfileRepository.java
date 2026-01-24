package com.jobportal.repository;

import com.jobportal.entity.EmployerProfile;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, UUID> {

    Optional<EmployerProfile> findByUser(User user);

    Optional<EmployerProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Optional<EmployerProfile> findByCompanyName(String companyName);
}
