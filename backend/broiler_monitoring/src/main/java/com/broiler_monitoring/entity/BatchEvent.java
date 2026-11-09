package com.broiler_monitoring.entity;

import com.broiler_monitoring.enumerated.BatchEventType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "batch_events")
@Getter
@Setter
@NoArgsConstructor
public class BatchEvent {

    @Id
    private UUID id;

    @NotNull
    @Column(name = "batch_id", nullable = false)
    private UUID batchId;

    @NotNull
    @Column(nullable = false)
    private Integer sequence;

    @NotBlank
    @Column(name = "schema_version", nullable = false, length = 10)
    private String schemaVersion = "1.0";

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private BatchEventType eventType;

    @NotNull
    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @NotNull
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(columnDefinition = "text")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "data_hash", length = 64)
    private String dataHash;

    @Column(name = "blockchain_tx_id")
    private String blockchainTxId;

    @NotBlank
    @Column(name = "blockchain_status", nullable = false, length = 50)
    private String blockchainStatus = "QUEUED";

    @NotBlank
    @Column(name = "verification_status", nullable = false, length = 50)
    private String verificationStatus = "NOT_CHECKED";

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @PrePersist
    public void prePersist() {
        if (registeredAt == null) registeredAt = LocalDateTime.now();
        if (occurredAt == null) occurredAt = LocalDateTime.now();
    }
}
