package com.jobportal.controller;

import com.jobportal.dto.common.ApiResponse;
import com.jobportal.dto.savedjob.SavedJobListResponse;
import com.jobportal.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    @GetMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<SavedJobListResponse>> getSavedJobs() {
        SavedJobListResponse response = savedJobService.getSavedJobs();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<Void>> saveJob(@PathVariable UUID jobId) {
        savedJobService.saveJob(jobId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job saved successfully"));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(@PathVariable UUID jobId) {
        savedJobService.unsaveJob(jobId);
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved items"));
    }
}
