package com.broiler_monitoring.dto;

import com.broiler_monitoring.entity.BatchEvent;
import com.broiler_monitoring.enumerated.BatchEventType;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record BatchEventDto(
        UUID id,
        UUID batchId,
        Integer sequence,
        String schemaVersion,
        String eventType,
        String eventTypeLabel,
        LocalDateTime occurredAt,
        LocalDateTime registeredAt,
        String description,
        Map<String, Object> payload,
        UUID actorId,
        String actorName,
        String dataHash,
        String blockchainTxId,
        String blockchainStatus,
        String verificationStatus,
        LocalDateTime verifiedAt,
        String errorCode,
        String errorMessage
) {
    public static BatchEventDto from(BatchEvent e) {
        return new BatchEventDto(
                e.getId(), e.getBatchId(), e.getSequence(), e.getSchemaVersion(),
                e.getEventType().name(),
                e.getEventType().getLabel(),
                e.getOccurredAt(), e.getRegisteredAt(), e.getDescription(), e.getPayload(),
                e.getActorId(), e.getActorName(),
                e.getDataHash(), e.getBlockchainTxId(), e.getBlockchainStatus(),
                e.getVerificationStatus(), e.getVerifiedAt(), e.getErrorCode(), e.getErrorMessage()
        );
    }
}