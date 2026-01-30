package com.jobportal.config;

import com.jobportal.security.JwtAuthenticationEntryPoint;
import com.jobportal.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/{id}").permitAll()

                        // Swagger/OpenAPI (if added later)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Health check
                        .requestMatchers("/actuator/**").permitAll()

                        // Static resources (uploads) and file API
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/files/**").permitAll()

                        // Employer-only endpoints
                        .requestMatchers("/api/jobs/employer/**").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.POST, "/api/jobs").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.PUT, "/api/jobs/{id}").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/{id}").hasRole("EMPLOYER")
                        .requestMatchers("/api/applications/job/**").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.PUT, "/api/applications/{id}/status").hasRole("EMPLOYER")

                        // Job seeker-only endpoints
                        .requestMatchers(HttpMethod.POST, "/api/applications").hasRole("JOB_SEEKER")
                        .requestMatchers("/api/applications/my-applications").hasRole("JOB_SEEKER")
                        .requestMatchers("/api/saved-jobs/**").hasRole("JOB_SEEKER")
                        .requestMatchers(HttpMethod.POST, "/api/profile/me/cv").hasRole("JOB_SEEKER")
                        .requestMatchers(HttpMethod.DELETE, "/api/profile/me/cv").hasRole("JOB_SEEKER")

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
