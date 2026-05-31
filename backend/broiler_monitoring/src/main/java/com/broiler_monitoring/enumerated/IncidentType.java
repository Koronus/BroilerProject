package com.broiler_monitoring.enumerated;

public enum IncidentType {
    MICROCLIMATE("Микроклимат"),
    SANITATION("Санитария"),
    FLOCK_HEALTH("Падеж и состояние стада"),
    FEEDING("Кормление"),
    WATER_SUPPLY("Водоснабжение"),
    PRODUCTION_METRICS("Производственные показатели"),
    OTHER("Прочее");

    private final String displayName;

    IncidentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
