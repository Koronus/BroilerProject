export const batchStatusLabels: Record<string, string> = {
  ACTIVE: "Активна",
  CLOSED: "Закрыта",
  ARCHIVED: "Архив",
}

export const incidentTypeLabels: Record<string, string> = {
  MICROCLIMATE: "Микроклимат",
  SANITATION: "Санитария",
  FLOCK_HEALTH: "Падеж и состояние стада",
  FEEDING: "Кормление",
  WATER_SUPPLY: "Водоснабжение",
  PRODUCTION_METRICS: "Производственные показатели",
  LIGHTING_ILLUMINANCE_LOW: "Освещённость ниже нормы",
  LIGHTING_ILLUMINANCE_HIGH: "Освещённость выше нормы",
  LIGHTING_UNIFORMITY_VIOLATION: "Нарушение равномерности",
  LIGHTING_SYSTEM_HEALTH_WARNING: "Ухудшение освещения",
  LIGHTING_SYSTEM_HEALTH_CRITICAL: "Критическое освещение",
  LIGHTING_SCHEDULE_DEVIATION: "Отклонение расписания",
  LIGHTING_DARK_PERIOD_VIOLATION: "Нарушение тёмного периода",
  LIGHTING_CONTROLLER_FAILURE: "Сбой контроллера",
  LIGHTING_CONTINUOUS_LIGHT: "Свет 24/7",
  LIGHTING_CONTINUOUS_DARK: "Постоянная темнота",
  LIGHTING_MISSING_EVENTS: "Потеря событий",
  OTHER: "Прочее",
}

export const priorityLabels: Record<string, string> = {
  CRITICAL: "Критический",
  HIGH: "Высокий",
  MEDIUM: "Средний",
  LOW: "Низкий",
}

export const incidentStatusLabels: Record<string, string> = {
  OPEN: "Открыт",
  IN_PROGRESS: "В работе",
  RESOLVED: "Решён",
  CLOSED: "Закрыт",
  CANCELLED: "Отменён",
}