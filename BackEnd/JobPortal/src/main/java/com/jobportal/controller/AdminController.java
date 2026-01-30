package com.jobportal.controller;

import com.jobportal.dto.admin.*;
import com.jobportal.dto.common.ApiResponse;
import com.jobportal.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved successfully"));
    }

    /**
     * Get all users with pagination
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserListDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserListDto> users = adminService.getAllUsers(pageable, role);
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserById(@PathVariable UUID id) {
        UserDetailDto user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully"));
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    /**
     * Toggle user verification status
     */
    @PutMapping("/users/{id}/toggle-verification")
    public ResponseEntity<ApiResponse<UserDetailDto>> toggleUserVerification(@PathVariable UUID id) {
        UserDetailDto user = adminService.toggleUserVerification(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User verification status toggled successfully"));
    }

    /**
     * Get all jobs with pagination (admin view)
     */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobListDto>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<JobListDto> jobs = adminService.getAllJobs(pageable, status);
        return ResponseEntity.ok(ApiResponse.success(jobs, "Jobs retrieved successfully"));
    }

    /**
     * Get job details by ID
     */
    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobDetailDto>> getJobById(@PathVariable UUID id) {
        JobDetailDto job = adminService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(job, "Job retrieved successfully"));
    }

    /**
     * Get applications for a job
     */
    @GetMapping("/jobs/{id}/applications")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getJobApplications(@PathVariable UUID id) {
        List<ApplicationDto> applications = adminService.getJobApplications(id);
        return ResponseEntity.ok(ApiResponse.success(applications, "Applications retrieved successfully"));
    }

    /**
     * Delete a job
     */
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable UUID id) {
        adminService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully"));
    }
}
