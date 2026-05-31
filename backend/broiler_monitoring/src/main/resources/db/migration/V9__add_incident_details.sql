ALTER TABLE incidents
    ADD COLUMN incident_type VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    ADD COLUMN workshop VARCHAR(255),
    ADD COLUMN house VARCHAR(255),
    ADD COLUMN zone VARCHAR(255);

CREATE INDEX idx_incidents_incident_type
    ON incidents(incident_type);

CREATE INDEX idx_incidents_location
    ON incidents(workshop, house, zone);
