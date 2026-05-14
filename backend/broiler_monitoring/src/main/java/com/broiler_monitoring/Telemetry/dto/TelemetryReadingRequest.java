package com.broiler_monitoring.Telemetry.dto;


import com.broiler_monitoring.Telemetry.SensorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class TelemetryReadingRequest {
    @NotBlank
    private String sensorCode;

    @NotNull
    private SensorType type;

    @NotNull
    private Double value;

    @NotBlank
    private String unit;

    @NotNull
    private Instant measuredAt;
}
