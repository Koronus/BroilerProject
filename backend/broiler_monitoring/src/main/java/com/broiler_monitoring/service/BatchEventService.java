package com.broiler_monitoring.service;

import com.broiler_monitoring.dto.BatchEventDto;
import com.broiler_monitoring.dto.CreateBatchEventRequest;
import com.broiler_monitoring.entity.BatchEvent;
import com.broiler_monitoring.repository.BatchEventRepository;
//import com.broiler_monitoring.service.blockchain.BlockchainService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class BatchEventService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "BATCH_CREATED", "VACCINATION", "WEIGHING",
            "MORTALITY_RECORDED", "BATCH_UPDATED", "BATCH_COMPLETED"
    );

    private final BatchEventRepository repository;
    private final BatchService batchService;
    //private final BlockchainService blockchainService;

    public BatchEventService(
            BatchEventRepository repository,
            BatchService batchService//,
           // BlockchainService blockchainService
    ) {
        this.repository = repository;
        this.batchService = batchService;
        //this.blockchainService = blockchainService;
    }

    public List<BatchEventDto> getEvents(UUID batchId) {
        // Проверяем, что партия существует (кинет 404, если нет)
        batchService.getEntityById(batchId);

        return repository.findByBatchIdOrderBySequenceAsc(batchId)
                .stream()
                .map(BatchEventDto::from)
                .toList();
    }

    @Transactional
    public BatchEventDto createEvent(UUID batchId, CreateBatchEventRequest req) {
        // 1. Валидация партии
        batchService.getEntityById(batchId);

        // 2. Валидация типа (если пришло null)
        if (req.eventType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event type is required");
        }

        // 3. Атомарно вычисляем sequence
        int lastSeq = repository.findTopByBatchIdOrderBySequenceDesc(batchId)
                .map(BatchEvent::getSequence)
                .orElse(0);
        int nextSeq = lastSeq + 1;

        // 4. Создаем событие
        BatchEvent event = new BatchEvent();
        event.setId(UUID.randomUUID());
        event.setBatchId(batchId);
        event.setSequence(nextSeq);
        event.setSchemaVersion("1.0");
        event.setEventType(req.eventType());
        event.setOccurredAt(req.occurredAt() != null ? req.occurredAt() : LocalDateTime.now());
        event.setRegisteredAt(LocalDateTime.now());
        event.setDescription(req.description());
        event.setPayload(req.payload());



        event.setActorId(null);
        event.setActorName(null);

        // 5. Блокчейн-модуль (Никита)
        // ВРЕМЕННАЯ ЗАГЛУШКА (вместо BlockchainService)
        try {
            String raw = String.format(
                    "%s|%s|%s|%s|%s",
                    event.getSchemaVersion(),
                    event.getId(),
                    event.getBatchId(),
                    event.getEventType(),
                    event.getOccurredAt()
            );
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String hexHash = java.util.HexFormat.of().formatHex(hash);

            event.setDataHash(hexHash);
            event.setBlockchainStatus("MOCK"); // Явно указываем статус
        } catch (java.security.NoSuchAlgorithmException e) {
            event.setDataHash(null);
            event.setBlockchainStatus("FAILED");
            event.setErrorCode("HASH_ERROR");
            event.setErrorMessage(e.getMessage());
        }

        // 6. Сохраняем в БД (всё в одной транзакции)
        BatchEvent saved = repository.save(event);

        return BatchEventDto.from(saved);
    }
}