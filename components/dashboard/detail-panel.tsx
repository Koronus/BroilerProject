"use client"

import { AlertTriangle, ClipboardPlus, FileText, X } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { metricsDetails } from "@/lib/metricks-detail"

interface DetailPanelProps {
  onClose: () => void
  activeMetric: string
}

export function DetailPanel({ onClose, activeMetric }: DetailPanelProps) {
  const metricData = metricsDetails[activeMetric]

  if (!metricData) {
    return (
      <aside className="dashboard-panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Детализация показателя
          </h2>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 p-2 text-zinc-500 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/8"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">Данные не найдены</p>
      </aside>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-600 bg-red-500/12 border-red-500/20 dark:text-red-300"
      case "warning":
        return "text-amber-600 bg-amber-500/12 border-amber-500/20 dark:text-amber-300"
      default:
        return "text-emerald-600 bg-emerald-500/12 border-emerald-500/20 dark:text-emerald-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Критично"
      case "warning":
        return "Внимание"
      default:
        return "Норма"
    }
  }

  const getChartColor = (status: string) => {
    switch (status) {
      case "critical":
        return "#ef4444"
      case "warning":
        return "#f59e0b"
      default:
        return "#10b981"
    }
  }

  const formatYAxis = (value: number) => {
    if (metricData.title.includes("Температура")) return `${value}°C`
    if (metricData.title.includes("FCR") || metricData.title.includes("Конверсия")) return value.toString()
    if (metricData.title.includes("Аммиак")) return `${value} ppm`
    if (metricData.title.includes("Вес")) return metricData.currentValue.includes("кг") ? `${value} кг` : `${value} г`
    if (metricData.title.includes("Потребление корма")) return metricData.currentValue.includes("кг") ? `${value} кг` : `${value} г`
    if (metricData.title.includes("Потребление воды")) return metricData.currentValue.includes("мл") ? `${value} мл` : `${value} л`
    return `${value}%`
  }

  const formatTooltip = (value: number) => {
    if (metricData.title.includes("Температура")) return [`${value}°C`, metricData.title]
    if (metricData.title.includes("FCR") || metricData.title.includes("Конверсия")) return [value.toString(), metricData.title]
    if (metricData.title.includes("Аммиак")) return [`${value} ppm`, metricData.title]
    if (metricData.title.includes("Вес")) {
      const unit = metricData.currentValue.includes("кг") ? "кг" : "г"
      return [`${value} ${unit}`, metricData.title]
    }
    return [`${value}`, metricData.title]
  }

  return (
    <aside className="dashboard-panel p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Детализация
          </p>
          <h2 className="mt-2 break-words text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {metricData.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-black/5 p-2 text-zinc-500 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/8"
          aria-label="Закрыть панель"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Текущее значение
          </p>
          <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            {metricData.currentValue}
          </div>
          <Badge className={`mt-3 border ${getStatusColor(metricData.status)}`}>
            {getStatusText(metricData.status)}
          </Badge>
        </div>

        <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Целевой диапазон
          </p>
          <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            {metricData.targetRange}
          </div>
          <Badge className="mt-3 border border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
            Норма
          </Badge>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Динамика за 7 дней</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metricData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="detailMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartColor(metricData.status)} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={getChartColor(metricData.status)} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.16)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={formatYAxis} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "16px",
                  color: "#18181b",
                }}
                formatter={formatTooltip}
                labelStyle={{ color: "#71717a" }}
              />
              <Area type="monotone" dataKey="value" stroke={getChartColor(metricData.status)} strokeWidth={2.5} fillOpacity={1} fill="url(#detailMetric)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Проблемные локации</h3>
        <div className="mt-4 space-y-3">
          {metricData.problemLocations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
              Отклонений по локациям не найдено.
            </div>
          ) : (
            metricData.problemLocations.map((location) => (
              <div
                key={location.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 px-4 py-4 dark:border-white/8"
              >
                <span className="min-w-0 break-words text-sm font-medium text-zinc-900 dark:text-zinc-100">{location.name}</span>
                <div className="flex items-center gap-2">
                  <span className={location.status === "critical" ? "text-sm font-semibold text-red-600 dark:text-red-300" : "text-sm font-semibold text-amber-600 dark:text-amber-300"}>
                    {location.value}
                  </span>
                  <Badge
                    className={
                      location.status === "critical"
                        ? "border border-red-500/20 bg-red-500/12 text-red-600 dark:text-red-300"
                        : "border border-amber-500/20 bg-amber-500/12 text-amber-600 dark:text-amber-300"
                    }
                  >
                    {location.status === "critical" ? "Критично" : "Внимание"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {metricData.relatedIncident && (
        <div className="mt-5 rounded-[24px] border border-amber-500/20 bg-amber-500/8 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {metricData.relatedIncident.title}
              </h4>
              <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-200/85">
                {metricData.relatedIncident.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="rounded-full border-black/10 bg-white/80 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/4 dark:text-zinc-200 dark:hover:bg-white/8"
        >
          <FileText className="size-4" />
          Полный отчет
        </Button>
        <Button className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
          <ClipboardPlus className="size-4" />
          Создать задачу
        </Button>
      </div>
    </aside>
  )
}
