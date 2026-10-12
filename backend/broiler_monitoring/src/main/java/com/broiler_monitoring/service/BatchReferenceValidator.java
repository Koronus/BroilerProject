package com.broiler_monitoring.service;

import com.broiler_monitoring.repository.BatchRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@Component
public class BatchReferenceValidator {
    private final BatchRepository batches;
    public BatchReferenceValidator(BatchRepository batches) { this.batches = batches; }
    public void validate(UUID batchId) {
        if (batchId != null && !batches.existsById(batchId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown batchId");
        }
    }
}
