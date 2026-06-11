package com.broiler_monitoring.Telemetry;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Тип датчика или измеряемого показателя")
public enum SensorType {
    TEMPERATURE,
    HUMIDITY,
    CO2,
    AMMONIA,
    WATER_FLOW,
    LIGHT,
    FEED_CONSUMPTION,
    WEIGHT,
    VENTILATION,
    FEED_CONVERSION,
    MORTALITY
}
