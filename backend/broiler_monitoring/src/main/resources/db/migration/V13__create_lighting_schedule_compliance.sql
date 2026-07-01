CREATE TABLE IF NOT EXISTS lighting_schedule_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id VARCHAR(255) NOT NULL,
    scheduled_light_minutes INTEGER NOT NULL,
    actual_light_minutes INTEGER NOT NULL,
    scheduled_dark_minutes INTEGER NOT NULL,
    actual_dark_minutes INTEGER NOT NULL,
    deviation_minutes_total INTEGER NOT NULL,
    compliance_percent DOUBLE PRECISION NOT NULL,
    status VARCHAR(64) NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lighting_schedule_compliance_house_calculated
    ON lighting_schedule_compliance (house_id, calculated_at DESC);
