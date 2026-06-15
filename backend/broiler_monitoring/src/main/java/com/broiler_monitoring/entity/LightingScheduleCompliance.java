package com.broiler_monitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lighting_schedule_compliance")
@Getter
@Setter
@NoArgsConstructor
public class LightingScheduleCompliance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "house_id", nullable = false)
    private String houseId;

    @Column(name = "scheduled_light_minutes", nullable = false)
    private Integer scheduledLightMinutes;

    @Column(name = "actual_light_minutes", nullable = false)
    private Integer actualLightMinutes;

    @Column(name = "scheduled_dark_minutes", nullable = false)
    private Integer scheduledDarkMinutes;

    @Column(name = "actual_dark_minutes", nullable = false)
    private Integer actualDarkMinutes;

    @Column(name = "deviation_minutes_total", nullable = false)
    private Integer deviationMinutesTotal;

    @Column(name = "compliance_percent", nullable = false)
    private Double compliancePercent;

    @Column(nullable = false)
    private String status;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}
