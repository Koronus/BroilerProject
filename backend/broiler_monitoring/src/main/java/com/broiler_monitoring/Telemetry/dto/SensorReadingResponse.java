package com.broiler_monitoring.Telemetry.dto;

import com.broiler_monitoring.Telemetry.SensorType;
import com.broiler_monitoring.Telemetry.TelemetryReading.SensorReading;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class SensorReadingResponse {
    private final UUID id;
    private final UUID sensorId;
    private final String sensorCode;
    private final SensorType type;
    private final Double value;
    private final String unit;
    private final Instant measuredAt;
    private final Instant receivedAt;

    public SensorReadingResponse(SensorReading reading) {
        this.id = reading.getId();
        this.sensorId = reading.getSensor().getId();
        this.sensorCode = reading.getSensorCode();
        this.type = reading.getType();
        this.value = reading.getValue();
        this.unit = reading.getUnit();
        this.measuredAt = reading.getMeasuredAt();
        this.receivedAt = reading.getReceivedAt();
    }
}
