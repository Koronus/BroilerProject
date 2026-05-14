package com.broiler_monitoring.Telemetry.TelemetryReading;


import com.broiler_monitoring.Telemetry.Sensor;
import com.broiler_monitoring.Telemetry.SensorType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sensor_readings")
@Getter
@Setter
@NoArgsConstructor
public class SensorReading {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_id", nullable = false)
    private Sensor sensor;

    @NotBlank
    @Column(nullable = false)
    private String sensorCode;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SensorType type;

    @NotNull
    @Column(nullable = false)
    private Double value;

    @NotNull
    @Column(nullable = false)
    private String unit;

    @NotNull
    @Column(nullable = false)
    private Instant measuredAt;

    @Column(nullable = false)
    private Instant receivedAt;

    @PrePersist
    public void prePersist(){
        receivedAt = Instant.now();
    }


}
