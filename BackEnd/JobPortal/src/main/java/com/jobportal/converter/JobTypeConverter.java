package com.jobportal.converter;

import com.jobportal.entity.JobType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class JobTypeConverter implements AttributeConverter<JobType, String> {

    @Override
    public String convertToDatabaseColumn(JobType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public JobType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return JobType.fromValue(dbData);
    }
}
