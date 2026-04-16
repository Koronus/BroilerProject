"use client"

import { useMemo } from "react"
import {
  Activity,
  CheckCircle,
  Droplet,
  Droplets,
  Scale,
  Thermometer,
  Utensils,
  Wheat,
  Wind,
} from "lucide-react"
import { categories } from "./category-sidebar"
import { KpiCard } from "./kpi-card"

interface KpiGridProps {
  onSelectMetric: (metric: string) => void
  activeMetric: string
  activeCategory: string
  selectedAge: BirdAgeGroup
}

interface Metric {
  id: string
  icon: any
  title: string
  value: string
  norm: string
  trend: "up" | "down" | "stable"
  trendGood: "up" | "down"
  status: "normal" | "warning" | "critical"
  categoryId: string
  ageGroup?: string
}

export type BirdAgeGroup = "0-3" | "21-30"

const metricsByAge: Record<BirdAgeGroup, Metric[]> = {
  "0-3": [
    { id: "temperature_0_3", icon: Thermometer, title: "Температура", value: "40.2°C", norm: "40.0-40.8", trend: "up", trendGood: "up", status: "normal", categoryId: "microclimate", ageGroup: "0-3" },
    { id: "humidity_0_3", icon: Droplets, title: "Влажность", value: "70%", norm: "65-75%", trend: "stable", trendGood: "up", status: "normal", categoryId: "microclimate", ageGroup: "0-3" },
    { id: "ammonia_0_3", icon: Wind, title: "Аммиак", value: "8 ppm", norm: "< 5 ppm", trend: "up", trendGood: "down", status: "warning", categoryId: "microclimate", ageGroup: "0-3" },
    { id: "feed_intake_0_3", icon: Utensils, title: "Потребление корма", value: "15 г", norm: "14-18 г", trend: "up", trendGood: "up", status: "normal", categoryId: "consumption", ageGroup: "0-3" },
    { id: "water_intake_0_3", icon: Droplet, title: "Потребление воды", value: "30 мл", norm: "28-35 мл", trend: "up", trendGood: "up", status: "normal", categoryId: "consumption", ageGroup: "0-3" },
    { id: "average_weight_0_3", icon: Scale, title: "Средний вес", value: "45 г", norm: "42-48 г", trend: "up", trendGood: "up", status: "normal", categoryId: "production", ageGroup: "0-3" },
    { id: "fcr_0_3", icon: Wheat, title: "Конверсия корма FCR", value: "1.2", norm: "1.1-1.3", trend: "up", trendGood: "down", status: "normal", categoryId: "production", ageGroup: "0-3" },
    { id: "mortality_0_3", icon: Activity, title: "Смертность", value: "1.2%", norm: "< 1.0%", trend: "up", trendGood: "down", status: "warning", categoryId: "herd", ageGroup: "0-3" },
  ],
  "21-30": [
    { id: "temperature_21_30", icon: Thermometer, title: "Температура", value: "39.8°C", norm: "39.4-40.5", trend: "up", trendGood: "up", status: "normal", categoryId: "microclimate", ageGroup: "21-30" },
    { id: "humidity_21_30", icon: Droplets, title: "Влажность", value: "65%", norm: "55-70%", trend: "down", trendGood: "up", status: "normal", categoryId: "microclimate", ageGroup: "21-30" },
    { id: "ammonia_21_30", icon: Wind, title: "Аммиак", value: "15 ppm", norm: "< 10 ppm", trend: "up", trendGood: "down", status: "warning", categoryId: "microclimate", ageGroup: "21-30" },
    { id: "feed_intake_21_30", icon: Utensils, title: "Потребление корма", value: "125 г", norm: "120-130 г", trend: "up", trendGood: "down", status: "normal", categoryId: "consumption", ageGroup: "21-30" },
    { id: "water_intake_21_30", icon: Droplet, title: "Потребление воды", value: "250 мл", norm: "240-260 мл", trend: "up", trendGood: "down", status: "normal", categoryId: "consumption", ageGroup: "21-30" },
    { id: "average_weight_21_30", icon: Scale, title: "Средний вес", value: "1.8 кг", norm: "1.7-1.9 кг", trend: "up", trendGood: "up", status: "normal", categoryId: "production", ageGroup: "21-30" },
    { id: "fcr_21_30", icon: Wheat, title: "Конверсия корма FCR", value: "1.65", norm: "1.6-1.8", trend: "up", trendGood: "down", status: "normal", categoryId: "production", ageGroup: "21-30" },
    { id: "mortality_21_30", icon: Activity, title: "Смертность", value: "2.1%", norm: "< 1.5%", trend: "up", trendGood: "down", status: "critical", categoryId: "herd", ageGroup: "21-30" },
  ],
}

export const metrics = metricsByAge["21-30"]
export const getMetricsForAge = (age: BirdAgeGroup) => metricsByAge[age]

export function KpiGrid({ onSelectMetric, activeMetric, activeCategory, selectedAge }: KpiGridProps) {
  const currentMetrics = metricsByAge[selectedAge]
  const currentCategory = categories.find((cat) => cat.id === activeCategory)
  const filteredMetrics = currentMetrics.filter((metric) => metric.categoryId === activeCategory)

  const summary = useMemo(() => {
    const warnings = currentMetrics.filter((metric) => metric.status === "warning").length
    const critical = currentMetrics.filter((metric) => metric.status === "critical").length
    const stable = currentMetrics.filter((metric) => metric.status === "normal").length

    return { warnings, critical, stable }
  }, [currentMetrics])

  return (
    <div className="flex flex-col">
      <div className="border-b border-black/5 px-5 py-5 dark:border-white/8 md:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Выбранный раздел
            </p>
            <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {currentCategory?.name || "Показатели"}
            </h2>
            <p className="mt-2 max-w-2xl break-words text-sm text-zinc-500 dark:text-zinc-400">
              Карточки собраны по текущей возрастной группе и помогают быстро увидеть отклонения от нормы.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-black/5 bg-white/80 px-4 py-3 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              Возрастной срез:{" "}
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {selectedAge === "0-3" ? "0-3 дня" : "21-30 дней"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-white/75 p-4 dark:border-white/8 dark:bg-white/4">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CheckCircle className="size-4 text-emerald-500" />
              Стабильные метрики
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {summary.stable}
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white/75 p-4 dark:border-white/8 dark:bg-white/4">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Activity className="size-4 text-amber-500" />
              Предупреждения
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {summary.warnings}
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white/75 p-4 dark:border-white/8 dark:bg-white/4">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Activity className="size-4 text-red-500" />
              Критические
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {summary.critical}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 md:px-6">
        {filteredMetrics.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/50 p-8 text-center dark:border-white/10 dark:bg-white/3">
            <div>
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                Для этой категории пока нет метрик
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Выберите другую возрастную группу или переключитесь на соседний раздел.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredMetrics.map((metric) => (
              <KpiCard
                key={metric.id}
                icon={metric.icon}
                title={metric.title}
                value={metric.value}
                norm={metric.norm}
                trend={metric.trend}
                trendGood={metric.trendGood}
                status={metric.status}
                onClick={() => onSelectMetric(metric.id)}
                isActive={activeMetric === metric.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
