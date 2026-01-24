package com.jobportal.converter;

import com.jobportal.entity.ExperienceLevel;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ExperienceLevelConverter implements AttributeConverter<ExperienceLevel, String> {

    @Override
    public String convertToDatabaseColumn(ExperienceLevel attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public ExperienceLevel convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return ExperienceLevel.fromValue(dbData);
    }
}
