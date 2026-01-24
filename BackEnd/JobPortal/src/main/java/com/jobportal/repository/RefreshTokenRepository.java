package com.jobportal.repository;

import com.jobportal.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // Revoke all tokens for a user
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revokedAt = :now WHERE rt.user.id = :userId AND rt.revokedAt IS NULL")
    void revokeAllByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    // Delete expired tokens (cleanup)
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    // Check if user has valid tokens
    @Query("SELECT COUNT(rt) > 0 FROM RefreshToken rt WHERE rt.user.id = :userId " +
            "AND rt.revokedAt IS NULL AND rt.expiresAt > :now")
    boolean hasValidToken(@Param("userId") UUID userId, @Param("now") LocalDateTime now);
}
