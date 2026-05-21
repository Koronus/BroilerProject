package com.broiler_monitoring.Telemetry.dto;


import com.broiler_monitoring.Telemetry.SensorType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Schema(description = "Одно показание датчика в batch-запросе телеметрии")
public class TelemetryReadingRequest {
    @NotBlank
    @Schema(description = "Код датчика из справочника sensors", example = "TEMP-HOUSE-4-01")
    private String sensorCode;

    @NotNull
    @Schema(description = "Тип показания. Должен совпадать с типом датчика в справочнике.", example = "TEMPERATURE")
    private SensorType type;

    @NotNull
    @Schema(description = "Измеренное значение", example = "33.7")
    private Double value;

    @NotBlank
    @Schema(description = "Единица измерения, которую отправил gateway", example = "C")
    private String unit;

    @NotNull
    @Schema(description = "Время измерения. Для Instant нужен часовой пояс: Z или +04:00.", example = "2026-05-14T12:30:00Z")
    private Instant measuredAt;
}
