INSERT INTO sensors (
    id, code, name, type, farm, building, unit, active, created_at, updated_at
) VALUES
    (gen_random_uuid(), 'LIGHT-01', 'Освещение зона 1', 'LIGHT', 'Ферма 1', 'Птичник 4', 'lux', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'LIGHT-02', 'Освещение зона 2', 'LIGHT', 'Ферма 1', 'Птичник 4', 'lux', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'LIGHT-03', 'Освещение зона 3', 'LIGHT', 'Ферма 1', 'Птичник 4', 'lux', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'LIGHT-04', 'Освещение зона 4', 'LIGHT', 'Ферма 1', 'Птичник 4', 'lux', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'LIGHT-05', 'Освещение зона 5', 'LIGHT', 'Ферма 1', 'Птичник 4', 'lux', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);