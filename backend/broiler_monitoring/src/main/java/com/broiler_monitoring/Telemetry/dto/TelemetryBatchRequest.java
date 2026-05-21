package com.broiler_monitoring.Telemetry.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Schema(description = "Batch-запрос с показаниями датчиков от gateway")
public class TelemetryBatchRequest {

    @NotBlank
    @Schema(description = "Идентификатор gateway, который отправляет пачку показаний", example = "GW-FARM-1-HOUSE-4")
    private String gatewayId;

    @Valid
    @NotEmpty
    @Schema(description = "Список показаний датчиков")
    private List<TelemetryReadingRequest> readings;
}
