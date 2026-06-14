package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.IncidentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, UUID> {
    List<IncidentAttachment> findByIncidentIdOrderByCreatedAtDesc(UUID incidentId);
}
