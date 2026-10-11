ALTER TABLE incidents ADD COLUMN batch_id UUID;

ALTER TABLE incidents
    ADD CONSTRAINT fk_incidents_batch
        FOREIGN KEY (batch_id) REFERENCES batches(id)
            ON DELETE SET NULL;

CREATE INDEX idx_incidents_batch_id ON incidents(batch_id);