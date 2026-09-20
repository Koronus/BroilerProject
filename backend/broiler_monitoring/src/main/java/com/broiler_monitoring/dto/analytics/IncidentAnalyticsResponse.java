package com.broiler_monitoring.dto.analytics;

import java.util.List;

public record IncidentAnalyticsResponse(
        PeriodDto period,
        FiltersDto filters,
        KpiDto kpi,
        List<CountBreakdownDto> byType,
        List<CountBreakdownDto> byPriority,
        List<CountBreakdownDto> byStatus,
        List<HouseAnalyticsDto> byHouse
) {
    public record PeriodDto(String from, String to, int days) {}
    public record FiltersDto(String workshop, String house, int slaMinutes) {}

    public record KpiDto(
            int total,
            int active,
            int critical,
            Double avgReactionMinutes,
            Double medianReactionMinutes,
            int reactionMeasuredCount,
            int reactionEligibleCount,
            int slaMetCount,
            int slaBreachedCount,
            int slaPendingCount,
            Double slaPercent,
            Double avgCloseMinutes,
            Double medianCloseMinutes,
            int closeMeasuredCount
    ) {}

    public record CountBreakdownDto(String key, String label, int count) {}

    public record HouseAnalyticsDto(
            String workshop,
            String house,
            int total,
            int critical,
            Double avgReactionMinutes,
            int slaMetCount,
            int slaBreachedCount,
            Double slaPercent,
            int closed
    ) {}
}