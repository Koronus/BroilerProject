"use client"

import { Activity, ArrowUpRight, CircleAlert, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { metrics } from "./kpi-grid"

type CategoryStatus = "green" | "yellow" | "red"

interface Category {
  id: string
  name: string
  status: CategoryStatus
}

export const categories: Category[] = [
  { id: "microclimate", name: "Микроклимат", status: "green" },
  { id: "production", name: "Производственные параметры", status: "green" },
  { id: "consumption", name: "Потребление ресурсов", status: "green" },
  { id: "herd", name: "Состояние стада", status: "green" },
]

const statusConfig: Record<
  CategoryStatus,
  { dot: string; badge: string; label: string }
> = {
  green: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    label: "Стабильно",
  },
  yellow: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    label: "Нужен контроль",
  },
  red: {
    dot: "bg-red-500",
    badge: "bg-red-500/12 text-red-600 dark:text-red-300",
    label: "Риск",
  },
}

const getCategoryStatus = (categoryId: string): CategoryStatus => {
  const categoryMetrics = metrics.filter((metric) => metric.categoryId === categoryId)

  if (categoryMetrics.length === 0) return "green"

  const hasCritical = categoryMetrics.some((metric) => metric.status === "critical")
  const hasWarning = categoryMetrics.some((metric) => metric.status === "warning")

  if (hasCritical) return "red"
  if (hasWarning) return "yellow"
  return "green"
}

interface CategorySidebarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategorySidebar({
  activeCategory,
  onCategoryChange,
}: CategorySidebarProps) {
  const warningCount = metrics.filter((metric) => metric.status === "warning").length
  const criticalCount = metrics.filter((metric) => metric.status === "critical").length

  return (
    <aside className="flex flex-col gap-4 rounded-[24px]">
      <div className="dashboard-panel px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Навигация
            </p>
            <h2 className="mt-2 break-words text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              Технологические группы
            </h2>
          </div>
          <span className="dashboard-chip shrink-0 whitespace-nowrap">
            <Activity className="size-3.5" />
            {categories.length} раздела
          </span>
        </div>

        {/* ИСПРАВЛЕННЫЕ КАРТОЧКИ - ВСЕГДА В ОДНУ СТРОКУ */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/8 dark:bg-white/4">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              <CircleAlert className="size-4 text-amber-500 shrink-0" />
              Внимание
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {warningCount}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/8 dark:bg-white/4">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              <ShieldCheck className="size-4 text-red-500 shrink-0" />
              Критично
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {criticalCount}
            </div>
          </div>
        </div>
      </div>

      {/* НАВИГАЦИЯ - ВЕРТИКАЛЬНЫЙ СПИСОК */}
      <nav className="dashboard-panel p-3">
        <div className="flex flex-col gap-2">
          {categories.map((category) => {
            const status = getCategoryStatus(category.id)
            const config = statusConfig[status]
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "w-full rounded-[22px] border p-4 text-left transition-all",
                  isActive
                    ? "!border-zinc-900 !bg-zinc-950 !text-white hover:!border-zinc-900 hover:!bg-zinc-950 hover:!text-white dark:!border-white dark:!bg-white dark:!text-zinc-950 dark:hover:!border-white dark:hover:!bg-white dark:hover:!text-zinc-950 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.8)]"
                    : "border-black/5 bg-white/70 hover:border-black/10 hover:bg-white dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/8"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2.5 rounded-full shrink-0", config.dot)} />
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[11px] font-medium whitespace-nowrap",
                          isActive ? "bg-white/14 text-white/85 dark:bg-zinc-900/10 dark:text-zinc-700" : config.badge
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-medium leading-5">
                      <span className="whitespace-normal break-words">{category.name}</span>
                    </div>
                  </div>
                  <ArrowUpRight
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isActive ? "text-white/80 dark:text-zinc-700" : "text-zinc-400"
                    )}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}