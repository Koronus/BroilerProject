package com.broiler_monitoring.service;

import com.broiler_monitoring.dto.analytics.IncidentAnalyticsResponse;
import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentSource;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.enumerated.IncidentType;
import com.broiler_monitoring.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class IncidentAnalyticsServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Samara");
    private static final Instant FIXED_NOW = Instant.parse("2026-09-20T10:00:00Z");

    private IncidentRepository repository;
    private IncidentAnalyticsService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(IncidentRepository.class);
        Clock clock = Clock.fixed(FIXED_NOW, ZONE);
        service = new IncidentAnalyticsService(repository, clock);
    }

    private LocalDateTime at(String iso) {
        return LocalDateTime.ofInstant(Instant.parse(iso), ZONE);
    }

    private Incident incident(IncidentStatus status,
                              LocalDateTime createdAt,
                              LocalDateTime detectedAt,
                              LocalDateTime startedAt,
                              LocalDateTime closedAt) {
        Incident i = new Incident();
        i.setId(UUID.randomUUID());
        i.setCode("TEST-" + UUID.randomUUID());
        i.setTitle("Test");
        i.setStatus(status);
        i.setPriority(IncidentPriority.MEDIUM);
        i.setSource(IncidentSource.MANUAL);
        i.setType(IncidentType.MICROCLIMATE);
        i.setCreatedAt(createdAt);
        i.setDetectedAt(detectedAt);
        i.setStartedAt(startedAt);
        i.setClosedAt(closedAt);
        return i;
    }

    // ── 1. Реакция ровно 30 минут → SLA met ──
    @Test
    void reactionExactly30Minutes_isSlaMet() {
        Incident i = incident(
                IncidentStatus.IN_PROGRESS,
                at("2026-09-19T10:00:00Z"),
                at("2026-09-19T10:00:00Z"),
                at("2026-09-19T10:30:00Z"),
                null
        );

        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of(i));

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().slaMetCount()).isEqualTo(1);
        assertThat(response.kpi().slaBreachedCount()).isZero();
        assertThat(response.kpi().slaPercent()).isEqualTo(100.0);
    }

    // ── 2. Реакция 31 минута → SLA breached ──
    @Test
    void reaction31Minutes_isSlaBreached() {
        Incident i = incident(
                IncidentStatus.IN_PROGRESS,
                at("2026-09-19T10:00:00Z"),
                at("2026-09-19T10:00:00Z"),
                at("2026-09-19T10:31:00Z"),
                null
        );

        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of(i));

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().slaMetCount()).isZero();
        assertThat(response.kpi().slaBreachedCount()).isEqualTo(1);
        assertThat(response.kpi().slaPercent()).isEqualTo(0.0);
    }

    // ── 3. Нет startedAt, возраст 20 мин → SLA pending ──
    @Test
    void noStartedAt_age20Minutes_isSlaPending() {
        Incident i = incident(
                IncidentStatus.OPEN,
                at("2026-09-20T09:40:00Z"),
                at("2026-09-20T09:40:00Z"),
                null,
                null
        );

        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of(i));

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().slaPendingCount()).isEqualTo(1);
        assertThat(response.kpi().slaMetCount()).isZero();
        assertThat(response.kpi().slaBreachedCount()).isZero();
        assertThat(response.kpi().slaPercent()).isNull();
    }

    // ── 4. Нет startedAt, возраст 40 мин → SLA breached ──
    @Test
    void noStartedAt_age40Minutes_isSlaBreached() {
        Incident i = incident(
                IncidentStatus.OPEN,
                at("2026-09-20T09:20:00Z"),
                at("2026-09-20T09:20:00Z"),
                null,
                null
        );

        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of(i));

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().slaBreachedCount()).isEqualTo(1);
        assertThat(response.kpi().slaPendingCount()).isZero();
        assertThat(response.kpi().slaPercent()).isEqualTo(0.0);
    }

    // ── 5. CANCELLED → в total/byStatus, не в SLA ──
    @Test
    void cancelled_isInTotalButNotInSla() {
        Incident i = incident(
                IncidentStatus.CANCELLED,
                at("2026-09-19T10:00:00Z"),
                at("2026-09-19T10:00:00Z"),
                null,
                null
        );

        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of(i));

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().total()).isEqualTo(1);
        assertThat(response.kpi().reactionEligibleCount()).isZero();
        assertThat(response.kpi().slaMetCount()).isZero();
        assertThat(response.kpi().slaBreachedCount()).isZero();
        assertThat(response.kpi().slaPendingCount()).isZero();
        assertThat(response.byStatus())
                .anyMatch(s -> s.key().equals("CANCELLED") && s.count() == 1);
    }

    // ── 6. Пустая выборка → null ──
    @Test
    void emptySelection_returnsNullMetrics() {
        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of());

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().total()).isZero();
        assertThat(response.kpi().avgReactionMinutes()).isNull();
        assertThat(response.kpi().medianReactionMinutes()).isNull();
        assertThat(response.kpi().avgCloseMinutes()).isNull();
        assertThat(response.kpi().medianCloseMinutes()).isNull();
        assertThat(response.kpi().closeMeasuredCount()).isZero();
        assertThat(response.kpi().slaPercent()).isNull();
    }

    // ── 7. Чётная медиана → среднее двух центральных ──
    @Test
    void evenNumberOfValues_medianIsAverageOfTwoMiddle() {
        // Реакции: 10, 20, 30, 40 → медиана = (20 + 30) / 2 = 25
        Incident i1 = incident(IncidentStatus.IN_PROGRESS,
                at("2026-09-19T08:00:00Z"), at("2026-09-19T08:00:00Z"),
                at("2026-09-19T08:10:00Z"), null);
        Incident i2 = incident(IncidentStatus.IN_PROGRESS,
                at("2026-09-19T09:00:00Z"), at("2026-09-19T09:00:00Z"),
                at("2026-09-19T09:20:00Z"), null);
        Incident i3 = incident(IncidentStatus.IN_PROGRESS,
                at("2026-09-19T10:00:00Z"), at("2026-09-19T10:00:00Z"),
                at("2026-09-19T10:30:00Z"), null);
        Incident i4 = incident(IncidentStatus.IN_PROGRESS,
                at("2026-09-19T11:00:00Z"), at("2026-09-19T11:00:00Z"),
                at("2026-09-19T11:40:00Z"), null);

        when(repository.findForAnalytics(any(), any(), any(), any()))
                .thenReturn(List.of(i1, i2, i3, i4));

        IncidentAnalyticsResponse response = service.calculate(7, null, null, 30);

        assertThat(response.kpi().medianReactionMinutes()).isEqualTo(25.0);
        assertThat(response.kpi().avgReactionMinutes()).isEqualTo(25.0);
    }
}