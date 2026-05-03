// lib/metricks-detail.ts

export interface MetricDetailData {
  title: string
  currentValue: string
  targetRange: string
  status: "normal" | "warning" | "critical"
  chartData: { day: string; value: number }[]
  problemLocations: { name: string; value: string; status: "critical" | "warning" }[]
  relatedIncident?: {
    title: string
    description: string
  }
}

export const metricsDetails: Record<string, MetricDetailData> = {
  // ========== Возраст 0-3 дня ==========
  temperature_0_3: {
    title: "Температура",
    currentValue: "40.2°C",
    targetRange: "40.0-40.8°C",
    status: "normal",
    chartData: [
      { day: "Пн", value: 40.1 },
      { day: "Вт", value: 40.2 },
      { day: "Ср", value: 40.0 },
      { day: "Чт", value: 40.3 },
      { day: "Пт", value: 40.2 },
      { day: "Сб", value: 40.1 },
      { day: "Вс", value: 40.2 },
    ],
    problemLocations: [
      { name: "Корпус 1", value: "40.5°C", status: "warning" },
      { name: "Корпус 3", value: "39.8°C", status: "warning" },
    ],
  },
  humidity_0_3: {
    title: "Влажность",
    currentValue: "70%",
    targetRange: "65-75%",
    status: "normal",
    chartData: [
      { day: "Пн", value: 69 },
      { day: "Вт", value: 70 },
      { day: "Ср", value: 68 },
      { day: "Чт", value: 71 },
      { day: "Пт", value: 70 },
      { day: "Сб", value: 69 },
      { day: "Вс", value: 70 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "76%", status: "warning" },
    ],
  },
  ammonia_0_3: {
    title: "Аммиак",
    currentValue: "8 ppm",
    targetRange: "< 5 ppm",
    status: "warning",
    chartData: [
      { day: "Пн", value: 7 },
      { day: "Вт", value: 8 },
      { day: "Ср", value: 7 },
      { day: "Чт", value: 9 },
      { day: "Пт", value: 8 },
      { day: "Сб", value: 7 },
      { day: "Вс", value: 8 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "10 ppm", status: "critical" },
      { name: "Корпус 5", value: "9 ppm", status: "warning" },
    ],
  },
  feed_intake_0_3: {
    title: "Потребление корма",
    currentValue: "15 г",
    targetRange: "14-18 г",
    status: "normal",
    chartData: [
      { day: "Пн", value: 14 },
      { day: "Вт", value: 15 },
      { day: "Ср", value: 14 },
      { day: "Чт", value: 16 },
      { day: "Пт", value: 15 },
      { day: "Сб", value: 14 },
      { day: "Вс", value: 15 },
    ],
    problemLocations: [
      { name: "Корпус 3", value: "13 г", status: "warning" },
    ],
  },
  water_intake_0_3: {
    title: "Потребление воды",
    currentValue: "30 мл",
    targetRange: "28-35 мл",
    status: "normal",
    chartData: [
      { day: "Пн", value: 29 },
      { day: "Вт", value: 30 },
      { day: "Ср", value: 29 },
      { day: "Чт", value: 31 },
      { day: "Пт", value: 30 },
      { day: "Сб", value: 29 },
      { day: "Вс", value: 30 },
    ],
    problemLocations: [
      { name: "Корпус 1", value: "27 мл", status: "warning" },
    ],
  },
  average_weight_0_3: {
    title: "Средний вес",
    currentValue: "45 г",
    targetRange: "42-48 г",
    status: "normal",
    chartData: [
      { day: "Пн", value: 44 },
      { day: "Вт", value: 45 },
      { day: "Ср", value: 44 },
      { day: "Чт", value: 46 },
      { day: "Пт", value: 45 },
      { day: "Сб", value: 44 },
      { day: "Вс", value: 45 },
    ],
    problemLocations: [
      { name: "Корпус 5", value: "41 г", status: "warning" },
    ],
  },
  fcr_0_3: {
    title: "Конверсия корма FCR",
    currentValue: "1.2",
    targetRange: "1.1-1.3",
    status: "normal",
    chartData: [
      { day: "Пн", value: 1.21 },
      { day: "Вт", value: 1.20 },
      { day: "Ср", value: 1.19 },
      { day: "Чт", value: 1.22 },
      { day: "Пт", value: 1.20 },
      { day: "Сб", value: 1.19 },
      { day: "Вс", value: 1.20 },
    ],
    problemLocations: [],
  },
  mortality_0_3: {
    title: "Смертность",
    currentValue: "1.2%",
    targetRange: "< 1.0%",
    status: "warning",
    chartData: [
      { day: "Пн", value: 1.0 },
      { day: "Вт", value: 1.1 },
      { day: "Ср", value: 1.0 },
      { day: "Чт", value: 1.2 },
      { day: "Пт", value: 1.3 },
      { day: "Сб", value: 1.2 },
      { day: "Вс", value: 1.2 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "1.8%", status: "warning" },
      { name: "Корпус 4", value: "1.5%", status: "warning" },
    ],
  },

  // ========== Возраст 21-30 дней ==========
  temperature_21_30: {
    title: "Температура",
    currentValue: "39.8°C",
    targetRange: "39.4-40.5°C",
    status: "normal",
    chartData: [
      { day: "Пн", value: 39.7 },
      { day: "Вт", value: 39.8 },
      { day: "Ср", value: 39.6 },
      { day: "Чт", value: 39.9 },
      { day: "Пт", value: 39.8 },
      { day: "Сб", value: 39.7 },
      { day: "Вс", value: 39.8 },
    ],
    problemLocations: [
      { name: "Корпус 1", value: "40.2°C", status: "warning" },
      { name: "Корпус 3", value: "39.2°C", status: "warning" },
    ],
  },
  humidity_21_30: {
    title: "Влажность",
    currentValue: "65%",
    targetRange: "55-70%",
    status: "normal",
    chartData: [
      { day: "Пн", value: 64 },
      { day: "Вт", value: 65 },
      { day: "Ср", value: 63 },
      { day: "Чт", value: 66 },
      { day: "Пт", value: 65 },
      { day: "Сб", value: 64 },
      { day: "Вс", value: 65 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "72%", status: "warning" },
    ],
  },
  ammonia_21_30: {
    title: "Аммиак",
    currentValue: "15 ppm",
    targetRange: "< 10 ppm",
    status: "warning",
    chartData: [
      { day: "Пн", value: 14 },
      { day: "Вт", value: 15 },
      { day: "Ср", value: 14 },
      { day: "Чт", value: 16 },
      { day: "Пт", value: 15 },
      { day: "Сб", value: 14 },
      { day: "Вс", value: 15 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "18 ppm", status: "critical" },
      { name: "Корпус 5", value: "16 ppm", status: "warning" },
    ],
    relatedIncident: {
      title: "Превышение ПДК",
      description: "В корпусе 2 зафиксировано превышение предельно допустимой концентрации аммиака",
    },
  },
  feed_intake_21_30: {
    title: "Потребление корма",
    currentValue: "125 г",
    targetRange: "120-130 г",
    status: "normal",
    chartData: [
      { day: "Пн", value: 124 },
      { day: "Вт", value: 125 },
      { day: "Ср", value: 123 },
      { day: "Чт", value: 126 },
      { day: "Пт", value: 125 },
      { day: "Сб", value: 124 },
      { day: "Вс", value: 125 },
    ],
    problemLocations: [
      { name: "Корпус 3", value: "118 г", status: "warning" },
    ],
  },
  water_intake_21_30: {
    title: "Потребление воды",
    currentValue: "250 мл",
    targetRange: "240-260 мл",
    status: "normal",
    chartData: [
      { day: "Пн", value: 248 },
      { day: "Вт", value: 250 },
      { day: "Ср", value: 249 },
      { day: "Чт", value: 252 },
      { day: "Пт", value: 250 },
      { day: "Сб", value: 249 },
      { day: "Вс", value: 250 },
    ],
    problemLocations: [
      { name: "Корпус 1", value: "235 мл", status: "warning" },
    ],
  },
  average_weight_21_30: {
    title: "Средний вес",
    currentValue: "1.8 кг",
    targetRange: "1.7-1.9 кг",
    status: "normal",
    chartData: [
      { day: "Пн", value: 1.78 },
      { day: "Вт", value: 1.79 },
      { day: "Ср", value: 1.80 },
      { day: "Чт", value: 1.81 },
      { day: "Пт", value: 1.80 },
      { day: "Сб", value: 1.79 },
      { day: "Вс", value: 1.80 },
    ],
    problemLocations: [
      { name: "Корпус 5", value: "1.68 кг", status: "warning" },
    ],
  },
  fcr_21_30: {
    title: "Конверсия корма FCR",
    currentValue: "1.65",
    targetRange: "1.6-1.8",
    status: "normal",
    chartData: [
      { day: "Пн", value: 1.67 },
      { day: "Вт", value: 1.66 },
      { day: "Ср", value: 1.65 },
      { day: "Чт", value: 1.64 },
      { day: "Пт", value: 1.65 },
      { day: "Сб", value: 1.66 },
      { day: "Вс", value: 1.65 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "1.85", status: "critical" },
    ],
    relatedIncident: {
      title: "Проблема с кормлением",
      description: "В корпусе 2 зафиксировано повышенное потребление корма",
    },
  },
  mortality_21_30: {
    title: "Смертность",
    currentValue: "2.1%",
    targetRange: "< 1.5%",
    status: "critical",
    chartData: [
      { day: "Пн", value: 1.2 },
      { day: "Вт", value: 1.4 },
      { day: "Ср", value: 1.3 },
      { day: "Чт", value: 1.6 },
      { day: "Пт", value: 1.8 },
      { day: "Сб", value: 1.9 },
      { day: "Вс", value: 2.1 },
    ],
    problemLocations: [
      { name: "Корпус 2", value: "3.1%", status: "critical" },
      { name: "Корпус 4", value: "2.0%", status: "warning" },
    ],
    relatedIncident: {
      title: "Связанный инцидент",
      description: "В корпусе 2 зафиксировано нарушение климата (Сквозняк)",
    },
  },
}