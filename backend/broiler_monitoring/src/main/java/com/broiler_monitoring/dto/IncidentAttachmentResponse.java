package com.broiler_monitoring.dto;

import com.broiler_monitoring.entity.IncidentAttachment;

import java.time.LocalDateTime;
import java.util.UUID;

public record IncidentAttachmentResponse(
        UUID id,
        UUID incidentId,
        String originalFileName,
        String contentType,
        long sizeBytes,
        String mediaType,
        String bucket,
        String storageKey,
        LocalDateTime createdAt
) {
    public static IncidentAttachmentResponse from(IncidentAttachment attachment) {
        return new IncidentAttachmentResponse(
                attachment.getId(),
                attachment.getIncidentId(),
                attachment.getOriginalFileName(),
                attachment.getContentType(),
                attachment.getSizeBytes(),
                attachment.getMediaType(),
                attachment.getBucket(),
                attachment.getStorageKey(),
                attachment.getCreatedAt()
        );
    }
}
