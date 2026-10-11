ALTER TABLE tasks ADD COLUMN batch_id UUID;

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_batch
        FOREIGN KEY (batch_id) REFERENCES batches(id)
            ON DELETE SET NULL;

CREATE INDEX idx_tasks_batch_id ON tasks(batch_id);