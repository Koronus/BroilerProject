package com.broiler_monitoring.entity;

import com.broiler_monitoring.Telemetry.SensorType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class BatchMetricNorm {
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private SensorType type;
    @NotBlank
    @Size(max = 64)
    @Column(nullable = false, length = 64)
    private String unit;
    @Column(name = "lower_bound")
    private Double minimum;
    @Column(name = "upper_bound")
    private Double maximum;
}
