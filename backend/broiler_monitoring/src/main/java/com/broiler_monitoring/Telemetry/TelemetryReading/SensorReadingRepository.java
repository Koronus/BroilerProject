package com.broiler_monitoring.Telemetry.TelemetryReading;

import com.broiler_monitoring.Telemetry.SensorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SensorReadingRepository extends JpaRepository<SensorReading, UUID> {

    List<SensorReading> findBySensorCodeOrderByMeasuredAtDesc(String sensorCode, Pageable pageable);

    List<SensorReading> findBySensorCodeAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            String sensorCode,
            Instant from,
            Instant to
    );

    List<SensorReading> findByTypeAndMeasuredAtAfterOrderByMeasuredAtDesc(
            SensorType type,
            Instant after
    );
}
