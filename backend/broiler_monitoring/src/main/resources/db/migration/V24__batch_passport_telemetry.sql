-- Extends the existing UUID batch model. V18-V23 remain unchanged.
ALTER TABLE batches ADD COLUMN time_zone varchar(64) NOT NULL DEFAULT 'Europe/Samara';
ALTER TABLE batches ADD COLUMN hatch_date date;
ALTER TABLE batches ADD COLUMN farm varchar(255);
ALTER TABLE batches ADD COLUMN lighting_house_id varchar(255);
CREATE TABLE batch_sensors (
    batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    sensor_id uuid NOT NULL REFERENCES sensors(id),
    PRIMARY KEY (batch_id, sensor_id)
);
CREATE TABLE batch_metric_norms (
    batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    metric_type varchar(255) NOT NULL,
    unit varchar(64) NOT NULL,
    lower_bound double precision,
    upper_bound double precision,
    PRIMARY KEY (batch_id, metric_type, unit),
    CHECK (lower_bound IS NOT NULL OR upper_bound IS NOT NULL),
    CHECK (lower_bound IS NULL OR upper_bound IS NULL OR lower_bound <= upper_bound)
);
