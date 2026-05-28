package com.broiler_monitoring.Telemetry;

import com.broiler_monitoring.Telemetry.dto.SensorReadingResponse;
import com.broiler_monitoring.Telemetry.dto.TelemetryBatchRequest;
import com.broiler_monitoring.Telemetry.dto.TelemetryIngestResponse;
import com.broiler_monitoring.Telemetry.dto.TelemetryReadingRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class TelemetryService {

    private final SensorRepository sensorRepository;
    private final InfluxTelemetryStorage telemetryStorage;

    public TelemetryService(
            SensorRepository sensorRepository,
            InfluxTelemetryStorage telemetryStorage
    ){
        this.sensorRepository = sensorRepository;
        this.telemetryStorage = telemetryStorage;
    }

    public TelemetryIngestResponse ingest(TelemetryBatchRequest request) {
        List<InfluxTelemetryPoint> readingsToSave = new ArrayList<>();
        Instant receivedAt = Instant.now();

        for (TelemetryReadingRequest readingRequest : request.getReadings()) {
            Sensor sensor = getActiveSensor(readingRequest);

            readingsToSave.add(new InfluxTelemetryPoint(
                    sensor.getId(),
                    sensor.getCode(),
                    sensor.getType(),
                    sensor.getFarm(),
                    sensor.getBuilding(),
                    request.getGatewayId(),
                    readingRequest.getValue(),
                    sensor.getUnit(),
                    readingRequest.getMeasuredAt(),
                    receivedAt
            ));
        }

        telemetryStorage.write(readingsToSave);

        return new TelemetryIngestResponse(readingsToSave.size());
    }

    public List<SensorReadingResponse> getReadingsBySensorCode(String sensorCode, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 500);
        ensureSensorExists(sensorCode);

        return telemetryStorage
                .findLatest(sensorCode, safeLimit)
                .stream()
                .map(SensorReadingResponse::new)
                .toList();
    }

    public List<SensorReadingResponse> getReadingsBySensorCodeAndPeriod(
            String sensorCode,
            Instant from,
            Instant to
    ) {
        ensureSensorExists(sensorCode);

        return telemetryStorage
                .findByPeriod(sensorCode, from, to)
                .stream()
                .map(SensorReadingResponse::new)
                .toList();
    }

    private Sensor getActiveSensor(TelemetryReadingRequest readingRequest) {
        Sensor sensor = sensorRepository.findByCode(readingRequest.getSensorCode())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sensor with code '%s' not found".formatted(readingRequest.getSensorCode())
                ));

        if (!Boolean.TRUE.equals(sensor.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sensor with code '%s' is not active".formatted(sensor.getCode())
            );
        }

        if (sensor.getType() != readingRequest.getType()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sensor type mismatch for code '%s'".formatted(sensor.getCode())
            );
        }

        return sensor;
    }

    private void ensureSensorExists(String sensorCode) {
        sensorRepository.findByCode(sensorCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sensor with code '%s' not found".formatted(sensorCode)
                ));
    }
}
