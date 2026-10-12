package com.broiler_monitoring.entity;

import com.broiler_monitoring.enumerated.BatchStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Entity
@Table(name = "batches")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "batch_number", nullable = false, unique = true)
    private String batchNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchStatus status;

    @NotBlank
    @Column(nullable = false)
    private String workshop;

    @NotBlank
    @Column(nullable = false)
    private String house;

    @Column
    private String zoneName;

    @NotNull
    @Column(name = "placement_date", nullable = false)
    private LocalDateTime placementDate;

    @Column(name = "close_date")
    private LocalDateTime closeDate;

    @NotNull
    @Column(name = "initial_bird_count", nullable = false)
    private Integer initialBirdCount;

    @NotNull
    @Column(name = "current_bird_count", nullable = false)
    private Integer currentBirdCount;

    @Column
    private String origin;

    @Column
    private String crossName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false, length = 64)
    private String timeZone = "Europe/Samara";
    private LocalDate hatchDate;
    private String farm;
    private String lightingHouseId;

    @ElementCollection
    @CollectionTable(name = "batch_sensors", joinColumns = @JoinColumn(name = "batch_id"))
    @Column(name = "sensor_id", nullable = false)
    @Size(max = 256)
    private Set<UUID> sensorIds = new LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "batch_metric_norms", joinColumns = @JoinColumn(name = "batch_id"))
    @Valid
    @Size(max = 64)
    private List<BatchMetricNorm> metricNorms = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
