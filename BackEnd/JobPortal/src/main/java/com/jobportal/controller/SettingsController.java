package com.jobportal.controller;

import com.jobportal.dto.admin.SettingDto;
import com.jobportal.dto.common.ApiResponse;
import com.jobportal.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    /**
     * Get all system settings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SettingDto>>> getAllSettings() {
        List<SettingDto> settings = settingsService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings, "Settings retrieved successfully"));
    }

    /**
     * Get a single setting by key
     */
    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<SettingDto>> getSetting(@PathVariable String key) {
        SettingDto setting = settingsService.getSetting(key);
        if (setting == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(setting, "Setting retrieved successfully"));
    }

    /**
     * Update a single setting
     */
    @PutMapping("/{key}")
    public ResponseEntity<ApiResponse<SettingDto>> updateSetting(
            @PathVariable String key,
            @RequestBody SettingDto request) {
        SettingDto updated = settingsService.updateSetting(key, request.getValue());
        return ResponseEntity.ok(ApiResponse.success(updated, "Setting updated successfully"));
    }

    /**
     * Update multiple settings at once
     */
    @PutMapping
    public ResponseEntity<ApiResponse<List<SettingDto>>> updateSettings(@RequestBody List<SettingDto> settings) {
        List<SettingDto> updated = settingsService.updateSettings(settings);
        return ResponseEntity.ok(ApiResponse.success(updated, "Settings updated successfully"));
    }

    /**
     * Initialize default settings (useful for first-time setup)
     */
    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<List<SettingDto>>> initializeSettings() {
        settingsService.initializeDefaultSettings();
        List<SettingDto> settings = settingsService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings, "Settings initialized successfully"));
    }
}
