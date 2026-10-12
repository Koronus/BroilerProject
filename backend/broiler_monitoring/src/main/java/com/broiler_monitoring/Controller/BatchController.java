package com.broiler_monitoring.Controller;

import com.broiler_monitoring.dto.BatchDto;
import com.broiler_monitoring.dto.BatchPassportDto;
import com.broiler_monitoring.service.BatchPassportService;
import com.broiler_monitoring.service.BatchService;
import com.broiler_monitoring.dto.passport.BatchPassportSettings;
import com.broiler_monitoring.service.BatchPassportSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/batches")
public class BatchController {

    private final BatchService service;
    private final BatchPassportService passportService;
    private final BatchPassportSettingsService settingsService;

    public BatchController(BatchService service, BatchPassportService passportService, BatchPassportSettingsService settingsService) {
        this.service = service;
        this.passportService = passportService;
        this.settingsService = settingsService;
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
    @Operation(summary = "Готовый паспорт партии", description = "Все разделы одним запросом. Неполные данные — 200 с dataQuality; неизвестная партия — 404.")
    public BatchPassportDto getPassport(@PathVariable UUID id) {
        return passportService.getPassport(id);
    }

    @GetMapping("/{id}/passport-settings")
    public BatchPassportSettings getSettings(@PathVariable UUID id) { return settingsService.get(id); }

    @PutMapping("/{id}/passport-settings")
    public BatchPassportSettings updateSettings(@PathVariable UUID id, @Valid @RequestBody BatchPassportSettings settings) {
        return settingsService.update(id, settings);
    }
}
