package com.broiler_monitoring.Controller;

import com.broiler_monitoring.dto.BatchDto;
import com.broiler_monitoring.dto.BatchPassportDto;
import com.broiler_monitoring.service.BatchPassportService;
import com.broiler_monitoring.service.BatchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/batches")
public class BatchController {

    private final BatchService service;
    private final BatchPassportService passportService;

    public BatchController(BatchService service, BatchPassportService passportService) {
        this.service = service;
        this.passportService = passportService;
    }

    @GetMapping
    public List<BatchDto> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public BatchDto getById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/by-number/{batchNumber}")
    public BatchDto getByNumber(@PathVariable String batchNumber) {
        return service.findByNumber(batchNumber);
    }

    @GetMapping("/{id}/passport")
    public BatchPassportDto getPassport(@PathVariable UUID id) {
        return passportService.getPassport(id);
    }
}