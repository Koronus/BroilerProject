INSERT INTO sensors (
    id,
    code,
    name,
    type,
    farm,
    building,
    unit,
    active,
    created_at,
    updated_at
) VALUES
      (
          '11111111-1111-1111-1111-111111111111',
          'TEMP-HOUSE-4-01',
          'Температура, птичник 4, зона 1',
          'TEMPERATURE',
          'Ферма 1',
          'Птичник 4',
          'C',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '22222222-2222-2222-2222-222222222222',
          'HUM-HOUSE-4-01',
          'Влажность, птичник 4, зона 1',
          'HUMIDITY',
          'Ферма 1',
          'Птичник 4',
          '%',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '33333333-3333-3333-3333-333333333333',
          'CO2-HOUSE-4-01',
          'CO2, птичник 4, зона 1',
          'CO2',
          'Ферма 1',
          'Птичник 4',
          'ppm',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '44444444-4444-4444-4444-444444444444',
          'AMMONIA-HOUSE-4-01',
          'Аммиак, птичник 4, зона 1',
          'AMMONIA',
          'Ферма 1',
          'Птичник 4',
          'ppm',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '55555555-5555-5555-5555-555555555555',
          'WATER-HOUSE-4-01',
          'Потребление воды, птичник 4',
          'WATER_FLOW',
          'Ферма 1',
          'Птичник 4',
          'l/min',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      );


