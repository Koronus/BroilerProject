package com.broiler_monitoring.Telemetry;

import com.broiler_monitoring.Telemetry.TelemetryReading.SensorReading;
import com.broiler_monitoring.Telemetry.TelemetryReading.SensorReadingRepository;
import com.broiler_monitoring.Telemetry.dto.SensorReadingResponse;
import com.broiler_monitoring.Telemetry.dto.TelemetryBatchRequest;
import com.broiler_monitoring.Telemetry.dto.TelemetryIngestResponse;
import com.broiler_monitoring.Telemetry.dto.TelemetryReadingRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class TelemetryService {

    private final SensorRepository sensorRepository;
    private final SensorReadingRepository readingRepository;

    public TelemetryService(
            SensorRepository sensorRepository,
            SensorReadingRepository readingRepository
    ){
        this.readingRepository = readingRepository;
        this.sensorRepository = sensorRepository;
    }

    @Transactional
    public TelemetryIngestResponse ingest(TelemetryBatchRequest request) {
        List<SensorReading> readingsToSave = new ArrayList<>();

        for (TelemetryReadingRequest readingRequest : request.getReadings()) {
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

            SensorReading reading = new SensorReading();
            reading.setSensor(sensor);
            reading.setSensorCode(sensor.getCode());
            reading.setType(sensor.getType());
            reading.setValue(readingRequest.getValue());
            reading.setUnit(sensor.getUnit());
            reading.setMeasuredAt(readingRequest.getMeasuredAt());

            readingsToSave.add(reading);
        }

        readingRepository.saveAll(readingsToSave);

        return new TelemetryIngestResponse(readingsToSave.size());
    }

    public List<SensorReadingResponse> getReadingsBySensorCode(String sensorCode, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 500);

        return readingRepository
                .findBySensorCodeOrderByMeasuredAtDesc(sensorCode, PageRequest.of(0, safeLimit))
                .stream()
                .map(SensorReadingResponse::new)
                .toList();
    }

    public List<SensorReadingResponse> getReadingsBySensorCodeAndPeriod(
            String sensorCode,
            Instant from,
            Instant to
    ) {
        return readingRepository
                .findBySensorCodeAndMeasuredAtBetweenOrderByMeasuredAtDesc(sensorCode, from, to)
                .stream()
                .map(SensorReadingResponse::new)
                .toList();
    }

}
