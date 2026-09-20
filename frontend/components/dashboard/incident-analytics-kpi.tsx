"use client"

import type { LucideIcon } from "lucide-react"
import { Info } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface IncidentAnalyticsKpiProps {
  label: string
  value: string
  details: string
  icon: LucideIcon
  tone: "neutral" | "sky" | "emerald" | "violet"
  tooltip?: string
  onClick?: () => void
}

const toneClasses = {
  neutral: "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
}

export function IncidentAnalyticsKpi({
  label,
  value,
  details,
  icon: Icon,
  tone,
  tooltip,
  onClick,
}: IncidentAnalyticsKpiProps) {
  return (
    <article
      className={cn(
        "dashboard-panel min-w-0 p-5",
        onClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) onClick()
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full text-zinc-400 transition hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:text-zinc-200"
                  aria-label={`Пояснение: ${label}`}
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6} className="max-w-64">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", toneClasses[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-5 break-words text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{details}</p>
    </article>
  )
}
