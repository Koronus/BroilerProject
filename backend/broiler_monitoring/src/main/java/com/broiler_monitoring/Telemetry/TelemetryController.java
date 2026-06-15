package com.broiler_monitoring.Telemetry;

import com.broiler_monitoring.Telemetry.dto.SensorReadingResponse;
import com.broiler_monitoring.Telemetry.dto.TelemetryBatchRequest;
import com.broiler_monitoring.Telemetry.dto.TelemetryIngestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/telemetry")
@Tag(name = "Телеметрия датчиков", description = "Прием и чтение показаний датчиков")
public class TelemetryController {
    private final TelemetryService service;

    public TelemetryController(TelemetryService service) {
        this.service = service;
    }

    @PostMapping("/readings")
    @Operation(
            summary = "Принять пачку показаний датчиков",
            description = "Gateway отправляет batch показаний. Backend проверяет, что датчики существуют, активны и имеют подходящий тип, затем сохраняет показания."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Показания сохранены"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос, неактивный датчик или несовпадение типа", content = @Content),
            @ApiResponse(responseCode = "404", description = "Датчик не найден", content = @Content)
    })
    public TelemetryIngestResponse ingest(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Пачка показаний от gateway",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = TelemetryBatchRequest.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "gatewayId": "GW-FARM-1-HOUSE-4",
                                      "readings": [
                                        {
                                          "sensorCode": "TEMP-HOUSE-4-01",
                                          "type": "TEMPERATURE",
                                          "value": 33.7,
                                          "unit": "C",
                                          "measuredAt": "2026-05-14T12:30:00Z"
                                        },
                                        {
                                          "sensorCode": "HUM-HOUSE-4-01",
                                          "type": "HUMIDITY",
                                          "value": 74.2,
                                          "unit": "%",
                                          "measuredAt": "2026-05-14T12:30:00Z"
                                        }
                                      ]
                                    }
                                    """)
                    )
            )
            @Valid @RequestBody TelemetryBatchRequest request
    ) {
        return service.ingest(request);
    }

    @GetMapping("/readings")
    @Operation(summary = "Получить последние показания датчика", description = "Возвращает последние N показаний конкретного датчика по sensorCode.")
    @ApiResponse(responseCode = "200", description = "Показания получены")
    public List<SensorReadingResponse> getReadings(
            @Parameter(description = "Код датчика", example = "TEMP-HOUSE-4-01")
            @RequestParam String sensorCode,
            @Parameter(description = "Сколько последних записей вернуть. В service ограничивается диапазоном 1..500.", example = "10")
            @RequestParam(defaultValue = "100") int limit
    ) {
        return service.getReadingsBySensorCode(sensorCode, limit);
    }

    @GetMapping("/readings/period")
    @Operation(summary = "Получить показания датчика за период", description = "Возвращает показания датчика между from и to. Для Instant передавайте Z или смещение часового пояса.")
    @ApiResponse(responseCode = "200", description = "Показания за период получены")
    public List<SensorReadingResponse> getReadingsByPeriod(
            @Parameter(description = "Код датчика", example = "TEMP-HOUSE-4-01")
            @RequestParam String sensorCode,
            @Parameter(description = "Начало периода", example = "2026-05-14T12:00:00Z")
            @RequestParam Instant from,
            @Parameter(description = "Конец периода", example = "2026-05-14T13:00:00Z")
            @RequestParam Instant to
    ) {
        return service.getReadingsBySensorCodeAndPeriod(sensorCode, from, to);
    }


}
