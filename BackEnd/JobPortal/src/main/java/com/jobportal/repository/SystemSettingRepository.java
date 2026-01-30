package com.jobportal.repository;

import com.jobportal.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, UUID> {

    Optional<SystemSetting> findByKey(String key);

    List<SystemSetting> findAllByOrderByKeyAsc();

    boolean existsByKey(String key);
}
