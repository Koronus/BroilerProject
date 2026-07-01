"use client"

import { cn } from "@/lib/utils"
import { metrics } from "./kpi-grid"

type CategoryStatus = "green" | "yellow" | "red"

interface Category {
  id: string
  name: string
  status: CategoryStatus
}

export const categories: Category[] = [
  { id: "lighting", name: "Освещение", status: "green" },
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
  return (
    <aside className="flex flex-col gap-3">
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
                : "border-black/5 bg-white shadow-sm hover:border-black/10 hover:shadow-md dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/8"
            )}
          >
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
            <div className="mt-3 text-base font-medium leading-5">
              <span className="whitespace-normal break-words">{category.name}</span>
            </div>
          </button>
        )
      })}
    </aside>
  )
}
