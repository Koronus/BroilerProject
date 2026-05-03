package com.broiler_monitoring.enumerated;

public enum IncidentStatus {
    OPEN,        // создан, еще не взяли в работу
    IN_PROGRESS, // в работе
    RESOLVED,    // проблема решена
    CLOSED,      // закрыт после проверки
    CANCELLED    // отменен
}
