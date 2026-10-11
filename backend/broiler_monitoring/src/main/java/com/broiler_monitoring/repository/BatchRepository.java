package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.Batch;
import com.broiler_monitoring.enumerated.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BatchRepository extends JpaRepository<Batch, UUID> {

    Optional<Batch> findByBatchNumber(String batchNumber);

    List<Batch> findByStatus(BatchStatus status);

    List<Batch> findByWorkshopAndHouse(String workshop, String house);
}
