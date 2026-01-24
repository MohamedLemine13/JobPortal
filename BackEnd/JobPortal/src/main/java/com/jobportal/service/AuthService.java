package com.jobportal.service;

import com.jobportal.dto.auth.*;
import com.jobportal.dto.profile.EmployerProfileDto;
import com.jobportal.dto.profile.JobSeekerProfileDto;
import com.jobportal.entity.*;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ConflictException;
import com.jobportal.exception.UnauthorizedException;
import com.jobportal.repository.*;
import com.jobportal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        // Validate role
        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        // Validate employer has company name
        if (role == UserRole.EMPLOYER && (request.getCompanyName() == null || request.getCompanyName().isBlank())) {
            throw new BadRequestException("Company name is required for employer registration");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isVerified(true) // For simplicity, auto-verify. In production, send verification email
                .build();

        user = userRepository.save(user);

        // Create profile based on role
        Object profile;
        if (role == UserRole.JOB_SEEKER) {
            JobSeekerProfile seekerProfile = JobSeekerProfile.builder()
                    .user(user)
                    .fullName(request.getFullName())
                    .build();
            jobSeekerProfileRepository.save(seekerProfile);
            profile = mapToJobSeekerProfileDto(seekerProfile);
        } else {
            EmployerProfile employerProfile = EmployerProfile.builder()
                    .user(user)
                    .fullName(request.getFullName())
                    .companyName(request.getCompanyName())
                    .build();
            employerProfileRepository.save(employerProfile);
            profile = mapToEmployerProfileDto(employerProfile);
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = generateAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .role(user.getRole().name().toLowerCase())
                        .profile(profile)
                        .build())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.getIsVerified()) {
            throw new UnauthorizedException("Account not verified");
        }

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Get profile
        Object profile = getProfileForUser(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = generateAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .role(user.getRole().name().toLowerCase())
                        .profile(profile)
                        .build())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public String refreshAccessToken(String refreshToken) {
        // Validate refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String tokenHash = hashToken(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (!storedToken.isValid()) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        User user = storedToken.getUser();

        // Generate new access token
        return jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void logout(UUID userId) {
        // Revoke all refresh tokens for user
        refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
    }

    private String generateAndSaveRefreshToken(User user) {
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        String tokenHash = hashToken(refreshToken);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpiration() / 1000))
                .build();

        refreshTokenRepository.save(token);

        return refreshToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    private Object getProfileForUser(User user) {
        if (user.getRole() == UserRole.JOB_SEEKER) {
            return jobSeekerProfileRepository.findByUserId(user.getId())
                    .map(this::mapToJobSeekerProfileDto)
                    .orElse(null);
        } else {
            return employerProfileRepository.findByUserId(user.getId())
                    .map(this::mapToEmployerProfileDto)
                    .orElse(null);
        }
    }

    private JobSeekerProfileDto mapToJobSeekerProfileDto(JobSeekerProfile profile) {
        JobSeekerProfileDto.CvDto cvDto = null;
        if (profile.getCvFileUrl() != null) {
            cvDto = JobSeekerProfileDto.CvDto.builder()
                    .fileName(profile.getCvFileName())
                    .fileUrl(profile.getCvFileUrl())
                    .fileSize(profile.getCvFileSize())
                    .uploadedAt(profile.getCvUploadedAt())
                    .build();
        }

        return JobSeekerProfileDto.builder()
                .id(profile.getId().toString())
                .fullName(profile.getFullName())
                .avatar(profile.getAvatarUrl())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .bio(profile.getBio())
                .skills(profile.getSkills())
                .experience(profile.getExperience())
                .cv(cvDto)
                .build();
    }

    private EmployerProfileDto mapToEmployerProfileDto(EmployerProfile profile) {
        return EmployerProfileDto.builder()
                .id(profile.getId().toString())
                .fullName(profile.getFullName())
                .avatar(profile.getAvatarUrl())
                .companyName(profile.getCompanyName())
                .companyLogo(profile.getCompanyLogo())
                .companyType(profile.getCompanyType())
                .industry(profile.getIndustry())
                .companySize(profile.getCompanySize())
                .website(profile.getWebsite())
                .location(profile.getLocation())
                .description(profile.getDescription())
                .foundedYear(profile.getFoundedYear())
                .build();
    }
}
