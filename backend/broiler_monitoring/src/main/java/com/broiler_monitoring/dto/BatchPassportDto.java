package com.broiler_monitoring.dto;

import java.util.List;
import java.time.Instant;
import com.broiler_monitoring.dto.passport.PassportSections.*;

public record BatchPassportDto(
        BatchDto batch,
        Integer ageDays,
        BatchKpiDto kpi,
        List<IncidentBriefDto> incidents,
        List<TaskBriefDto> tasks,
        List<NotificationBriefDto> notifications,
        BatchSummaryDto summary,
        String schemaVersion,
        Instant generatedAt,
        String ageBasis,
        Period period,
        List<Metric> kpis,
        List<Metric> microclimate,
        Lighting lighting,
        Consumption consumption,
        List<Metric> mortality,
        List<AttachmentItem> attachments,
        Aggregates aggregates,
        Status status,
        DataQuality dataQuality
) {}
