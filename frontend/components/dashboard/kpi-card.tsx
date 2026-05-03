"use client"

import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type TrendDirection = "up" | "down" | "stable"
type ValueStatus = "normal" | "warning" | "critical"

interface KpiCardProps {
  icon: LucideIcon
  title: string
  value: string
  norm?: string
  trend: TrendDirection
  trendGood?: "up" | "down"
  status?: ValueStatus
  onClick?: () => void
  isActive?: boolean
}

const statusConfig: Record<
  ValueStatus,
  {
    value: string
    badge: string
    surface: string
    line: string
    label: string
  }
> = {
  normal: {
    value: "text-emerald-600 dark:text-emerald-300",
    badge: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    surface: "from-emerald-500/8 via-transparent to-transparent",
    line: "bg-emerald-500/40",
    label: "Норма",
  },
  warning: {
    value: "text-amber-600 dark:text-amber-300",
    badge: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    surface: "from-amber-500/10 via-transparent to-transparent",
    line: "bg-amber-500/45",
    label: "Внимание",
  },
  critical: {
    value: "text-red-600 dark:text-red-300",
    badge: "bg-red-500/12 text-red-600 dark:text-red-300",
    surface: "from-red-500/10 via-transparent to-transparent",
    line: "bg-red-500/45",
    label: "Риск",
  },
}

const trendIcons: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

export function KpiCard({
  icon: Icon,
  title,
  value,
  norm,
  trend,
  trendGood = "up",
  status = "normal",
  onClick,
  isActive,
}: KpiCardProps) {
  const TrendIcon = trendIcons[trend]
  const isTrendPositive = trend === "stable" || trend === trendGood
  const config = statusConfig[status]

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border p-5 text-left transition-all",
        "border-black/5 bg-white/80 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/8",
        isActive &&
          "!border-zinc-900 !bg-zinc-950 !text-white hover:!border-zinc-900 hover:!bg-zinc-950 hover:!text-white dark:!border-white dark:!bg-white dark:!text-zinc-950 dark:hover:!border-white dark:hover:!bg-white dark:hover:!text-zinc-950 shadow-[0_20px_44px_-30px_rgba(15,23,42,0.85)]"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity",
          config.surface,
          isActive && "opacity-60"
        )}
      />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "shrink-0 rounded-2xl border p-3",
              isActive
                ? "border-white/12 bg-white/10 dark:border-zinc-900/10 dark:bg-zinc-900/6"
                : "border-black/5 bg-zinc-950 text-white dark:border-white/10 dark:bg-white/8 dark:text-zinc-100"
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "text-base font-semibold leading-tight",
                isActive ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-100"
              )}
            >
              {title}
            </div>
            <div
              className={cn(
                "mt-2 text-sm leading-6",
                isActive ? "text-white/65 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              Контроль отклонения и динамики
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium",
            isActive
              ? "bg-white/12 text-white dark:bg-zinc-900/8 dark:text-zinc-700"
              : config.badge
          )}
        >
          <TrendIcon
            className={cn(
              "size-3.5 shrink-0",
              isTrendPositive
                ? isActive
                  ? "text-emerald-200 dark:text-emerald-600"
                  : "text-emerald-500"
                : isActive
                  ? "text-red-200 dark:text-red-500"
                  : "text-red-500"
            )}
          />
          <span className="whitespace-nowrap">{config.label}</span>
        </div>

        <div className="mt-8 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div
              className={cn(
                "text-3xl font-semibold tracking-tight",
                isActive ? "text-white dark:text-zinc-950" : config.value
              )}
            >
              {value}
            </div>
            {norm && (
              <div
                className={cn(
                  "mt-2 text-sm",
                  isActive ? "text-white/70 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                Норма:{" "}
                <span className={isActive ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-100"}>
                  {norm}
                </span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "shrink-0 text-xs font-medium",
              isActive ? "text-white/60 dark:text-zinc-600" : "text-zinc-400"
            )}
          >
            7 дней
          </div>
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/8">
          <div className={cn("h-full rounded-full", config.line)} style={{ width: "72%" }} />
        </div>
      </div>
    </button>
  )
}
