package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ApplicationStatus {
    PENDING("pending"),
    REVIEWED("reviewed"),
    SHORTLISTED("shortlisted"),
    INTERVIEW("interview"),
    HIRED("hired"),
    REJECTED("rejected");

    private final String value;

    ApplicationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ApplicationStatus fromValue(String value) {
        for (ApplicationStatus status : ApplicationStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown application status: " + value);
    }
}
