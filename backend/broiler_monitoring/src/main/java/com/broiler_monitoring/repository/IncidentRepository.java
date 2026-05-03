package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.enumerated.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    Optional<Incident> findByCode(String code);

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByNotificationId(UUID notificationId);

}
