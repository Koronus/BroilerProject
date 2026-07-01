package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, UUID> {
}
