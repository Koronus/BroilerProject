package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.enumerated.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    Optional<Incident> findByCode(String code);

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByNotificationId(UUID notificationId);

    @Query("SELECT i FROM Incident i " +
            "WHERE COALESCE(i.detectedAt, i.createdAt) >= :from " +
            "AND COALESCE(i.detectedAt, i.createdAt) < :to " +
            "AND (:workshop IS NULL OR i.workshop = :workshop) " +
            "AND (:house IS NULL OR i.house = :house)")
    List<Incident> findForAnalytics(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("workshop") String workshop,
            @Param("house") String house
    );

}
