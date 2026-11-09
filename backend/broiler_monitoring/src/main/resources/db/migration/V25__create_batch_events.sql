-- Таблица для хранения истории жизненного цикла партии (события)
CREATE TABLE batch_events (
    id                  UUID PRIMARY KEY,
    batch_id            UUID NOT NULL,

    -- Порядковый номер события внутри партии (1, 2, 3...)
    sequence            INTEGER NOT NULL,

    -- Версия схемы события для блокчейна
    schema_version      VARCHAR(10) NOT NULL DEFAULT '1.0',

    -- Тип события (BATCH_CREATED, VACCINATION, WEIGHING и т.д.)
    event_type          VARCHAR(50) NOT NULL,

    -- Время, когда событие произошло (может быть указано вручную)
    occurred_at         TIMESTAMP NOT NULL,

    -- Время, когда событие зарегистрировано на сервере
    registered_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Текстовое описание и данные (JSONB)
    description         TEXT,
    payload             JSONB,

    -- Снимок инициатора (actor)
    actor_id            UUID,
    actor_name          VARCHAR(255),

    -- Технические поля для блокчейн-модуля
    data_hash           VARCHAR(64),         -- SHA-256 хэш
    blockchain_tx_id    VARCHAR(255),        -- ID транзакции в сети
    blockchain_status   VARCHAR(50) NOT NULL DEFAULT 'QUEUED', -- QUEUED, CONFIRMED, FAILED, MOCK
    verification_status VARCHAR(50) NOT NULL DEFAULT 'NOT_CHECKED', -- MATCH, MISMATCH, UNAVAILABLE
    verified_at         TIMESTAMP,
    error_code          VARCHAR(50),
    error_message       TEXT,

    -- Связи и ограничения
    CONSTRAINT fk_batch_events_batch
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,

    -- Защита от дублей: в одной партии не может быть двух событий с одинаковым sequence
    CONSTRAINT uq_batch_events_sequence
        UNIQUE (batch_id, sequence)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_batch_events_batch_id ON batch_events(batch_id);
CREATE INDEX idx_batch_events_occurred_at ON batch_events(occurred_at DESC);
CREATE INDEX idx_batch_events_status ON batch_events(blockchain_status);