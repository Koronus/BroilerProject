CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'Павел Романов', 'Директор по качеству')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS assignee_role VARCHAR(128);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS reaction_minutes BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_incidents_assignee'
    ) THEN
        ALTER TABLE incidents
        ADD CONSTRAINT fk_incidents_assignee
        FOREIGN KEY (assignee_id) REFERENCES users(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS incident_history (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
