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
          '66666666-6666-6666-6666-666666666666',
          'FCR-HOUSE-4-01',
          'Конверсия корма, птичник 4',
          'FEED_CONVERSION',
          'Ферма 1',
          'Птичник 4',
          'kg/kg',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '77777777-7777-7777-7777-777777777777',
          'WEIGHT-HOUSE-4-01',
          'Средний вес птицы, птичник 4',
          'WEIGHT',
          'Ферма 1',
          'Птичник 4',
          'g',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '88888888-8888-8888-8888-888888888888',
          'FEED-HOUSE-4-01',
          'Потребление корма, птичник 4',
          'FEED_CONSUMPTION',
          'Ферма 1',
          'Птичник 4',
          'kg/h',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          '99999999-9999-9999-9999-999999999999',
          'MORTALITY-HOUSE-4-01',
          'Смертность, птичник 4',
          'MORTALITY',
          'Ферма 1',
          'Птичник 4',
          'birds',
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      )
ON CONFLICT (code) DO NOTHING;
