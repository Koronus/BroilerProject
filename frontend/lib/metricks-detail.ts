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

// Временные метки с 12:00 до 14:00 с интервалом 10 минут
// Всего 13 значений: 12:00, 12:10, 12:20, 12:30, 12:40, 12:50, 13:00, 13:10, 13:20, 13:30, 13:40, 13:50, 14:00
const timeLabels = [
  "12:00", "12:10", "12:20", "12:30", "12:40", "12:50",
  "13:00", "13:10", "13:20", "13:30", "13:40", "13:50", "14:00"
]

export const metricsDetails: Record<string, MetricDetailData> = {
  // ========== Возраст 0-3 дня ==========
  temperature_0_3: {
    title: "Температура",
    currentValue: "40.2°C",
    targetRange: "40.0-40.8°C",
    status: "normal",
    chartData: [
      { day: "12:00", value: 40.1 }, { day: "12:10", value: 40.2 }, { day: "12:20", value: 40.0 },
      { day: "12:30", value: 40.3 }, { day: "12:40", value: 40.2 }, { day: "12:50", value: 40.1 },
      { day: "13:00", value: 40.2 }, { day: "13:10", value: 40.3 }, { day: "13:20", value: 40.1 },
      { day: "13:30", value: 40.2 }, { day: "13:40", value: 40.0 }, { day: "13:50", value: 40.2 },
      { day: "14:00", value: 40.2 }
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
      { day: "12:00", value: 69 }, { day: "12:10", value: 70 }, { day: "12:20", value: 68 },
      { day: "12:30", value: 71 }, { day: "12:40", value: 70 }, { day: "12:50", value: 69 },
      { day: "13:00", value: 70 }, { day: "13:10", value: 71 }, { day: "13:20", value: 68 },
      { day: "13:30", value: 70 }, { day: "13:40", value: 69 }, { day: "13:50", value: 70 },
      { day: "14:00", value: 70 }
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
      { day: "12:00", value: 7 }, { day: "12:10", value: 8 }, { day: "12:20", value: 7 },
      { day: "12:30", value: 9 }, { day: "12:40", value: 8 }, { day: "12:50", value: 7 },
      { day: "13:00", value: 8 }, { day: "13:10", value: 9 }, { day: "13:20", value: 8 },
      { day: "13:30", value: 7 }, { day: "13:40", value: 8 }, { day: "13:50", value: 7 },
      { day: "14:00", value: 8 }
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
      { day: "12:00", value: 14 }, { day: "12:10", value: 15 }, { day: "12:20", value: 14 },
      { day: "12:30", value: 16 }, { day: "12:40", value: 15 }, { day: "12:50", value: 14 },
      { day: "13:00", value: 15 }, { day: "13:10", value: 16 }, { day: "13:20", value: 15 },
      { day: "13:30", value: 14 }, { day: "13:40", value: 15 }, { day: "13:50", value: 16 },
      { day: "14:00", value: 15 }
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
      { day: "12:00", value: 29 }, { day: "12:10", value: 30 }, { day: "12:20", value: 29 },
      { day: "12:30", value: 31 }, { day: "12:40", value: 30 }, { day: "12:50", value: 29 },
      { day: "13:00", value: 30 }, { day: "13:10", value: 31 }, { day: "13:20", value: 30 },
      { day: "13:30", value: 29 }, { day: "13:40", value: 30 }, { day: "13:50", value: 29 },
      { day: "14:00", value: 30 }
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
      { day: "12:00", value: 44 }, { day: "12:10", value: 45 }, { day: "12:20", value: 44 },
      { day: "12:30", value: 46 }, { day: "12:40", value: 45 }, { day: "12:50", value: 44 },
      { day: "13:00", value: 45 }, { day: "13:10", value: 46 }, { day: "13:20", value: 45 },
      { day: "13:30", value: 44 }, { day: "13:40", value: 45 }, { day: "13:50", value: 46 },
      { day: "14:00", value: 45 }
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
      { day: "12:00", value: 1.21 }, { day: "12:10", value: 1.20 }, { day: "12:20", value: 1.19 },
      { day: "12:30", value: 1.22 }, { day: "12:40", value: 1.20 }, { day: "12:50", value: 1.19 },
      { day: "13:00", value: 1.20 }, { day: "13:10", value: 1.21 }, { day: "13:20", value: 1.20 },
      { day: "13:30", value: 1.19 }, { day: "13:40", value: 1.20 }, { day: "13:50", value: 1.21 },
      { day: "14:00", value: 1.20 }
    ],
    problemLocations: [],
  },
  mortality_0_3: {
    title: "Смертность",
    currentValue: "1.2%",
    targetRange: "< 1.0%",
    status: "warning",
    chartData: [
      { day: "12:00", value: 1.0 }, { day: "12:10", value: 1.1 }, { day: "12:20", value: 1.0 },
      { day: "12:30", value: 1.2 }, { day: "12:40", value: 1.3 }, { day: "12:50", value: 1.2 },
      { day: "13:00", value: 1.2 }, { day: "13:10", value: 1.3 }, { day: "13:20", value: 1.2 },
      { day: "13:30", value: 1.1 }, { day: "13:40", value: 1.2 }, { day: "13:50", value: 1.3 },
      { day: "14:00", value: 1.2 }
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
      { day: "12:00", value: 39.5 }, { day: "12:10", value: 39.6 }, { day: "12:20", value: 39.7 },
      { day: "12:30", value: 39.8 }, { day: "12:40", value: 39.9 }, { day: "12:50", value: 39.7 },
      { day: "13:00", value: 40.1 }, { day: "13:10", value: 40.2 }, { day: "13:20", value: 40.0 },
      { day: "13:30", value: 39.8 }, { day: "13:40", value: 39.6 }, { day: "13:50", value: 39.8 },
      { day: "14:00", value: 39.8 }
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
      { day: "12:00", value: 64 }, { day: "12:10", value: 65 }, { day: "12:20", value: 63 },
      { day: "12:30", value: 66 }, { day: "12:40", value: 65 }, { day: "12:50", value: 64 },
      { day: "13:00", value: 65 }, { day: "13:10", value: 66 }, { day: "13:20", value: 64 },
      { day: "13:30", value: 65 }, { day: "13:40", value: 63 }, { day: "13:50", value: 65 },
      { day: "14:00", value: 65 }
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
      { day: "12:00", value: 14 }, { day: "12:10", value: 15 }, { day: "12:20", value: 14 },
      { day: "12:30", value: 16 }, { day: "12:40", value: 15 }, { day: "12:50", value: 14 },
      { day: "13:00", value: 15 }, { day: "13:10", value: 16 }, { day: "13:20", value: 15 },
      { day: "13:30", value: 14 }, { day: "13:40", value: 15 }, { day: "13:50", value: 16 },
      { day: "14:00", value: 15 }
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
      { day: "12:00", value: 124 }, { day: "12:10", value: 125 }, { day: "12:20", value: 123 },
      { day: "12:30", value: 126 }, { day: "12:40", value: 125 }, { day: "12:50", value: 124 },
      { day: "13:00", value: 125 }, { day: "13:10", value: 126 }, { day: "13:20", value: 124 },
      { day: "13:30", value: 125 }, { day: "13:40", value: 123 }, { day: "13:50", value: 125 },
      { day: "14:00", value: 125 }
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
      { day: "12:00", value: 248 }, { day: "12:10", value: 250 }, { day: "12:20", value: 249 },
      { day: "12:30", value: 252 }, { day: "12:40", value: 250 }, { day: "12:50", value: 249 },
      { day: "13:00", value: 250 }, { day: "13:10", value: 251 }, { day: "13:20", value: 249 },
      { day: "13:30", value: 250 }, { day: "13:40", value: 248 }, { day: "13:50", value: 250 },
      { day: "14:00", value: 250 }
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
      { day: "12:00", value: 1.78 }, { day: "12:10", value: 1.79 }, { day: "12:20", value: 1.80 },
      { day: "12:30", value: 1.81 }, { day: "12:40", value: 1.80 }, { day: "12:50", value: 1.79 },
      { day: "13:00", value: 1.80 }, { day: "13:10", value: 1.81 }, { day: "13:20", value: 1.79 },
      { day: "13:30", value: 1.80 }, { day: "13:40", value: 1.78 }, { day: "13:50", value: 1.80 },
      { day: "14:00", value: 1.80 }
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
      { day: "12:00", value: 1.67 }, { day: "12:10", value: 1.66 }, { day: "12:20", value: 1.65 },
      { day: "12:30", value: 1.64 }, { day: "12:40", value: 1.65 }, { day: "12:50", value: 1.66 },
      { day: "13:00", value: 1.65 }, { day: "13:10", value: 1.64 }, { day: "13:20", value: 1.66 },
      { day: "13:30", value: 1.65 }, { day: "13:40", value: 1.67 }, { day: "13:50", value: 1.65 },
      { day: "14:00", value: 1.65 }
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
      { day: "12:00", value: 1.2 }, { day: "12:10", value: 1.4 }, { day: "12:20", value: 1.3 },
      { day: "12:30", value: 1.6 }, { day: "12:40", value: 1.8 }, { day: "12:50", value: 1.9 },
      { day: "13:00", value: 2.1 }, { day: "13:10", value: 2.0 }, { day: "13:20", value: 1.9 },
      { day: "13:30", value: 2.1 }, { day: "13:40", value: 2.0 }, { day: "13:50", value: 2.1 },
      { day: "14:00", value: 2.1 }
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

const toChartData = (values: number[]) =>
  timeLabels.map((day, index) => ({
    day,
    value: values[index],
  }))

Object.assign(metricsDetails, {
  lighting_min_0_3: {
    title: "Минимальная освещенность",
    currentValue: "25 лк",
    targetRange: "25-40 лк",
    status: "normal",
    chartData: toChartData([25.0, 25.8, 26.1, 26.4, 25.9, 26.2, 26.0, 26.3, 25.7, 26.1, 26.4, 26.2, 26.0]),
    problemLocations: [],
  },
  lighting_max_0_3: {
    title: "Максимальная освещенность",
    currentValue: "39 лк",
    targetRange: "25-40 лк",
    status: "normal",
    chartData: toChartData([38.0, 38.4, 39.0, 39.2, 38.8, 39.0, 39.4, 39.1, 38.7, 39.0, 39.3, 39.1, 39.0]),
    problemLocations: [],
  },
  lighting_avg_0_3: {
    title: "Средняя освещенность",
    currentValue: "32 лк",
    targetRange: "25-40 лк",
    status: "normal",
    chartData: toChartData([31.8, 32.2, 32.6, 32.9, 32.5, 32.7, 32.9, 32.6, 32.3, 32.5, 32.8, 32.6, 32.6]),
    problemLocations: [],
  },
  lighting_uniformity_0_3: {
    title: "Равномерность освещения",
    currentValue: "0.80",
    targetRange: "> 0.70",
    status: "normal",
    chartData: toChartData([0.79, 0.80, 0.80, 0.80, 0.80, 0.80, 0.79, 0.81, 0.80, 0.80, 0.80, 0.80, 0.80]),
    problemLocations: [],
  },
  lighting_min_21_30: {
    title: "Минимальная освещенность",
    currentValue: "25 лк",
    targetRange: "25-40 лк",
    status: "normal",
    chartData: toChartData([25.0, 25.4, 25.8, 26.0, 25.6, 25.9, 26.1, 25.8, 25.5, 25.8, 26.0, 25.7, 25.8]),
    problemLocations: [],
  },
  lighting_max_21_30: {
    title: "Максимальная освещенность",
    currentValue: "40 лк",
    targetRange: "25-40 лк",
    status: "normal",
    chartData: toChartData([38.8, 39.2, 39.5, 39.8, 39.4, 39.6, 40.0, 39.5, 39.1, 39.4, 39.7, 39.5, 39.6]),
    problemLocations: [],
  },
  lighting_avg_21_30: {
    title: "Средняя освещенность",
    currentValue: "32 лк",
    targetRange: "25-40 лк",
    status: "normal",
    chartData: toChartData([31.6, 31.9, 32.2, 32.4, 32.1, 32.3, 32.5, 32.2, 31.9, 32.1, 32.4, 32.2, 32.2]),
    problemLocations: [],
  },
  lighting_uniformity_21_30: {
    title: "Равномерность освещения",
    currentValue: "0.80",
    targetRange: "> 0.70",
    status: "normal",
    chartData: toChartData([0.79, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80]),
    problemLocations: [],
  },
} satisfies Record<string, MetricDetailData>)
