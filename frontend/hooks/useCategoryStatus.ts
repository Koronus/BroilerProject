// hooks/useCategoryStatus.ts
import { useState, useEffect } from "react"

type CategoryStatus = "green" | "yellow" | "red"

interface Category {
  id: string
  name: string
  status: CategoryStatus
}

// Данные о метриках
const metrics = [
  {
    id: "temperature",
    title: "Температура клоаки",
    value: "39.8°C",
    norm: "39.4-40.5",
    status: "normal" as const,
    categoryId: "microclimate",
  },
  {
    id: "humidity",
    title: "Влажность",
    value: "65%",
    norm: "55-70%",
    status: "critical" as const, // Красный
    categoryId: "microclimate",
  },
  {
    id: "ammonia",
    title: "Аммиак",
    value: "15 ppm",
    norm: "< 10 ppm",
    status: "warning" as const, // Желтый
    categoryId: "microclimate",
  },
  {
    id: "mortality",
    title: "Смертность",
    value: "2.1%",
    norm: "< 1.5%",
    status: "critical" as const, // Красный
    categoryId: "herd",
  },
  {
    id: "uniformity",
    title: "Однородность стада",
    value: "82%",
    norm: "> 85%",
    status: "warning" as const, // Желтый
    categoryId: "herd",
  },
  {
    id: "fcr",
    title: "Конверсия корма FCR",
    value: "1.65",
    norm: "1.6-1.8",
    status: "normal" as const,
    categoryId: "feeding",
  },
]

// Базовые категории
const baseCategories: Omit<Category, "status">[] = [
  { id: "microclimate", name: "Микроклимат" },
  { id: "herd", name: "Состояние стада" },
  { id: "feeding", name: "Кормление и конверсия" },
  { id: "production", name: "Производственные параметры" },
  { id: "consumption", name: "Потребление ресурсов" },
]

// Функция для вычисления статуса категории
const getCategoryStatus = (categoryId: string): CategoryStatus => {
  const categoryMetrics = metrics.filter(m => m.categoryId === categoryId)
  
  if (categoryMetrics.length === 0) return "green"
  
  const hasCritical = categoryMetrics.some(m => m.status === "critical")
  const hasWarning = categoryMetrics.some(m => m.status === "warning")
  
  if (hasCritical) return "red"
  if (hasWarning) return "yellow"
  return "green"
}

// Хук для получения категорий с актуальными статусами
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const updateCategories = () => {
      const updated = baseCategories.map(cat => ({
        ...cat,
        status: getCategoryStatus(cat.id)
      }))
      setCategories(updated)
    }
    
    updateCategories()
  }, []) // Пустой массив зависимостей, так как метрики статичны

  return { categories, metrics }
}