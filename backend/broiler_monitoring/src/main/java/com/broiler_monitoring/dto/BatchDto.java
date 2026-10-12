package com.broiler_monitoring.dto;

import com.broiler_monitoring.entity.Batch;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;

public record BatchDto(
        UUID id,
        String batchNumber,
        String status,
        String workshop,
        String house,
        String zone,
        LocalDateTime placementDate,
        LocalDateTime closeDate,
        Integer initialBirdCount,
        Integer currentBirdCount,
        String origin,
        String cross,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String timeZone,
        LocalDate hatchDate,
        String farm
) {
    public static BatchDto from(Batch batch) {
        return new BatchDto(
                batch.getId(),
                batch.getBatchNumber(),
                batch.getStatus() == null ? null : batch.getStatus().name(),
                batch.getWorkshop(),
                batch.getHouse(),
                batch.getZoneName(),
                batch.getPlacementDate(),
                batch.getCloseDate(),
                batch.getInitialBirdCount(),
                batch.getCurrentBirdCount(),
                batch.getOrigin(),
                batch.getCrossName(),
                batch.getCreatedAt(),
                batch.getUpdatedAt(),
                batch.getTimeZone(),
                batch.getHatchDate(),
                batch.getFarm()
        );
    }
}
