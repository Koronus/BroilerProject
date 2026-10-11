CREATE TABLE batches (
    id                  UUID PRIMARY KEY,
    batch_number        VARCHAR(255) NOT NULL UNIQUE,
    status              VARCHAR(50)  NOT NULL,
    workshop            VARCHAR(255) NOT NULL,
    house               VARCHAR(255) NOT NULL,
    zone_name                VARCHAR(255),
    placement_date      TIMESTAMP    NOT NULL,
    close_date          TIMESTAMP,
    initial_bird_count  INTEGER      NOT NULL,
    current_bird_count  INTEGER      NOT NULL,
    origin              VARCHAR(255),
    cross_name                VARCHAR(255),
    created_at          TIMESTAMP    NOT NULL,
    updated_at          TIMESTAMP
);

CREATE INDEX idx_batches_batch_number ON batches(batch_number);
CREATE INDEX idx_batches_status       ON batches(status);
CREATE INDEX idx_batches_house        ON batches(workshop, house);