package com.broiler_monitoring.service;


import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.entity.Notification;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentSource;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.enumerated.NotificationStatus;
import com.broiler_monitoring.repository.IncidentRepository;
import com.broiler_monitoring.repository.NotificationRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentService {

    private static final DateTimeFormatter INCIDENT_CODE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final IncidentRepository repository;
    private final NotificationRepository notificationRepository;

    public IncidentService(IncidentRepository repository, NotificationRepository notificationRepository){
        this.repository = repository;
        this.notificationRepository = notificationRepository;
    }

    public List<Incident> findAll(){
        return repository.findAll();
    }

    public Incident getById(UUID id){
        return repository.findById(id)
                .orElseThrow(()->new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident with id '%s' not found".formatted(id)));
    }
    public Incident getByCode(String code){
        return repository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incidetn with code '%s' not found".formatted(code)));
    }
    public Incident create(Incident incident){
        return repository.save(incident);
    }

    @Transactional
    public Incident createFromNotification(UUID notificationId, Incident incidentRequest){
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification with id '%s' not found".formatted(notificationId)));

        if (!repository.findByNotificationId(notificationId).isEmpty()){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Incident for notification with id '%s' already exists".formatted(notificationId));
        }

        Incident incident = new Incident();
        Incident request = incidentRequest != null ? incidentRequest : new Incident();

        incident.setCode(firstNotBlank(request.getCode(), generateIncidentCode()));
        incident.setTitle(firstNotBlank(request.getTitle(), notification.getTitle()));
        incident.setDescription(firstNotBlank(request.getDescription(), notification.getDescription()));
        incident.setPriority(request.getPriority() != null ? request.getPriority() : mapNotificationPriority(notification));
        incident.setSource(IncidentSource.NOTIFICATION);
        incident.setStatus(IncidentStatus.OPEN);
        incident.setNotificationId(notification.getId());
        incident.setResponsible(request.getResponsible());
        incident.setDecisionComment(request.getDecisionComment());
        incident.setDetectedAt(request.getDetectedAt() != null ? request.getDetectedAt() : notification.getCreatedAt());

        notification.setStatus(NotificationStatus.INCIDENT_CREATED);
        notificationRepository.save(notification);

        return repository.save(incident);
    }

    public Incident update(UUID id, Incident updatedIncident){
        Incident incident = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident with id '%s' not found".formatted(id)));

        incident.setTitle(updatedIncident.getTitle());
        incident.setDescription(updatedIncident.getDescription());
        incident.setCode(updatedIncident.getCode());
        incident.setPriority(updatedIncident.getPriority());
        incident.setSource(updatedIncident.getSource());
        incident.setStatus(updatedIncident.getStatus());
        incident.setDetectedAt(updatedIncident.getDetectedAt());
        incident.setClosedAt(updatedIncident.getClosedAt());
        incident.setResolvedAt(updatedIncident.getResolvedAt());
        incident.setResponsible(updatedIncident.getResponsible());
        incident.setNotificationId(updatedIncident.getNotificationId());
        incident.setDecisionComment(updatedIncident.getDecisionComment());

        return repository.save(incident);

    }

    public Incident changeStatus(UUID id, IncidentStatus newStatus){
        Incident incident = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident with id '%s' not found".formatted(id)));
        incident.setStatus(newStatus);

        return repository.save(incident);
    }

    private String firstNotBlank(String value, String defaultValue){
        return value != null && !value.isBlank() ? value : defaultValue;
    }

    private String generateIncidentCode(){
        String datePart = LocalDateTime.now().format(INCIDENT_CODE_DATE_FORMAT);
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return "INC-" + datePart + "-" + randomPart;
    }

    private IncidentPriority mapNotificationPriority(Notification notification){
        return IncidentPriority.valueOf(notification.getPriority().name());
    }

}
