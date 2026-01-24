package com.jobportal.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtils {

    /**
     * Get the current authenticated user's principal
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }

        return null;
    }

    /**
     * Get the current authenticated user's ID
     */
    public UUID getCurrentUserId() {
        UserPrincipal userPrincipal = getCurrentUser();
        return userPrincipal != null ? userPrincipal.getId() : null;
    }

    /**
     * Get the current authenticated user's email
     */
    public String getCurrentUserEmail() {
        UserPrincipal userPrincipal = getCurrentUser();
        return userPrincipal != null ? userPrincipal.getEmail() : null;
    }

    /**
     * Check if the current user is a job seeker
     */
    public boolean isJobSeeker() {
        UserPrincipal userPrincipal = getCurrentUser();
        return userPrincipal != null &&
                userPrincipal.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_JOB_SEEKER"));
    }

    /**
     * Check if the current user is an employer
     */
    public boolean isEmployer() {
        UserPrincipal userPrincipal = getCurrentUser();
        return userPrincipal != null &&
                userPrincipal.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYER"));
    }

    /**
     * Check if the current user has a specific user ID
     */
    public boolean isCurrentUser(UUID userId) {
        UUID currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(userId);
    }
}
