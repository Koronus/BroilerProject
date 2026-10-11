package com.broiler_monitoring.dto;

import java.util.List;

public record BatchPassportDto(
        BatchDto batch,
        Integer ageDays,
        BatchKpiDto kpi,
        List<IncidentBriefDto> incidents,
        List<TaskBriefDto> tasks,
        List<NotificationBriefDto> notifications,
        BatchSummaryDto summary
) {}
