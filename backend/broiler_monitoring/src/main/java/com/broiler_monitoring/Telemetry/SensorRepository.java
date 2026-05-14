package com.broiler_monitoring.Telemetry;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SensorRepository extends JpaRepository<Sensor, UUID> {
    Optional<Sensor> findByCode(String code);
    boolean existsByCode(String code);
}
