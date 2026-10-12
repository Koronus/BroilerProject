package com.broiler_monitoring.service;

import com.broiler_monitoring.Telemetry.SensorRepository;
import com.broiler_monitoring.dto.passport.BatchPassportSettings;
import com.broiler_monitoring.entity.Batch;
import com.broiler_monitoring.entity.BatchMetricNorm;
import com.broiler_monitoring.repository.BatchRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.*;

@Service
public class BatchPassportSettingsService {
    private final BatchRepository batches;
    private final SensorRepository sensors;
    public BatchPassportSettingsService(BatchRepository batches, SensorRepository sensors) {
        this.batches = batches; this.sensors = sensors;
    }
    @Transactional(readOnly = true)
    public BatchPassportSettings get(UUID id) { return BatchPassportSettings.from(batch(id)); }

    @Transactional
    public BatchPassportSettings update(UUID id, BatchPassportSettings settings) {
        Batch batch = batch(id);
        try { ZoneId.of(settings.timeZone()); }
        catch (DateTimeException | NullPointerException e) { bad("Invalid timeZone"); }
        if (settings.hatchDate() != null && batch.getPlacementDate() != null
                && settings.hatchDate().isAfter(batch.getPlacementDate().toLocalDate())) bad("hatchDate must not be after placement");
        if (settings.sensorIds() == null || settings.sensorIds().stream().anyMatch(Objects::isNull)) bad("Invalid sensorIds");
        if (sensors.findAllById(settings.sensorIds()).size() != settings.sensorIds().size()) bad("Unknown sensor id");
        if (settings.metricNorms() == null) bad("metricNorms must be an array");
        Set<String> keys = new HashSet<>();
        for (BatchMetricNorm norm : settings.metricNorms()) {
            if (norm == null || norm.getType() == null || norm.getUnit() == null || norm.getUnit().isBlank()) bad("Invalid norm");
            if (norm.getMinimum() == null && norm.getMaximum() == null) bad("A norm requires at least one bound");
            if (norm.getMinimum() != null && !Double.isFinite(norm.getMinimum())
                    || norm.getMaximum() != null && !Double.isFinite(norm.getMaximum())) bad("Norm bounds must be finite");
            if (norm.getMinimum() != null && norm.getMaximum() != null && norm.getMinimum() > norm.getMaximum()) bad("Invalid norm bounds");
            if (!keys.add(norm.getType() + ":" + norm.getUnit())) bad("Duplicate norm for type and unit");
        }
        batch.setTimeZone(settings.timeZone()); batch.setFarm(settings.farm()); batch.setHatchDate(settings.hatchDate());
        batch.setLightingHouseId(settings.lightingHouseId());
        batch.setSensorIds(new LinkedHashSet<>(settings.sensorIds()));
        batch.setMetricNorms(new ArrayList<>(settings.metricNorms()));
        return BatchPassportSettings.from(batches.save(batch));
    }
    private Batch batch(UUID id) {
        return batches.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));
    }
    private void bad(String message) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
