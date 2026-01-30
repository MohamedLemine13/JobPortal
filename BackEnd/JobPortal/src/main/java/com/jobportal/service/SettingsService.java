package com.jobportal.service;

import com.jobportal.dto.admin.SettingDto;
import com.jobportal.entity.SystemSetting;
import com.jobportal.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingRepository settingRepository;

    // Default settings
    private static final Map<String, SettingDto> DEFAULT_SETTINGS = new HashMap<>();

    static {
        DEFAULT_SETTINGS.put("access_token_expiry_minutes", SettingDto.builder()
                .key("access_token_expiry_minutes")
                .value("60")
                .description("Access token expiration time in minutes")
                .type("INTEGER")
                .build());

        DEFAULT_SETTINGS.put("refresh_token_expiry_days", SettingDto.builder()
                .key("refresh_token_expiry_days")
                .value("7")
                .description("Refresh token expiration time in days")
                .type("INTEGER")
                .build());

        DEFAULT_SETTINGS.put("max_login_attempts", SettingDto.builder()
                .key("max_login_attempts")
                .value("5")
                .description("Maximum failed login attempts before lockout")
                .type("INTEGER")
                .build());

        DEFAULT_SETTINGS.put("lockout_duration_minutes", SettingDto.builder()
                .key("lockout_duration_minutes")
                .value("15")
                .description("Account lockout duration in minutes")
                .type("INTEGER")
                .build());

        DEFAULT_SETTINGS.put("require_email_verification", SettingDto.builder()
                .key("require_email_verification")
                .value("false")
                .description("Require email verification for new accounts")
                .type("BOOLEAN")
                .build());

        DEFAULT_SETTINGS.put("maintenance_mode", SettingDto.builder()
                .key("maintenance_mode")
                .value("false")
                .description("Enable maintenance mode (disables new registrations)")
                .type("BOOLEAN")
                .build());
    }

    /**
     * Initialize default settings if they don't exist
     */
    @Transactional
    public void initializeDefaultSettings() {
        for (Map.Entry<String, SettingDto> entry : DEFAULT_SETTINGS.entrySet()) {
            if (!settingRepository.existsByKey(entry.getKey())) {
                SettingDto dto = entry.getValue();
                SystemSetting setting = SystemSetting.builder()
                        .key(dto.getKey())
                        .value(dto.getValue())
                        .description(dto.getDescription())
                        .type(dto.getType())
                        .build();
                settingRepository.save(setting);
                log.info("Created default setting: {}", dto.getKey());
            }
        }
    }

    /**
     * Get all settings
     */
    public List<SettingDto> getAllSettings() {
        return settingRepository.findAllByOrderByKeyAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a setting by key
     */
    public SettingDto getSetting(String key) {
        return settingRepository.findByKey(key)
                .map(this::toDto)
                .orElse(DEFAULT_SETTINGS.get(key));
    }

    /**
     * Get setting value as integer
     */
    public int getIntSetting(String key, int defaultValue) {
        try {
            SettingDto setting = getSetting(key);
            return setting != null ? Integer.parseInt(setting.getValue()) : defaultValue;
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /**
     * Get setting value as boolean
     */
    public boolean getBooleanSetting(String key, boolean defaultValue) {
        SettingDto setting = getSetting(key);
        return setting != null ? Boolean.parseBoolean(setting.getValue()) : defaultValue;
    }

    /**
     * Update a setting
     */
    @Transactional
    public SettingDto updateSetting(String key, String value) {
        SystemSetting setting = settingRepository.findByKey(key)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + key));

        setting.setValue(value);
        SystemSetting saved = settingRepository.save(setting);
        log.info("Updated setting {} to {}", key, value);
        return toDto(saved);
    }

    /**
     * Update multiple settings at once
     */
    @Transactional
    public List<SettingDto> updateSettings(List<SettingDto> settings) {
        for (SettingDto dto : settings) {
            settingRepository.findByKey(dto.getKey()).ifPresent(setting -> {
                setting.setValue(dto.getValue());
                settingRepository.save(setting);
                log.info("Updated setting {} to {}", dto.getKey(), dto.getValue());
            });
        }
        return getAllSettings();
    }

    private SettingDto toDto(SystemSetting setting) {
        return SettingDto.builder()
                .key(setting.getKey())
                .value(setting.getValue())
                .description(setting.getDescription())
                .type(setting.getType())
                .build();
    }
}
