# Цифровой бройлер — ситуационный центр птицефабрики

Веб-платформа мониторинга для птицефабрики: собирает телеметрию с датчиков,
показывает технические показатели по птичникам и партиям, ведёт ленту
уведомлений, реестр инцидентов и задачи для сотрудников.

Продукт состоит из двух приложений:

- **frontend** — дашборд на Next.js
- **backend** — REST API на Spring Boot + инфраструктура (Postgres, InfluxDB, MinIO, Grafana).

---

## Стек технологий

| Слой | Технологии |
|------|------------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Radix UI (shadcn/ui), Recharts |
| Backend | Java 21, Spring Boot 4, Spring Web MVC, Spring Data JPA, Bean Validation |
| Реляционная БД | PostgreSQL 16 + миграции Flyway |
| Телеметрия (time-series) | InfluxDB 1.8 |
| Хранилище вложений | MinIO (S3-совместимое) |
| Дашборды/графики | Grafana |
| Инфраструктура | Docker Compose |

---

## Структура репозитория

```
Broiler/
├─ frontend/                     # Next.js приложение (дашборд)
│  ├─ app/                       # страницы и API-роуты (app/api/* проксируют на backend)
│  ├─ components/dashboard/      # основные UI-компоненты дашборда
│  └─ lib/                       # утилиты, клиент к backend (spring-api.ts)
├─ backend/broiler_monitoring/   # Spring Boot приложение
│  ├─ src/main/java/...          # контроллеры, сервисы, сущности, репозитории
│  ├─ src/main/resources/
│  │  ├─ application.properties  # конфигурация приложения
│  │  └─ db/migration/           # Flyway-миграции (V2…V15)
│  ├─ docker-compose.yml         # Postgres, InfluxDB, Grafana, MinIO
│  └─ .env.example               # шаблон переменных окружения
├─ sensorImitation/              # Python-симулятор датчиков (sensor_simulator.py)
├─ grafana/                      # provisioning дашбордов Grafana
└─ deploy.yml                    # деплой
```

---

## Требования

- **Node.js** 18+ и npm 
- **JDK 21**
- **Docker** + Docker Compose (для Postgres/InfluxDB/MinIO/Grafana)


---

## Быстрый старт (локально)

### 1. Инфраструктура (Docker)

```bash
cd backend/broiler_monitoring
cp .env.example .env         
docker compose up -d          # postgres, influxdb, grafana, minio
```

### 2. Backend (Spring Boot)

```bash
cd backend/broiler_monitoring
./mvnw spring-boot:run         # поднимется на http://localhost:8080
```

При старте Flyway автоматически накатит миграции на Postgres.

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

Фронт по умолчанию ходит на backend по `http://localhost:8080`
(см. `frontend/lib/spring-api.ts`). Переопределить можно переменной
окружения `SPRING_API_URL`.

---

## Переменные окружения

Файл `backend/broiler_monitoring/.env` (создаётся из `.env.example`):

| Переменная | Назначение |
|------------|------------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | доступ к Postgres |
| `POSTGRES_PORT` | порт Postgres на хосте (по умолчанию `5434`) |
| `INCIDENT_ATTACHMENTS_S3_*` | доступ и настройки MinIO (вложения к инцидентам) |
| `INCIDENT_ATTACHMENTS_MAX_*` | лимиты размера загружаемых файлов |

Frontend (опционально): `SPRING_API_URL` — адрес backend.

---

## Порты по умолчанию

| Сервис | Порт |
|--------|------|
| Frontend (Next.js) | 3000 |
| Backend (Spring) | 8080 |
| PostgreSQL | 5434 → 5432 |
| InfluxDB | 8086 |
| Grafana | 3001 |
| MinIO (API / консоль) | 9000 / 9001 |

---

## Как это работает

```
Датчики / симулятор ──► Backend (Spring) ──► InfluxDB (телеметрия)
                                     │
                                     ├──► PostgreSQL (уведомления, инциденты, задачи, пользователи)
                                     └──► MinIO (файлы вложений)
                                     ▲
Frontend (Next.js) ── app/api/* ─────┘  (серверные роуты проксируют запросы на backend)
```

- Телеметрия датчиков пишется в **InfluxDB**; в дев-режиме включён встроенный
  симулятор (`sensor.simulation.enabled=true` в `application.properties`),
  плюс есть отдельный Python-симулятор в `(ранняя версия)`.
- Пороговые сервисы создают **уведомления** и **инциденты** в Postgres.
- Frontend не обращается к backend напрямую из браузера — запросы идут через
  Next.js API-роуты (`frontend/app/api/*`), которые проксируют на Spring.

---

## Доменные понятия

- **Технические показатели** — KPI по категориям (Освещение, Микроклимат,
  Производственные параметры, Потребление ресурсов, Состояние стада),
  с разбивкой по птичнику, партии и возрастной группе птицы.
- **Уведомления** — сигналы об отклонениях (от датчиков/системы/аналитики).
- **Инциденты** — заведённые в работу проблемы; могут создаваться из уведомлений,
  имеют статус, приоритет, ответственного и историю.
- **Задачи** — поручения сотрудникам, привязанные к показателям.

---

## Миграции базы данных

Flyway-миграции лежат в `backend/broiler_monitoring/src/main/resources/db/migration`
и применяются автоматически при старте backend. Правила:

- новые миграции добавляйте следующим номером версии (`V{N}__описание.sql`);
- уже применённые миграции **не редактируйте** — Flyway проверяет контрольные суммы;
- префикс версии должен быть заглавной `V` (иначе Flyway файл проигнорирует).



