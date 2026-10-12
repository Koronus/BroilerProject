package com.broiler_monitoring.service;


import com.broiler_monitoring.entity.Notification;
import com.broiler_monitoring.enumerated.NotificationStatus;
import com.broiler_monitoring.repository.NotificationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    private final BatchReferenceValidator batchReferences;
    private final com.broiler_monitoring.repository.IncidentRepository incidents;
    public NotificationService(NotificationRepository repository, BatchReferenceValidator batchReferences,
                               com.broiler_monitoring.repository.IncidentRepository incidents){
        this.repository = repository;
        this.batchReferences = batchReferences;
        this.incidents = incidents;
    }

    public List<Notification> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Notification getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification with id '%s' not found".formatted(id)));
    }

    public Notification getByCode(String code) {
        return repository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification with code '%s' not found".formatted(code)));
    }

    public Notification create(Notification notification) {
        batchReferences.validate(notification.getBatchId());
        return repository.save(notification);
    }

    public Notification update(UUID id, Notification updatedNotification) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification with id '%s' not found".formatted(id)));
        notification.setCode(updatedNotification.getCode());
        if (updatedNotification.getBatchId() != null) {
            batchReferences.validate(updatedNotification.getBatchId());
            if (incidents.findByNotificationId(id).stream().anyMatch(incident -> incident.getBatchId() != null
                    && !incident.getBatchId().equals(updatedNotification.getBatchId()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification and incident must belong to the same batch");
            }
            notification.setBatchId(updatedNotification.getBatchId());
        }
        notification.setTitle(updatedNotification.getTitle());
        notification.setDescription(updatedNotification.getDescription());
        notification.setSource(updatedNotification.getSource());
        notification.setSourceDetail(updatedNotification.getSourceDetail());
        notification.setStatus(updatedNotification.getStatus());
        notification.setPriority(updatedNotification.getPriority());

        return repository.save(notification);
    }

    public Notification changeStatus(UUID id, NotificationStatus newStatus){
        Notification notification = repository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Notification with id '%s' not found".formatted(id)
                ));
        notification.setStatus(newStatus);
        return repository.save(notification);
    }
}
