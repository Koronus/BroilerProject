CREATE INDEX IF NOT EXISTS idx_incidents_created_at_workshop
    ON incidents(created_at, workshop);

CREATE INDEX IF NOT EXISTS idx_incidents_created_at_house
    ON incidents(created_at, house);

CREATE INDEX IF NOT EXISTS idx_incidents_detected_at
    ON incidents(detected_at);