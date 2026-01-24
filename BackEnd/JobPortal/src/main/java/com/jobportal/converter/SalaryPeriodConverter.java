package com.jobportal.converter;

import com.jobportal.entity.SalaryPeriod;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SalaryPeriodConverter implements AttributeConverter<SalaryPeriod, String> {

    @Override
    public String convertToDatabaseColumn(SalaryPeriod attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public SalaryPeriod convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return SalaryPeriod.fromValue(dbData);
    }
}
