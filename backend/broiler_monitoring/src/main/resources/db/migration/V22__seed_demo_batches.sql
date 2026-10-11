INSERT INTO batches (
    id, batch_number, status, workshop, house, zone_name,
    placement_date, close_date,
    initial_bird_count, current_bird_count,
    origin, cross_name, created_at, updated_at
) VALUES

('bbbb0001-0000-4000-8000-000000000001', 'BATCH-2026-001', 'ACTIVE',
 'Бройлерный цех № 1', 'Птичник 1-01', 'Зона A',
 NOW() - INTERVAL '20 days', NULL,
 5000, 4850,
 'Инкубатор № 1', 'Ross 308',
 NOW() - INTERVAL '20 days', NOW()),


('bbbb0002-0000-4000-8000-000000000002', 'BATCH-2026-002', 'ACTIVE',
 'Бройлерный цех № 1', 'Птичник 1-02', 'Зона B',
 NOW() - INTERVAL '15 days', NULL,
 5200, 5080,
 'Инкубатор № 2', 'Cobb 500',
 NOW() - INTERVAL '15 days', NOW()),


('bbbb0003-0000-4000-8000-000000000003', 'BATCH-2026-003', 'ACTIVE',
 'Бройлерный цех № 2', 'Птичник 2-01', 'Основной зал',
 NOW() - INTERVAL '10 days', NULL,
 4800, 4650,
 'Инкубатор № 1', 'Ross 308',
 NOW() - INTERVAL '10 days', NOW()),

-- Закрытая партия
('bbbb0004-0000-4000-8000-000000000004', 'BATCH-2026-004', 'CLOSED',
 'Бройлерный цех № 1', 'Птичник 1-03', 'Зона C',
 NOW() - INTERVAL '60 days', NOW() - INTERVAL '20 days',
 5100, 4980,
 'Инкубатор № 3', 'Hubbard',
 NOW() - INTERVAL '60 days', NOW() - INTERVAL '20 days'),

-- Архивная партия
('bbbb0005-0000-4000-8000-000000000005', 'BATCH-2026-005', 'ARCHIVED',
 'Цех родительского стада', 'Птичник РС-01', 'Секция 2',
 NOW() - INTERVAL '120 days', NOW() - INTERVAL '80 days',
 3000, 2900,
 'Инкубатор № 1', 'Ross 308',
 NOW() - INTERVAL '120 days', NOW() - INTERVAL '80 days')

ON CONFLICT (batch_number) DO NOTHING;