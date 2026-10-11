package com.broiler_monitoring.dto;

import com.broiler_monitoring.entity.Notification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationBriefDto(
        UUID id,
        String code,
        String title,
        String status,
        String priority,
        LocalDateTime createdAt
) {
    public static NotificationBriefDto from(Notification n) {
        return new NotificationBriefDto(
                n.getId(),
                n.getCode(),
                n.getTitle(),
                n.getStatus() != null ? n.getStatus().name() : null,
                n.getPriority() != null ? n.getPriority().name() : null,
                n.getCreatedAt()
        );
    }
}