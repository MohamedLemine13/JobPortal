package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ExperienceLevel {
    ENTRY("entry"),
    MID("mid"),
    SENIOR("senior"),
    LEAD("lead");

    private final String value;

    ExperienceLevel(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ExperienceLevel fromValue(String value) {
        for (ExperienceLevel level : ExperienceLevel.values()) {
            if (level.value.equalsIgnoreCase(value) || level.name().equalsIgnoreCase(value)) {
                return level;
            }
        }
        throw new IllegalArgumentException("Unknown experience level: " + value);
    }
}
