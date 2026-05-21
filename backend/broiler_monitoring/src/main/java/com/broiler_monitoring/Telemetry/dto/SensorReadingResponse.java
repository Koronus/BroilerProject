package com.broiler_monitoring.Telemetry.dto;

import com.broiler_monitoring.Telemetry.SensorType;
import com.broiler_monitoring.Telemetry.TelemetryReading.SensorReading;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Schema(description = "Показание датчика, сохраненное в системе")
public class SensorReadingResponse {
    @Schema(description = "UUID показания", example = "46861edd-1669-442d-bd73-213b1f824f2f")
    private final UUID id;

    @Schema(description = "UUID датчика", example = "11111111-1111-1111-1111-111111111111")
    private final UUID sensorId;

    @Schema(description = "Код датчика", example = "TEMP-HOUSE-4-01")
    private final String sensorCode;

    @Schema(description = "Тип показания", example = "TEMPERATURE")
    private final SensorType type;

    @Schema(description = "Значение показания", example = "33.7")
    private final Double value;

    @Schema(description = "Единица измерения", example = "C")
    private final String unit;

    @Schema(description = "Время измерения датчиком", example = "2026-05-14T13:34:31Z")
    private final Instant measuredAt;

    @Schema(description = "Время получения показания backend", example = "2026-05-14T13:34:34.093075Z")
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
