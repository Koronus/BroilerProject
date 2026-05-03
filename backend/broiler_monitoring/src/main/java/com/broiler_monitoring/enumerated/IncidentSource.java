package com.broiler_monitoring.enumerated;

public enum IncidentSource {
    NOTIFICATION, // создан из уведомления
    MANUAL,       // создан вручную сотрудником
    SYSTEM,       // создан системой
    ANALYTICS     // создан аналитикой
}