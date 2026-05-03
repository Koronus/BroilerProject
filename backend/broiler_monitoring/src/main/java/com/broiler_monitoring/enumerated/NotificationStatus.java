package com.broiler_monitoring.enumerated;

public enum NotificationStatus {
    NEW,              // новое, еще не открывали
    VIEWED,           // просмотрено
    ACKNOWLEDGED,     // принято в работу / подтверждено
    SNOOZED,          // отложено
    INCIDENT_CREATED, // по уведомлению создан инцидент
    RESOLVED,         // проблема решена
    CLOSED            // закрыто
}