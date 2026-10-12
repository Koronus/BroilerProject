package com.broiler_monitoring.dto.passport;

import com.broiler_monitoring.entity.Batch;
import com.broiler_monitoring.entity.BatchMetricNorm;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record BatchPassportSettings(
        @NotBlank @Size(max = 64) String timeZone,
        @Size(max = 255) String farm,
        LocalDate hatchDate,
        @Size(max = 255) String lightingHouseId,
        @NotNull @Size(max = 256) Set<@NotNull UUID> sensorIds,
        @NotNull @Size(max = 64) @Valid List<@NotNull BatchMetricNorm> metricNorms
) {
    public static BatchPassportSettings from(Batch batch) {
        return new BatchPassportSettings(batch.getTimeZone(), batch.getFarm(), batch.getHatchDate(),
                batch.getLightingHouseId(), Set.copyOf(batch.getSensorIds()), List.copyOf(batch.getMetricNorms()));
    }
}
