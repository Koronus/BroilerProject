"use client"

import { useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"

import type { BatchPassportResponse } from "@/lib/batch-passport"
import {
  formatMetricValue,
  formatNumber,
  getAllMetrics,
  metricTypeLabels,
  noData,
} from "@/lib/batch-passport-display"
import { Button } from "@/components/ui/button"

interface DisplayMetric {
  key: string
  label: string
  value: string
  type?: string
}

function MetricCard({ metric }: { metric: DisplayMetric }) {
  return (
    <article className="min-w-0 rounded-xl border border-black/5 bg-zinc-50/70 px-3.5 py-3 dark:border-white/8 dark:bg-white/4">
      <p className="truncate text-xs font-medium text-zinc-500" title={metric.label}>{metric.label}</p>
      <p className="mt-1.5 truncate text-lg font-semibold tracking-tight" title={metric.value}>{metric.value}</p>
    </article>
  )
}

export function BatchPassportMetrics({ passport }: { passport: BatchPassportResponse }) {
  const [expanded, setExpanded] = useState(false)
  const schedule = passport.lighting.schedule
  const allMetrics: DisplayMetric[] = getAllMetrics(passport).map((metric, index) => ({
    key: `${metric.type}-${metric.unit ?? "none"}-${index}`,
    label: metricTypeLabels[metric.type] ?? metric.type,
    value: formatMetricValue(metric.latest, metric.unit),
    type: metric.type,
  }))

  allMetrics.push({
    key: "lighting-schedule",
    label: "Соблюдение светового режима",
    value: schedule.latestCompliancePercent === null
      ? noData
      : `${formatNumber(schedule.latestCompliancePercent)}%`,
  })

  const importantTypes = ["TEMPERATURE", "WEIGHT", "MORTALITY"]
  const importantMetrics = importantTypes
    .map((type) => allMetrics.find((metric) => metric.type === type))
    .filter((metric): metric is DisplayMetric => Boolean(metric))

  const fallbackMetrics = allMetrics.filter(
    (metric) => !importantMetrics.some((important) => important.key === metric.key),
  )
  const compactMetrics = [...importantMetrics, ...fallbackMetrics].slice(0, 3)
  const visibleMetrics = expanded ? allMetrics : compactMetrics

  return (
    <section className="border-b border-black/5 p-5 dark:border-white/8 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">На момент формирования</p>
          <h2 className="mt-1 text-lg font-semibold">Текущие показатели</h2>
        </div>
        {allMetrics.length > 3 && (
          <Button variant="outline" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {expanded ? "Свернуть" : `Больше (${allMetrics.length - 3})`}
          </Button>
        )}
      </div>
      <div className={expanded
        ? "mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6"
        : "mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3"
      }>
        {visibleMetrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
      </div>
    </section>
  )
}

export function BatchPassportDeviations({ passport }: { passport: BatchPassportResponse }) {
  const deviations = getAllMetrics(passport).filter(
    (metric) => metric.status === "WARNING" || metric.status === "CRITICAL" || (metric.deviationCount ?? 0) > 0,
  )
  const scheduleDeviation =
    passport.lighting.schedule.status === "WARNING" || passport.lighting.schedule.status === "CRITICAL"

  return (
    <section className="border-b border-black/5 p-5 dark:border-white/8 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Контроль нормативов</p>
          <h2 className="mt-1 text-lg font-semibold">Отклонения</h2>
        </div>
        <span className="dashboard-chip">Всего: {passport.aggregates.deviationCount ?? noData}</span>
      </div>

      {deviations.length === 0 && !scheduleDeviation ? (
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 p-5 text-sm text-zinc-500 dark:border-white/10">
          {passport.aggregates.deviationsComplete ? "Отклонений не обнаружено" : noData}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {deviations.map((metric) => (
            <article key={`${metric.type}-${metric.unit ?? "none"}`} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold">{metricTypeLabels[metric.type] ?? metric.type}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Зафиксировано отклонений: {metric.deviationCount ?? noData}. Текущее значение: {formatMetricValue(metric.latest, metric.unit)}.</p>
              </div>
            </article>
          ))}
          {scheduleDeviation && (
            <article className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div><p className="text-sm font-semibold">Световой режим</p><p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Отклонение: {passport.lighting.schedule.deviationMinutes === null ? noData : `${passport.lighting.schedule.deviationMinutes} мин`}.</p></div>
            </article>
          )}
        </div>
      )}
    </section>
  )
}
