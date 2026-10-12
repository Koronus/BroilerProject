package com.broiler_monitoring.dto.passport;

import com.broiler_monitoring.Telemetry.SensorType;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class PassportSections {
    private PassportSections() {}
    public enum Status { NORMAL, WARNING, CRITICAL, UNKNOWN }
    public record Period(Instant from, Instant to, String timeZone) {}
    public record Norm(Double minimum, Double maximum) {}
    public record Metric(SensorType type, String unit, long sampleCount,
                         Double average, Double minimum, Double maximum,
                         Double latest, Instant latestAt, Norm norm,
                         Long deviationCount, Status status) {}
    public record Lighting(List<Metric> illuminance, Schedule schedule) {}
    public record Schedule(long sampleCount, Double averageCompliancePercent,
                           Double minimumCompliancePercent, Double maximumCompliancePercent,
                           Double latestCompliancePercent, Integer scheduledLightMinutes,
                           Integer actualLightMinutes, Integer scheduledDarkMinutes,
                           Integer actualDarkMinutes, Integer deviationMinutes,
                           Instant latestAt, Status status) {}
    public record Consumption(List<Metric> feed, List<Metric> water) {}
    public record AttachmentItem(UUID id, UUID incidentId, String fileName, String contentType,
                                 long sizeBytes, String mediaType, LocalDateTime createdAt,
                                 String contentPath) {}
    public record Aggregates(long incidentCount, long criticalIncidentCount,
                             long activeCriticalIncidentCount, long openTaskCount,
                             Long deviationCount, boolean deviationsComplete) {}
    public record Issue(String code, String field, String message) {}
    public record DataQuality(boolean complete, List<Issue> issues) {}
}
