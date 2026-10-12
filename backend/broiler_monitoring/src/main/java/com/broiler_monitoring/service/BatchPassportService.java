package com.broiler_monitoring.service;

import com.broiler_monitoring.Telemetry.Sensor;
import com.broiler_monitoring.Telemetry.SensorRepository;
import com.broiler_monitoring.Telemetry.SensorType;
import com.broiler_monitoring.dto.*;
import com.broiler_monitoring.dto.passport.PassportSections.*;
import com.broiler_monitoring.entity.*;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.repository.*;
import com.broiler_monitoring.service.PassportTelemetryReader.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.DateTimeException;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BatchPassportService {
    private static final Set<SensorType> KPI = EnumSet.of(SensorType.WEIGHT, SensorType.FEED_CONVERSION);
    private static final Set<SensorType> CLIMATE = EnumSet.of(SensorType.TEMPERATURE, SensorType.HUMIDITY,
            SensorType.CO2, SensorType.AMMONIA, SensorType.VENTILATION);
    private static final Set<String> COMPLETED_TASKS = Set.of("RESOLVED", "CLOSED", "DONE", "COMPLETED", "CANCELLED", "CANCELED");
    private final BatchRepository batches;
    private final SensorRepository sensors;
    private final IncidentRepository incidents;
    private final NotificationRepository notifications;
    private final TaskRepository tasks;
    private final IncidentAttachmentRepository attachments;
    private final PassportTelemetryReader telemetry;
    private final Clock clock;

    public BatchPassportService(BatchRepository batches, SensorRepository sensors, IncidentRepository incidents,
                               NotificationRepository notifications, TaskRepository tasks,
                               IncidentAttachmentRepository attachments, PassportTelemetryReader telemetry, Clock clock) {
        this.batches = batches; this.sensors = sensors; this.incidents = incidents;
        this.notifications = notifications; this.tasks = tasks; this.attachments = attachments;
        this.telemetry = telemetry; this.clock = clock;
    }

    @Transactional(readOnly = true)
    public BatchPassportDto getPassport(UUID batchId) {
        Batch batch = batches.findById(batchId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + batchId));
        Instant now = clock.instant();
        List<Issue> issues = new ArrayList<>();
        ZoneId zone = zone(batch, issues);
        Instant from = batch.getPlacementDate() == null ? null : batch.getPlacementDate().atZone(zone).toInstant();
        Instant completedAt = batch.getCloseDate() == null ? null : batch.getCloseDate().atZone(zone).toInstant();
        Instant to = completedAt == null || completedAt.isAfter(now) ? now : completedAt;
        Integer age = null;
        String ageBasis = batch.getHatchDate() != null ? "HATCH_DATE" : "PLACEMENT_DATE";
        java.time.LocalDate ageStart = batch.getHatchDate() != null ? batch.getHatchDate()
                : batch.getPlacementDate() == null ? null : batch.getPlacementDate().toLocalDate();
        if (batch.getHatchDate() == null) issues.add(new Issue("HATCH_DATE_MISSING", "batch.hatchDate", "Age is calculated since placement, not hatching"));
        if (ageStart != null) {
            long days = ChronoUnit.DAYS.between(ageStart, to.atZone(zone).toLocalDate());
            if (days < 0) issues.add(new Issue("INVALID_DATE", "batch.hatchDate", "Age start date is after the passport date"));
            else age = Math.toIntExact(days);
        }
        if (from == null) missing(issues, "period.from");
        else if (!from.isBefore(to)) issues.add(new Issue("EMPTY_PERIOD", "period", "Batch has no elapsed observation period"));
        check(issues, "batch.cross", batch.getCrossName());
        check(issues, "batch.origin", batch.getOrigin());
        check(issues, "batch.workshop", batch.getWorkshop());
        check(issues, "batch.house", batch.getHouse());
        Integer initial = batch.getInitialBirdCount();
        Integer current = batch.getCurrentBirdCount();
        boolean validPopulation = initial != null && current != null && initial > 0 && current >= 0 && current <= initial;
        if (!validPopulation) issues.add(new Issue("INVALID_POPULATION", "kpi", "Initial/current bird counts are missing or inconsistent"));
        Integer deadBirds = validPopulation ? initial - current : null;
        Double survival = validPopulation ? Math.round(current * 1000.0 / initial) / 10.0 : null;

        List<Sensor> assigned = sensors.findAllById(batch.getSensorIds());
        if (assigned.size() != batch.getSensorIds().size()) issues.add(new Issue("MISSING_SENSOR", "sensorIds", "Some assigned sensors no longer exist"));
        Map<MetricKey, Set<UUID>> groups = new LinkedHashMap<>();
        assigned.stream().sorted(Comparator.comparing(Sensor::getCode)).forEach(sensor ->
                groups.computeIfAbsent(new MetricKey(sensor.getType(), sensor.getUnit()), ignored -> new LinkedHashSet<>()).add(sensor.getId()));
        Map<MetricKey, Norm> norms = batch.getMetricNorms().stream().collect(Collectors.toMap(
                norm -> new MetricKey(norm.getType(), norm.getUnit()), norm -> new Norm(norm.getMinimum(), norm.getMaximum())));
        List<MetricQuery> queries = groups.entrySet().stream()
                .map(entry -> new MetricQuery(entry.getKey(), entry.getValue(), norms.get(entry.getKey()))).toList();
        Snapshot snapshot = new Snapshot(Map.of(), PassportTelemetryReader.emptySchedule());
        boolean unavailable = false;
        if (from != null && from.isBefore(to)) {
            try { snapshot = telemetry.read(queries, batch.getLightingHouseId(), from, to); }
            catch (ResponseStatusException exception) {
                if (Thread.currentThread().isInterrupted()) throw exception;
                unavailable = true;
                issues.add(new Issue("TELEMETRY_UNAVAILABLE", "telemetry", "Telemetry source is unavailable; relational data is still returned"));
            }
        }
        List<Metric> metrics = new ArrayList<>();
        for (SensorType type : SensorType.values()) {
            List<MetricKey> keys = groups.keySet().stream().filter(key -> key.type() == type).toList();
            if (keys.isEmpty()) {
                issues.add(new Issue("SENSOR_NOT_ASSIGNED", type.name(), "No sensor is assigned for this metric"));
                metrics.add(new Metric(type, null, 0, null, null, null, null, null, null, null, Status.UNKNOWN));
            }
            for (MetricKey key : keys) {
                Values values = snapshot.metrics().getOrDefault(key, new Values(0, null, null, null, null, null, null));
                Norm norm = norms.get(key);
                if (norm == null) issues.add(new Issue("NORM_NOT_CONFIGURED", type + ":" + key.unit(), "No approved norm is configured"));
                if (values.count() == 0 && !unavailable) issues.add(new Issue("NO_READINGS", type + ":" + key.unit(), "No readings in this batch period"));
                boolean validValues = values.count() > 0 && values.average() != null && values.minimum() != null
                        && values.maximum() != null && values.latest() != null && values.latestAt() != null;
                if (values.count() > 0 && !validValues) issues.add(new Issue("INVALID_READINGS", type + ":" + key.unit(), "Some telemetry aggregates or timestamps are missing"));
                Status status = !validValues || norm == null || values.deviations() == null ? Status.UNKNOWN
                        : values.deviations() > 0 ? Status.WARNING : Status.NORMAL;
                metrics.add(new Metric(type, key.unit(), values.count(), values.average(), values.minimum(), values.maximum(),
                        values.latest(), values.latestAt(), norm, validValues ? values.deviations() : null, status));
            }
        }
        Schedule schedule = snapshot.schedule();
        if (schedule.status() == Status.UNKNOWN) issues.add(new Issue("LIGHTING_SCHEDULE_MISSING", "lighting.schedule", "No usable lighting schedule data for this batch period"));

        List<Incident> batchIncidents = incidents.findByBatchIdOrderByCreatedAtDesc(batchId);
        List<Notification> batchNotifications = notifications.findByBatchIdOrderByCreatedAtDesc(batchId);
        List<Task> batchTasks = tasks.findByBatchIdOrderByCreateTaskDesc(batchId);
        List<UUID> incidentIds = batchIncidents.stream().map(Incident::getId).toList();
        List<IncidentAttachment> batchAttachments = incidentIds.isEmpty() ? List.of()
                : attachments.findByIncidentIdInOrderByCreatedAtDesc(incidentIds);
        long critical = batchIncidents.stream().filter(i -> i.getPriority() == IncidentPriority.CRITICAL).count();
        long activeCritical = batchIncidents.stream().filter(i -> active(i) && i.getPriority() == IncidentPriority.CRITICAL).count();
        long activeIncidents = batchIncidents.stream().filter(this::active).count();
        long openTasks = batchTasks.stream().filter(task -> !completed(task)).count();
        long deviationCount = metrics.stream().filter(metric -> metric.deviationCount() != null).mapToLong(Metric::deviationCount).sum();
        boolean deviationsComplete = metrics.stream().allMatch(metric -> metric.deviationCount() != null);
        boolean anyDeviationsKnown = metrics.stream().anyMatch(metric -> metric.deviationCount() != null);
        boolean metricWarning = metrics.stream().anyMatch(metric -> metric.status() == Status.WARNING);
        Status status = activeCritical > 0 || schedule.status() == Status.CRITICAL ? Status.CRITICAL
                : activeIncidents > 0 || openTasks > 0 || metricWarning || schedule.status() == Status.WARNING ? Status.WARNING
                : !issues.isEmpty() ? Status.UNKNOWN : Status.NORMAL;

        List<String> risks = new ArrayList<>();
        if (activeCritical > 0) risks.add("Открытых критических инцидентов: " + activeCritical);
        if (activeIncidents > 0) risks.add("Активных инцидентов: " + activeIncidents);
        if (openTasks > 0) risks.add("Открытых задач: " + openTasks);
        if (metricWarning) risks.add("Есть отклонения показателей от утверждённых норм");
        if (schedule.status() == Status.WARNING || schedule.status() == Status.CRITICAL) risks.add("Нарушение светового режима");
        List<String> recommendations = new ArrayList<>();
        if (!risks.isEmpty()) recommendations.add("Проверить отклонения и связанные инциденты/задачи");
        if (!issues.isEmpty()) recommendations.add("Дополнить данные паспорта: см. dataQuality.issues");
        if (status == Status.NORMAL) recommendations.add("Партия в норме, известных отклонений нет");
        return new BatchPassportDto(BatchDto.from(batch), age,
                new BatchKpiDto(initial, current, deadBirds, survival, batchIncidents.size(), Math.toIntExact(critical), Math.toIntExact(openTasks)),
                batchIncidents.stream().map(IncidentBriefDto::from).toList(),
                batchTasks.stream().map(TaskBriefDto::from).toList(),
                batchNotifications.stream().map(NotificationBriefDto::from).toList(),
                new BatchSummaryDto(status == Status.NORMAL ? "OK" : status.name(), List.copyOf(risks), List.copyOf(recommendations)),
                "1.0", now, ageBasis,
                new Period(from, to, zone.getId()), select(metrics, KPI), select(metrics, CLIMATE),
                new Lighting(select(metrics, Set.of(SensorType.LIGHT)), schedule),
                new Consumption(select(metrics, Set.of(SensorType.FEED_CONSUMPTION)), select(metrics, Set.of(SensorType.WATER_FLOW))),
                select(metrics, Set.of(SensorType.MORTALITY)),
                batchAttachments.stream().map(a -> new AttachmentItem(a.getId(), a.getIncidentId(), a.getOriginalFileName(),
                        a.getContentType(), a.getSizeBytes(), a.getMediaType(), a.getCreatedAt(),
                        "/api/v1/incident/" + a.getIncidentId() + "/attachments/" + a.getId() + "/content")).toList(),
                new Aggregates(batchIncidents.size(), critical, activeCritical, openTasks,
                        anyDeviationsKnown ? deviationCount : null, deviationsComplete), status,
                new DataQuality(issues.isEmpty(), List.copyOf(issues)));
    }

    private List<Metric> select(List<Metric> metrics, Set<SensorType> types) {
        return metrics.stream().filter(metric -> types.contains(metric.type())).toList();
    }
    private boolean active(Incident incident) {
        return incident.getStatus() != IncidentStatus.CLOSED && incident.getStatus() != IncidentStatus.RESOLVED
                && incident.getStatus() != IncidentStatus.CANCELLED;
    }
    private boolean completed(Task task) {
        return task.getStatus() != null && COMPLETED_TASKS.contains(task.getStatus().strip().toUpperCase(Locale.ROOT));
    }
    private void check(List<Issue> issues, String field, String value) {
        if (value == null || value.isBlank()) missing(issues, field);
    }
    private void missing(List<Issue> issues, String field) {
        issues.add(new Issue("MISSING_FIELD", field, "Value has not been provided"));
    }
    private ZoneId zone(Batch batch, List<Issue> issues) {
        try { return ZoneId.of(batch.getTimeZone()); }
        catch (DateTimeException | NullPointerException e) {
            issues.add(new Issue("INVALID_TIME_ZONE", "period.timeZone", "Using application time zone because batch time zone is invalid"));
            return clock.getZone();
        }
    }
}
