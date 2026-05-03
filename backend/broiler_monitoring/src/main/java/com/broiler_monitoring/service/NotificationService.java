package com.broiler_monitoring.service;


import com.broiler_monitoring.entity.Notification;
import com.broiler_monitoring.enumerated.NotificationStatus;
import com.broiler_monitoring.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    public NotificationService(NotificationRepository repository){
        this.repository = repository;
    }

    public List<Notification> findAll() {
        return repository.findAll();
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
        return repository.save(notification);
    }

    public Notification update(UUID id, Notification updatedNotification) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification with id '%s' not found".formatted(id)));
        notification.setCode(updatedNotification.getCode());
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
