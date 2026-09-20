"use client"

import { ChevronRight } from "lucide-react"

import type { CountBreakdown } from "@/lib/incident-analytics"
import { cn } from "@/lib/utils"

interface IncidentBreakdownChartProps {
  title: string
  description: string
  data: CountBreakdown[]
  colors: Record<string, string>
  variant?: "bars" | "segments"
  onSelect: (key: string) => void
}

export function IncidentBreakdownChart({
  title,
  description,
  data,
  colors,
  variant = "bars",
  onSelect,
}: IncidentBreakdownChartProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1)
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="dashboard-panel min-w-0 p-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      {variant === "segments" && total > 0 && (
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8" aria-hidden="true">
          {data.map((item) => (
            <span
              key={item.key}
              className={cn("h-full", colors[item.key] ?? "bg-zinc-400")}
              style={{ width: `${(item.count / total) * 100}%` }}
            />
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2">
        {data.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className="group w-full rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-black/5 hover:bg-black/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:border-white/8 dark:hover:bg-white/5"
            aria-label={`${item.label}: ${item.count}. Открыть реестр`}
          >
            <div className="flex items-center gap-3">
              <span className={cn("size-2.5 shrink-0 rounded-full", colors[item.key] ?? "bg-zinc-400")} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {item.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                {item.count}
              </span>
              <ChevronRight className="size-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300" />
            </div>
            {variant === "bars" && (
              <div className="ml-[22px] mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
                <div
                  className={cn("h-full rounded-full transition-[width]", colors[item.key] ?? "bg-zinc-400")}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
