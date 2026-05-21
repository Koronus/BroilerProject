package com.broiler_monitoring.Telemetry.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "Результат сохранения batch-запроса телеметрии")
public class TelemetryIngestResponse{
    @Schema(description = "Количество сохраненных показаний", example = "9")
    private int saved;
}
