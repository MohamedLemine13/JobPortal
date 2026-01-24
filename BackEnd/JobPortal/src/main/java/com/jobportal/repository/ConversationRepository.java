package com.jobportal.repository;

import com.jobportal.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    // Find conversations for a user (either as participant1 or participant2)
    @Query("SELECT c FROM Conversation c WHERE c.participant1.id = :userId OR c.participant2.id = :userId ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findByParticipant(@Param("userId") UUID userId, Pageable pageable);

    // Find conversation between two users for a specific job
    @Query("SELECT c FROM Conversation c WHERE " +
            "((c.participant1.id = :user1Id AND c.participant2.id = :user2Id) OR " +
            "(c.participant1.id = :user2Id AND c.participant2.id = :user1Id)) " +
            "AND (:jobId IS NULL OR c.job.id = :jobId)")
    Optional<Conversation> findByParticipantsAndJob(
            @Param("user1Id") UUID user1Id,
            @Param("user2Id") UUID user2Id,
            @Param("jobId") UUID jobId);

    // Find conversation between two users
    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.participant1.id = :user1Id AND c.participant2.id = :user2Id) OR " +
            "(c.participant1.id = :user2Id AND c.participant2.id = :user1Id)")
    Optional<Conversation> findByParticipants(
            @Param("user1Id") UUID user1Id,
            @Param("user2Id") UUID user2Id);

    // Find conversation by application
    Optional<Conversation> findByApplicationId(UUID applicationId);
}
