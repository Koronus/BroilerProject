package com.broiler_monitoring.Controller;

import com.broiler_monitoring.dto.BatchEventDto;
import com.broiler_monitoring.dto.CreateBatchEventRequest;
import com.broiler_monitoring.service.BatchEventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/batches/{batchId}/events")
public class BatchEventController {

    private final BatchEventService service;

    public BatchEventController(BatchEventService service) {
        this.service = service;
    }

    @GetMapping
    public List<BatchEventDto> getEvents(@PathVariable UUID batchId) {
        return service.getEvents(batchId);
    }

    @PostMapping
    public BatchEventDto createEvent(
            @PathVariable UUID batchId,
            @RequestBody CreateBatchEventRequest request
    ) {
        return service.createEvent(batchId, request);
    }
}