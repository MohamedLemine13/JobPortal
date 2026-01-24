package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum SalaryPeriod {
    HOURLY("hourly"),
    MONTHLY("monthly"),
    YEARLY("yearly");

    private final String value;

    SalaryPeriod(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static SalaryPeriod fromValue(String value) {
        for (SalaryPeriod period : SalaryPeriod.values()) {
            if (period.value.equalsIgnoreCase(value) || period.name().equalsIgnoreCase(value)) {
                return period;
            }
        }
        throw new IllegalArgumentException("Unknown salary period: " + value);
    }
}
