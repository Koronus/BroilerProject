package com.broiler_monitoring.dto;

import com.broiler_monitoring.entity.Incident;

import java.time.LocalDateTime;
import java.util.UUID;

public record IncidentBriefDto(
        UUID id,
        String code,
        String title,
        String status,
        String priority,
        String type,
        LocalDateTime createdAt,
        LocalDateTime startedAt,
        Long reactionMinutes
) {
    public static IncidentBriefDto from(Incident i) {
        return new IncidentBriefDto(
                i.getId(),
                i.getCode(),
                i.getTitle(),
                i.getStatus() != null ? i.getStatus().name() : null,
                i.getPriority() != null ? i.getPriority().name() : null,
                i.getType() != null ? i.getType().name() : null,
                i.getCreatedAt(),
                i.getStartedAt(),
                i.getReactionMinutes()
        );
    }
}
