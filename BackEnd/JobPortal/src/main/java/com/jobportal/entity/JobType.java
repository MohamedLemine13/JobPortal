package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum JobType {
    FULL_TIME("full-time"),
    PART_TIME("part-time"),
    CONTRACT("contract"),
    INTERNSHIP("internship"),
    REMOTE("remote");

    private final String value;

    JobType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static JobType fromValue(String value) {
        for (JobType type : JobType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown job type: " + value);
    }
}
