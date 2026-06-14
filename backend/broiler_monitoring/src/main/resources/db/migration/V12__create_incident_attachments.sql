CREATE TABLE incident_attachments (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(1024) NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    media_type VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_incident_attachments_incident
        FOREIGN KEY (incident_id)
            REFERENCES incidents(id)
            ON DELETE CASCADE
);

CREATE INDEX idx_incident_attachments_incident_id
    ON incident_attachments(incident_id);

CREATE INDEX idx_incident_attachments_created_at
    ON incident_attachments(created_at DESC);
