package com.broiler_monitoring.Telemetry.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TelemetryBatchRequest {

    @NotBlank
    private String gatewayId;

    @Valid
    @NotEmpty
    private List<TelemetryReadingRequest> readings;
}
