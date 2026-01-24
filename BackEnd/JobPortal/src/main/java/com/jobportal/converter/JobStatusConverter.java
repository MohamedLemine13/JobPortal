package com.jobportal.converter;

import com.jobportal.entity.JobStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class JobStatusConverter implements AttributeConverter<JobStatus, String> {

    @Override
    public String convertToDatabaseColumn(JobStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public JobStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return JobStatus.fromValue(dbData);
    }
}
