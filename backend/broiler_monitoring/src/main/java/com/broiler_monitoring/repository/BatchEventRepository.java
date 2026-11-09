package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.BatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BatchEventRepository extends JpaRepository<BatchEvent, UUID> {
    List<BatchEvent> findByBatchIdOrderBySequenceAsc(UUID batchId);
    Optional<BatchEvent> findTopByBatchIdOrderBySequenceDesc(UUID batchId);
}