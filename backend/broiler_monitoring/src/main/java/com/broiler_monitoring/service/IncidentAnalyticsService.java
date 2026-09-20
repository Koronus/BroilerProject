package com.broiler_monitoring.service;

import com.broiler_monitoring.dto.analytics.IncidentAnalyticsResponse;
import com.broiler_monitoring.dto.analytics.IncidentAnalyticsResponse.*;
import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.enumerated.IncidentType;
import com.broiler_monitoring.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncidentAnalyticsService {

    private final IncidentRepository repository;
    private final Clock clock;

    public IncidentAnalyticsService(IncidentRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public IncidentAnalyticsResponse calculate(
            int periodDays, String workshop, String house, int slaMinutes
    ) {
        LocalDateTime to = LocalDateTime.now(clock);
        LocalDateTime from = to.minusDays(periodDays);

        List<Incident> incidents = repository.findForAnalytics(
                from, to,
                emptyToNull(workshop),
                emptyToNull(house)
        );

        KpiDto kpi = calculateKpi(incidents, slaMinutes);
        List<CountBreakdownDto> byType = groupByType(incidents);
        List<CountBreakdownDto> byPriority = groupByPriority(incidents);
        List<CountBreakdownDto> byStatus = groupByStatus(incidents);
        List<HouseAnalyticsDto> byHouse = groupByHouse(incidents, slaMinutes);

        return new IncidentAnalyticsResponse(
                new PeriodDto(from.toString(), to.toString(), periodDays),
                new FiltersDto(emptyToNull(workshop), emptyToNull(house), slaMinutes),
                kpi, byType, byPriority, byStatus, byHouse
        );
    }

    // ── KPI ───────────────────────────────────────────────────────────────────

    private KpiDto calculateKpi(List<Incident> incidents, int slaMinutes) {
        int total = incidents.size();

        int active = (int) incidents.stream()
                .filter(i -> i.getStatus() == IncidentStatus.OPEN
                        || i.getStatus() == IncidentStatus.IN_PROGRESS
                        || i.getStatus() == IncidentStatus.RESOLVED)
                .count();

        int critical = (int) incidents.stream()
                .filter(i -> i.getPriority() == IncidentPriority.CRITICAL)
                .count();

        // Реакция: только не-CANCELLED и со startedAt
        List<Double> reactions = incidents.stream()
                .filter(i -> i.getStatus() != IncidentStatus.CANCELLED)
                .filter(i -> i.getStartedAt() != null)
                .map(this::reactionMinutes)
                .toList();

        Double avgReaction = reactions.isEmpty() ? null
                : reactions.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        Double medianReaction = median(reactions);

        int eligible = (int) incidents.stream()
                .filter(i -> i.getStatus() != IncidentStatus.CANCELLED)
                .count();

        // SLA
        LocalDateTime now = LocalDateTime.now(clock);
        int met = 0, breached = 0, pending = 0;

        for (Incident i : incidents) {
            if (i.getStatus() == IncidentStatus.CANCELLED) continue;

            if (i.getStartedAt() != null) {
                if (reactionMinutes(i) <= slaMinutes) met++;
                else breached++;
            } else {
                long age = ageMinutes(i, now);
                if (age > slaMinutes) breached++;
                else pending++;
            }
        }

        Double slaPercent = (met + breached) == 0 ? null
                : met * 100.0 / (met + breached);

        // Закрытие: только CLOSED с closedAt
        List<Double> closes = incidents.stream()
                .filter(i -> i.getStatus() == IncidentStatus.CLOSED)
                .filter(i -> i.getClosedAt() != null)
                .map(this::closeMinutes)
                .toList();

        Double avgClose = closes.isEmpty() ? null
                : closes.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        Double medianClose = median(closes);

        return new KpiDto(
                total, active, critical,
                avgReaction, medianReaction,
                reactions.size(), eligible,
                met, breached, pending,
                slaPercent,
                avgClose, medianClose, closes.size()
        );
    }

    // ── Формулы ──────────────────────────────────────────────────────────────

    private double reactionMinutes(Incident i) {
        LocalDateTime base = baseTime(i);
        return Duration.between(base, i.getStartedAt()).toMinutes();
    }

    private double closeMinutes(Incident i) {
        LocalDateTime base = baseTime(i);
        return Duration.between(base, i.getClosedAt()).toMinutes();
    }

    private LocalDateTime baseTime(Incident i) {
        return i.getDetectedAt() != null ? i.getDetectedAt() : i.getCreatedAt();
    }

    private long ageMinutes(Incident i, LocalDateTime now) {
        return Duration.between(baseTime(i), now).toMinutes();
    }

    private Double median(List<Double> values) {
        if (values.isEmpty()) return null;
        List<Double> sorted = values.stream().sorted().toList();
        int n = sorted.size();
        if (n % 2 == 1) return sorted.get(n / 2);
        return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }

    // ── Группировки ──────────────────────────────────────────────────────────

    private List<CountBreakdownDto> groupByType(List<Incident> incidents) {
        return incidents.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getType() != null ? i.getType() : IncidentType.OTHER,
                        Collectors.counting()))
                .entrySet().stream()
                .map(e -> new CountBreakdownDto(
                        e.getKey().name(),
                        e.getKey().getDisplayName(),
                        e.getValue().intValue()))
                .sorted(Comparator.comparingInt(CountBreakdownDto::count).reversed())
                .toList();
    }

    private List<CountBreakdownDto> groupByPriority(List<Incident> incidents) {
        Map<IncidentPriority, String> labels = Map.of(
                IncidentPriority.LOW, "Низкий",
                IncidentPriority.MEDIUM, "Средний",
                IncidentPriority.HIGH, "Высокий",
                IncidentPriority.CRITICAL, "Критический"
        );
        return incidents.stream()
                .filter(i -> i.getPriority() != null)
                .collect(Collectors.groupingBy(Incident::getPriority, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new CountBreakdownDto(
                        e.getKey().name(),
                        labels.getOrDefault(e.getKey(), e.getKey().name()),
                        e.getValue().intValue()))
                .sorted(Comparator.comparingInt(CountBreakdownDto::count).reversed())
                .toList();
    }

    private List<CountBreakdownDto> groupByStatus(List<Incident> incidents) {
        Map<IncidentStatus, String> labels = Map.of(
                IncidentStatus.OPEN, "Открыт",
                IncidentStatus.IN_PROGRESS, "В работе",
                IncidentStatus.RESOLVED, "Решён",
                IncidentStatus.CLOSED, "Закрыт",
                IncidentStatus.CANCELLED, "Отменён"
        );
        return incidents.stream()
                .filter(i -> i.getStatus() != null)
                .collect(Collectors.groupingBy(Incident::getStatus, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new CountBreakdownDto(
                        e.getKey().name(),
                        labels.getOrDefault(e.getKey(), e.getKey().name()),
                        e.getValue().intValue()))
                .sorted(Comparator.comparingInt(CountBreakdownDto::count).reversed())
                .toList();
    }

    private List<HouseAnalyticsDto> groupByHouse(List<Incident> incidents, int slaMinutes) {
        Map<String, List<Incident>> grouped = incidents.stream()
                .filter(i -> i.getWorkshop() != null && i.getHouse() != null)
                .collect(Collectors.groupingBy(i -> i.getWorkshop() + "|" + i.getHouse()));

        List<HouseAnalyticsDto> result = new ArrayList<>();

        for (Map.Entry<String, List<Incident>> entry : grouped.entrySet()) {
            String[] parts = entry.getKey().split("\\|", 2);
            String workshop = parts[0];
            String house = parts.length > 1 ? parts[1] : "";

            List<Incident> list = entry.getValue();

            int total = list.size();
            int critical = (int) list.stream()
                    .filter(i -> i.getPriority() == IncidentPriority.CRITICAL)
                    .count();

            List<Double> reactions = list.stream()
                    .filter(i -> i.getStatus() != IncidentStatus.CANCELLED)
                    .filter(i -> i.getStartedAt() != null)
                    .map(this::reactionMinutes)
                    .toList();

            Double avgReaction = reactions.isEmpty() ? null
                    : reactions.stream().mapToDouble(Double::doubleValue).average().orElse(0);

            int met = 0, breached = 0;
            LocalDateTime now = LocalDateTime.now(clock);

            for (Incident i : list) {
                if (i.getStatus() == IncidentStatus.CANCELLED) continue;
                if (i.getStartedAt() != null) {
                    if (reactionMinutes(i) <= slaMinutes) met++;
                    else breached++;
                } else {
                    long age = ageMinutes(i, now);
                    if (age > slaMinutes) breached++;
                }
            }

            Double slaPercent = (met + breached) == 0 ? null
                    : met * 100.0 / (met + breached);

            int closed = (int) list.stream()
                    .filter(i -> i.getStatus() == IncidentStatus.CLOSED)
                    .count();

            result.add(new HouseAnalyticsDto(
                    workshop, house, total, critical,
                    avgReaction, met, breached, slaPercent, closed
            ));
        }

        result.sort(Comparator.comparingInt(HouseAnalyticsDto::total).reversed());
        return result;
    }

    // ── Утилиты ──────────────────────────────────────────────────────────────

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
