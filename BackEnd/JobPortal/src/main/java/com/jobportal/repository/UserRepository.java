package com.jobportal.repository;

import com.jobportal.entity.User;
import com.jobportal.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndRole(String email, UserRole role);

    // Admin methods
    long countByRole(UserRole role);

    Page<User> findByRole(UserRole role, Pageable pageable);
}
