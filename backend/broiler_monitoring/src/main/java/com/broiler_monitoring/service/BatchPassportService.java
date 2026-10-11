package com.broiler_monitoring.service;

import com.broiler_monitoring.dto.*;
import com.broiler_monitoring.entity.Batch;
import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.entity.Notification;
import com.broiler_monitoring.entity.Task;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.repository.IncidentRepository;
import com.broiler_monitoring.repository.NotificationRepository;
import com.broiler_monitoring.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BatchPassportService {

    private final BatchService batchService;
    private final IncidentRepository incidentRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    public BatchPassportService(
            BatchService batchService,
            IncidentRepository incidentRepository,
            TaskRepository taskRepository,
            NotificationRepository notificationRepository
    ) {
        this.batchService = batchService;
        this.incidentRepository = incidentRepository;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
    }

    public BatchPassportDto getPassport(UUID batchId) {
        Batch batch = batchService.getEntityById(batchId);

        List<Incident> incidents = incidentRepository.findByBatchId(batchId);
        List<Task> tasks = taskRepository.findByBatchId(batchId);
        List<Notification> notifications = notificationRepository.findByBatchId(batchId);

        // Возраст партии в днях
        int ageDays = 0;
        if (batch.getPlacementDate() != null) {
            LocalDate start = batch.getPlacementDate().toLocalDate();
            LocalDate end = batch.getCloseDate() != null
                    ? batch.getCloseDate().toLocalDate()
                    : LocalDate.now();
            ageDays = (int) ChronoUnit.DAYS.between(start, end);
        }

        // KPI
        int initial = batch.getInitialBirdCount() != null ? batch.getInitialBirdCount() : 0;
        int current = batch.getCurrentBirdCount() != null ? batch.getCurrentBirdCount() : 0;
        int mortality = initial - current;
        double survivalRate = initial > 0 ? (current * 100.0 / initial) : 0;

        long criticalIncidents = incidents.stream()
                .filter(i -> i.getPriority() == IncidentPriority.CRITICAL)
                .count();

        long openTasks = tasks.stream()
                .filter(t -> !"CLOSED".equals(t.getStatus()) && !"DONE".equals(t.getStatus()))
                .count();

        BatchKpiDto kpi = new BatchKpiDto(
                initial,
                current,
                mortality,
                Math.round(survivalRate * 10.0) / 10.0,
                incidents.size(),
                (int) criticalIncidents,
                (int) openTasks
        );

        // Итоговая оценка
        BatchSummaryDto summary = calculateSummary(batch, incidents, mortality);

        return new BatchPassportDto(
                BatchDto.from(batch),
                ageDays,
                kpi,
                incidents.stream().map(IncidentBriefDto::from).toList(),
                tasks.stream().map(TaskBriefDto::from).toList(),
                notifications.stream().map(NotificationBriefDto::from).toList(),
                summary
        );
    }

    private BatchSummaryDto calculateSummary(Batch batch, List<Incident> incidents, double mortality) {
        List<String> risks = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // Открытые критические инциденты
        long openCritical = incidents.stream()
                .filter(i -> i.getPriority() == IncidentPriority.CRITICAL)
                .filter(i -> i.getStatus() != IncidentStatus.CLOSED)
                .filter(i -> i.getStatus() != IncidentStatus.CANCELLED)
                .count();

        if (openCritical > 0) {
            risks.add("Открытых критических инцидентов: " + openCritical);
            recommendations.add("Разобраться с критическими инцидентами");
        }

        // Смертность выше 5%
        if (mortality > 0 && batch.getInitialBirdCount() != null && batch.getInitialBirdCount() > 0) {
            double mortalityPercent = mortality * 100.0 / batch.getInitialBirdCount();
            if (mortalityPercent > 5.0) {
                risks.add(String.format("Смертность выше 5%%: %.1f%%", mortalityPercent));
                recommendations.add("Проверить условия содержания и здоровье стада");
            }
        }

        // Критические инциденты вообще
        if (openCritical == 0 && risks.isEmpty()) {
            recommendations.add("Партия в норме, критических отклонений нет");
        }

        String status = risks.isEmpty() ? "OK"
                : (openCritical > 0 ? "CRITICAL" : "WARNING");

        return new BatchSummaryDto(status, risks, recommendations);
    }
}
