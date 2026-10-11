package com.broiler_monitoring.service;

import com.broiler_monitoring.dto.BatchDto;
import com.broiler_monitoring.entity.Batch;
import com.broiler_monitoring.repository.BatchRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BatchService {

    private final BatchRepository repository;

    public BatchService(BatchRepository repository) {
        this.repository = repository;
    }

    public List<BatchDto> findAll() {
        return repository.findAll().stream()
                .map(BatchDto::from)
                .toList();
    }

    public BatchDto findById(UUID id) {
        Batch batch = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Партия с id '%s' не найдена".formatted(id)));
        return BatchDto.from(batch);
    }

    public BatchDto findByNumber(String batchNumber) {
        Batch batch = repository.findByBatchNumber(batchNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Партия с номером '%s' не найдена".formatted(batchNumber)));
        return BatchDto.from(batch);
    }

    public Batch getEntityById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Партия с id '%s' не найдена".formatted(id)));
    }
}