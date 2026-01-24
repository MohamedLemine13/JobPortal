package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum JobStatus {
    DRAFT("draft"),
    ACTIVE("active"),
    PAUSED("paused"),
    CLOSED("closed");

    private final String value;

    JobStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static JobStatus fromValue(String value) {
        for (JobStatus status : JobStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown job status: " + value);
    }
}
