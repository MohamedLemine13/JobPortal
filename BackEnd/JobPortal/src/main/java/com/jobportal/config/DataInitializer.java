package com.jobportal.config;

import com.jobportal.entity.User;
import com.jobportal.entity.UserRole;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes default data on application startup.
 * Creates the admin user and default settings if they don't exist.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingsService settingsService;

    private static final String ADMIN_EMAIL = "admin@jobportal.com";
    private static final String ADMIN_PASSWORD = "admin";

    @Override
    public void run(String... args) {
        createOrResetAdminUser();
        initializeSettings();
    }

    private void createOrResetAdminUser() {
        // Check if admin user already exists
        var existingAdmin = userRepository.findByEmail(ADMIN_EMAIL);

        if (existingAdmin.isEmpty()) {
            // Create new admin user
            User adminUser = User.builder()
                    .email(ADMIN_EMAIL)
                    .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                    .role(UserRole.ADMIN)
                    .isVerified(true)
                    .build();

            userRepository.save(adminUser);
            log.info("Admin user created successfully with email: {}", ADMIN_EMAIL);
        } else {
            // Admin exists - reset password and clear any lockouts
            User admin = existingAdmin.get();
            admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setFailedLoginAttempts(0);
            admin.setAccountLockedUntil(null);
            admin.setIsVerified(true);
            userRepository.save(admin);
            log.info("Admin user password reset and lockout cleared for: {}", ADMIN_EMAIL);
        }
    }

    private void initializeSettings() {
        log.info("Initializing default system settings...");
        settingsService.initializeDefaultSettings();
        log.info("System settings initialized successfully");
    }
}
