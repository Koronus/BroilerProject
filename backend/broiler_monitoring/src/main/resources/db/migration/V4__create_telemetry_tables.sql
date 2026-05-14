CREATE TABLE sensors (
                         id UUID PRIMARY KEY,
                         code VARCHAR(100) NOT NULL UNIQUE,
                         name VARCHAR(255) NOT NULL,
                         type VARCHAR(50) NOT NULL,
                         farm VARCHAR(255) NOT NULL,
                         building VARCHAR(255) NOT NULL,
                         unit VARCHAR(50) NOT NULL,
                         active BOOLEAN NOT NULL DEFAULT TRUE,
                         created_at TIMESTAMP NOT NULL,
                         updated_at TIMESTAMP
);

CREATE TABLE sensor_readings (
                                 id UUID PRIMARY KEY,
                                 sensor_id UUID NOT NULL,
                                 sensor_code VARCHAR(100) NOT NULL,
                                 type VARCHAR(50) NOT NULL,
                                 value DOUBLE PRECISION NOT NULL,
                                 unit VARCHAR(50) NOT NULL,
                                 measured_at TIMESTAMP NOT NULL,
                                 received_at TIMESTAMP NOT NULL,

                                 CONSTRAINT fk_sensor_readings_sensor
                                     FOREIGN KEY (sensor_id)
                                         REFERENCES sensors(id)
);

CREATE INDEX idx_sensor_readings_sensor_code_measured_at
    ON sensor_readings(sensor_code, measured_at DESC);

CREATE INDEX idx_sensor_readings_type_measured_at
    ON sensor_readings(type, measured_at DESC);
