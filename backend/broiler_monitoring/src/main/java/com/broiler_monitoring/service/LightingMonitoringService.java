package com.broiler_monitoring.service;

import com.broiler_monitoring.Telemetry.InfluxTelemetryStorage;
import com.broiler_monitoring.Telemetry.TelemetryService;
import com.broiler_monitoring.Telemetry.dto.SensorReadingResponse;
import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentSource;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.enumerated.IncidentType;
import com.broiler_monitoring.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class LightingMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(LightingMonitoringService.class);

    // Датчики освещения по зонам
    private static final List<String> LIGHT_SENSORS = List.of(
            "LIGHT-01", "LIGHT-02", "LIGHT-03", "LIGHT-04", "LIGHT-05"
    );

    private final TelemetryService telemetryService;
    private final IncidentRepository incidentRepository;
    private final InfluxTelemetryStorage influxStorage;

    public LightingMonitoringService(TelemetryService telemetryService,
                                     IncidentRepository incidentRepository,
                                     InfluxTelemetryStorage influxStorage) {
        this.telemetryService = telemetryService;
        this.incidentRepository = incidentRepository;
        this.influxStorage = influxStorage;
    }

    @Scheduled(fixedDelay = 300000) // каждые 5 минут
    public void checkMetrics() {
        log.info("Проверка показателей освещения...");
        checkIlluminance();
        checkUniformity();
    }

    // ========== 1. ОСВЕЩЕННОСТЬ ==========
    private void checkIlluminance() {
        double minNorm = getMinNormByAge();
        double maxNorm = getMaxNormByAge();

        for (String sensorCode : LIGHT_SENSORS) {
            SensorReadingResponse reading = getLatestReading(sensorCode);
            if (reading == null) {
//                createIncident(
//                        IncidentType.LIGHTING_ILLUMINANCE_LOW,
//                        "Потеря данных датчика освещения",
//                        String.format("Нет данных от датчика %s", sensorCode)
//                );
                continue;
            }

            double lux = reading.getValue();

            if (lux < minNorm) {
                createIncident(
                        IncidentType.LIGHTING_ILLUMINANCE_LOW,
                        "Освещенность ниже нормы",
                        String.format("Датчик %s: %.1f lux (норма: %.0f-%.0f lux)",
                                sensorCode, lux, minNorm, maxNorm)
                );
            } else if (lux > maxNorm) {
                createIncident(
                        IncidentType.LIGHTING_ILLUMINANCE_HIGH,
                        "Освещенность выше нормы",
                        String.format("Датчик %s: %.1f lux (норма: %.0f-%.0f lux)",
                                sensorCode, lux, minNorm, maxNorm)
                );
            }
        }
    }

    // ========== 2. РАВНОМЕРНОСТЬ ОСВЕЩЕНИЯ ==========
    private void checkUniformity() {
        double minLux = Double.MAX_VALUE;
        double maxLux = Double.MIN_VALUE;
        double sumLux = 0;
        int activeSensors = 0;

        for (String sensorCode : LIGHT_SENSORS) {
            SensorReadingResponse reading = getLatestReading(sensorCode);
            if (reading != null) {
                double lux = reading.getValue();
                minLux = Math.min(minLux, lux);
                maxLux = Math.max(maxLux, lux);
                sumLux += lux;
                activeSensors++;
            }
        }

        if (activeSensors < 2) {
            log.warn("Недостаточно датчиков для расчета равномерности: {}", activeSensors);
            return;
        }

        double avgLux = sumLux / activeSensors;
        double uniformity = (maxLux - minLux) / avgLux * 100;


        influxStorage.saveUniformity(
                "house-4",
                minLux, maxLux, avgLux,
                uniformity,
                activeSensors
        );


        if (uniformity > 20) {
//            createIncident(
//                    IncidentType.LIGHTING_UNIFORMITY_VIOLATION,
//                    "Нарушение равномерности освещения",
//                    String.format("Равномерность: %.1f%% (норма ≤20%%)", uniformity)
//            );
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    private SensorReadingResponse getLatestReading(String sensorCode) {
        try {
            List<SensorReadingResponse> readings = telemetryService
                    .getReadingsBySensorCode(sensorCode, 1);
            return readings.isEmpty() ? null : readings.get(0);
        } catch (Exception e) {
            log.error("Ошибка получения данных с датчика {}: {}", sensorCode, e.getMessage());
            return null;
        }
    }

    private double getMinNormByAge() {
        return 25.0; // для возраста 0-7 дней
    }

    private double getMaxNormByAge() {
        return 40.0; // для возраста 0-7 дней
    }

    private void createIncident(IncidentType type, String title, String description) {
        Incident incident = new Incident();
        incident.setCode(generateIncidentCode());
        incident.setType(type);
        incident.setTitle(title);
        incident.setDescription(description);
        incident.setPriority(IncidentPriority.HIGH);
        incident.setStatus(IncidentStatus.OPEN);
        incident.setSource(IncidentSource.SYSTEM);


        incidentRepository.save(incident);
        log.info("Создан инцидент: {} - {}", title, description);
    }

    private String generateIncidentCode() {
        return "INC-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }


}