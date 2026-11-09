package com.broiler_monitoring.dto;

import com.broiler_monitoring.enumerated.BatchEventType;
import java.time.LocalDateTime;
import java.util.Map;

public record CreateBatchEventRequest(
        BatchEventType eventType,
        LocalDateTime occurredAt,
        String description,
        Map<String, Object> payload
) {}