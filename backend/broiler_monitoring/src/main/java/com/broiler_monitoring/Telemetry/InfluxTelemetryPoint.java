package com.broiler_monitoring.Telemetry;

import java.time.Instant;
import java.util.UUID;

public record InfluxTelemetryPoint(
        UUID sensorId,
        String sensorCode,
        SensorType type,
        String farm,
        String building,
        String gatewayId,
        Double value,
        String unit,
        Instant measuredAt,
        Instant receivedAt
) {
}
