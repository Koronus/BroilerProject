CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    source_detail TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    notification_id UUID,
    responsible VARCHAR(255),
    decision_comment TEXT,
    created_at TIMESTAMP NOT NULL,
    detected_at TIMESTAMP,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,

    CONSTRAINT fk_incidents_notification
        FOREIGN KEY (notification_id)
            REFERENCES notifications(id)
);

CREATE INDEX idx_notifications_status
    ON notifications(status);

CREATE INDEX idx_notifications_priority
    ON notifications(priority);

CREATE INDEX idx_notifications_created_at
    ON notifications(created_at DESC);

CREATE INDEX idx_incidents_status
    ON incidents(status);

CREATE INDEX idx_incidents_priority
    ON incidents(priority);

CREATE INDEX idx_incidents_notification_id
    ON incidents(notification_id);

CREATE INDEX idx_incidents_created_at
    ON incidents(created_at DESC);
