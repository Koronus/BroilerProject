package com.broiler_monitoring.dto;

import com.broiler_monitoring.entity.Task;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskBriefDto(
        UUID id,
        String nameTask,
        String responsible,
        String status,
        String priority,
        LocalDateTime termTask
) {
    public static TaskBriefDto from(Task t) {
        return new TaskBriefDto(
                t.getId(),
                t.getNameTask(),
                t.getResponsible(),
                t.getStatus(),
                t.getPriority(),
                t.getTermTask()
        );
    }
}
