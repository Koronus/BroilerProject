package com.broiler_monitoring.dto;

public record BatchKpiDto(
        Integer initialBirdCount,
        Integer currentBirdCount,
        Integer mortality,
        Double survivalRate,
        Integer totalIncidents,
        Integer criticalIncidents,
        Integer openTasks
) {}
