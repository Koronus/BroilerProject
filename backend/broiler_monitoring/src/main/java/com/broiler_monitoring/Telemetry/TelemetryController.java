package com.broiler_monitoring.Telemetry;

import com.broiler_monitoring.Telemetry.dto.SensorReadingResponse;
import com.broiler_monitoring.Telemetry.dto.TelemetryBatchRequest;
import com.broiler_monitoring.Telemetry.dto.TelemetryIngestResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryController {
    private final TelemetryService service;

    public TelemetryController(TelemetryService service) {
        this.service = service;
    }

    @PostMapping("/readings")
    public TelemetryIngestResponse ingest(@Valid @RequestBody TelemetryBatchRequest request) {
        return service.ingest(request);
    }

    @GetMapping("/readings")
    public List<SensorReadingResponse> getReadings(
            @RequestParam String sensorCode,
            @RequestParam(defaultValue = "100") int limit
    ) {
        return service.getReadingsBySensorCode(sensorCode, limit);
    }

    @GetMapping("/readings/period")
    public List<SensorReadingResponse> getReadingsByPeriod(
            @RequestParam String sensorCode,
            @RequestParam Instant from,
            @RequestParam Instant to
    ) {
        return service.getReadingsBySensorCodeAndPeriod(sensorCode, from, to);
    }


}
