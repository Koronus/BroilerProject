// lib/metricks-detail.ts

export interface MetricDetailData {
  title: string
  currentValue: string
  targetRange: string
  status: "normal" | "warning" | "critical"
  chartData: { time: string; value: number }[]
  problemLocations: { name: string; value: string; status: "critical" | "warning" }[]
  relatedIncident?: {
    title: string
    description: string
  }
}

// Вспомогательная функция для генерации 25 временных меток с интервалом 10 минут
const generateTimeLabels = () => {
  const times: string[] = []
  const startTime = new Date()
  startTime.setHours(8, 0, 0, 0) // Начинаем с 08:00
  
  for (let i = 0; i < 25; i++) {
    const currentTime = new Date(startTime.getTime() + i * 10 * 60 * 1000)
    const hours = currentTime.getHours().toString().padStart(2, '0')
    const minutes = currentTime.getMinutes().toString().padStart(2, '0')
    times.push(`${hours}:${minutes}`)
  }
  return times
}

const timeLabels = generateTimeLabels()

// ========== Возраст 0-3 дня ==========
export const metricsDetails: Record<string, MetricDetailData> = {
temperature_0_3: {
  title: "Температура",
  currentValue: "40.2°C",
  targetRange: "40.0-40.8°C",
  status: "normal",
  chartData: timeLabels.map((time, idx) => {
    // 15% вероятность выброса
    const random = Math.random()
    
    if (random < 0.05) {
      // Критический выброс (5%) - очень высокие значения
      return {
        time,
        value: +(42.0 + Math.random() * 1.5).toFixed(1) // 42.0 - 43.5
      }
    } else if (random < 0.15) {
      // Предупреждение (10%) - значения выше нормы
      return {
        time,
        value: +(40.9 + Math.random() * 1.1).toFixed(1) // 40.9 - 42.0
      }
    } else {
      // Норма (85%) - нормальные колебания
      return {
        time,
        value: +(40.0 + Math.random() * 0.8).toFixed(1) // 40.0 - 40.8
      }
    }
  }),
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
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.min(75, Math.max(65, 70 + (Math.random() - 0.5) * 8))
    })),
    problemLocations: [
      { name: "Корпус 2", value: "76%", status: "warning" },
    ],
  },
  ammonia_0_3: {
    title: "Аммиак",
    currentValue: "8 ppm",
    targetRange: "< 5 ppm",
    status: "warning",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.max(0, Math.round(7 + (Math.random() - 0.3) * 4))
    })),
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
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.round(15 + (Math.random() - 0.5) * 3)
    })),
    problemLocations: [
      { name: "Корпус 3", value: "13 г", status: "warning" },
    ],
  },
  water_intake_0_3: {
    title: "Потребление воды",
    currentValue: "30 мл",
    targetRange: "28-35 мл",
    status: "normal",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.round(30 + (Math.random() - 0.5) * 5)
    })),
    problemLocations: [
      { name: "Корпус 1", value: "27 мл", status: "warning" },
    ],
  },
  average_weight_0_3: {
    title: "Средний вес",
    currentValue: "45 г",
    targetRange: "42-48 г",
    status: "normal",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.round(45 + (Math.random() - 0.5) * 5)
    })),
    problemLocations: [
      { name: "Корпус 5", value: "41 г", status: "warning" },
    ],
  },
  fcr_0_3: {
    title: "Конверсия корма FCR",
    currentValue: "1.2",
    targetRange: "1.1-1.3",
    status: "normal",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: +(1.20 + (Math.random() - 0.5) * 0.1).toFixed(2)
    })),
    problemLocations: [],
  },
  mortality_0_3: {
    title: "Смертность",
    currentValue: "1.2%",
    targetRange: "< 1.0%",
    status: "warning",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: +(1.1 + (Math.random() - 0.3) * 0.6).toFixed(1)
    })),
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
  chartData: timeLabels.map((time, idx) => {
    // Пиковые выбросы в определенные моменты времени
    const peakIndexes = [5, 12, 18] // индексы, где будут выбросы
    
    if (peakIndexes.includes(idx)) {
      return {
        time,
        value: +(41.2 + Math.random() * 0.8).toFixed(1) // 41.2 - 42.0
      }
    } else {
      // Нормальные колебания
      return {
        time,
        value: +(39.7 + (Math.random() - 0.5) * 0.8).toFixed(1)
      }
    }
  }),
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
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.min(70, Math.max(55, 65 + (Math.random() - 0.5) * 12))
    })),
    problemLocations: [
      { name: "Корпус 2", value: "72%", status: "warning" },
    ],
  },
  ammonia_21_30: {
    title: "Аммиак",
    currentValue: "15 ppm",
    targetRange: "< 10 ppm",
    status: "warning",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.max(0, Math.round(14 + (Math.random() - 0.3) * 5))
    })),
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
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.round(125 + (Math.random() - 0.5) * 8)
    })),
    problemLocations: [
      { name: "Корпус 3", value: "118 г", status: "warning" },
    ],
  },
  water_intake_21_30: {
    title: "Потребление воды",
    currentValue: "250 мл",
    targetRange: "240-260 мл",
    status: "normal",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: Math.round(250 + (Math.random() - 0.5) * 15)
    })),
    problemLocations: [
      { name: "Корпус 1", value: "235 мл", status: "warning" },
    ],
  },
  average_weight_21_30: {
    title: "Средний вес",
    currentValue: "1.8 кг",
    targetRange: "1.7-1.9 кг",
    status: "normal",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: +(1.79 + (Math.random() - 0.5) * 0.1).toFixed(2)
    })),
    problemLocations: [
      { name: "Корпус 5", value: "1.68 кг", status: "warning" },
    ],
  },
  fcr_21_30: {
    title: "Конверсия корма FCR",
    currentValue: "1.65",
    targetRange: "1.6-1.8",
    status: "normal",
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: +(1.65 + (Math.random() - 0.5) * 0.1).toFixed(2)
    })),
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
    chartData: timeLabels.map((time, idx) => ({
      time,
      value: +(1.5 + (Math.random() - 0.3) * 1.2).toFixed(1)
    })),
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