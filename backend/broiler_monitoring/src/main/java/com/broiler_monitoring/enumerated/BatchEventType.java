package com.broiler_monitoring.enumerated;

public enum BatchEventType {
    BATCH_CREATED("Создание партии"),
    VACCINATION("Вакцинация"),
    WEIGHING("Взвешивание"),
    MORTALITY("Падёж"),
    PARAMS_CHANGED("Изменение параметров"),
    BATCH_CLOSED("Завершение партии"),
    OTHER("Прочее"); // На всякий случай

    private final String label;

    BatchEventType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}