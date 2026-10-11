ALTER TABLE notifications ADD COLUMN batch_id UUID;

ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_batch
        FOREIGN KEY (batch_id) REFERENCES batches(id)
            ON DELETE SET NULL;

CREATE INDEX idx_notifications_batch_id ON notifications(batch_id);