// lib/dashboard-data.ts
import {
  Thermometer,
  Droplets,
  CheckCircle,
  Wheat,
  Activity,
  Users,
} from "lucide-react"

export type MetricStatus = "normal" | "warning" | "critical"
export type CategoryStatus = "green" | "yellow" | "red"

export interface Metric {
  id: string
  icon: any
  title: string
  value: string
  norm: string
  trend: "up" | "down" | "stable"
  trendGood: "up" | "down" | "stable"
  status: MetricStatus
  categoryId: string
}

export interface Category {
  id: string
  name: string
  status: CategoryStatus
}

// Метрики
export const metrics: Metric[] = [
  {
    id: "temperature",
    icon: Thermometer,
    title: "Температура",
    value: "39.8°C",
    norm: "39.4-40.5",
    trend: "up",
    trendGood: "up",
    status: "normal",
    categoryId: "microclimate",
  },
  {
    id: "humidity",
    icon: Droplets,
    title: "Влажность",
    value: "65%",
    norm: "55-70%",
    trend: "stable",
    trendGood: "up",
    status: "critical", // Красный
    categoryId: "microclimate",
  },
  {
    id: "ammonia",
    icon: Droplets,
    title: "Аммиак",
    value: "15 ppm",
    norm: "< 10 ppm",
    trend: "up",
    trendGood: "down",
    status: "warning", // Желтый
    categoryId: "microclimate",
  },
  {
    id: "crop",
    icon: CheckCircle,
    title: "Наполнение зоба",
    value: "92%",
    norm: "> 90%",
    trend: "up",
    trendGood: "up",
    status: "normal",
    categoryId: "feeding",
  },
  {
    id: "fcr",
    icon: Wheat,
    title: "Конверсия корма FCR",
    value: "1.65",
    norm: "1.6-1.8",
    trend: "stable",
    trendGood: "down",
    status: "normal",
    categoryId: "feeding",
  },
  {
    id: "mortality",
    icon: Activity,
    title: "Смертность",
    value: "2.1%",
    norm: "< 1.5%",
    trend: "up",
    trendGood: "down",
    status: "critical", // Красный
    categoryId: "herd",
  },
  {
    id: "uniformity",
    icon: Users,
    title: "Однородность стада",
    value: "82%",
    norm: "> 85%",
    trend: "down",
    trendGood: "up",
    status: "warning", // Желтый
    categoryId: "herd",
  },
]

// Базовые категории без статусов
const baseCategories: Omit<Category, "status">[] = [
  { id: "microclimate", name: "Микроклимат" },
  { id: "herd", name: "Состояние стада" },
  { id: "feeding", name: "Кормление и конверсия" },
  { id: "production", name: "Производственные параметры" },
  { id: "consumption", name: "Потребление ресурсов" },
  { id: "water", name: "Поение и водоснабжение" },
  { id: "veterinary", name: "Ветеринарные параметры" },
]

// Функция для вычисления статуса категории на основе метрик
const getCategoryStatus = (categoryId: string): CategoryStatus => {
  const categoryMetrics = metrics.filter(m => m.categoryId === categoryId)
  
  if (categoryMetrics.length === 0) return "green"
  
  const hasCritical = categoryMetrics.some(m => m.status === "critical")
  const hasWarning = categoryMetrics.some(m => m.status === "warning")
  
  if (hasCritical) return "red"
  if (hasWarning) return "yellow"
  return "green"
}

// Получаем категории с вычисленными статусами
export const categories: Category[] = baseCategories.map(cat => ({
  ...cat,
  status: getCategoryStatus(cat.id)
}))

// Функция для получения метрик по категории
export const getMetricsByCategory = (categoryId: string): Metric[] => {
  return metrics.filter(metric => metric.categoryId === categoryId)
}

// Функция для получения названия категории по id
export const getCategoryName = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || "Показатели"
}

// Функция для получения первой метрики в категории
export const getFirstMetricInCategory = (categoryId: string): string => {
  const categoryMetrics = getMetricsByCategory(categoryId)
  return categoryMetrics[0]?.id || ""
}