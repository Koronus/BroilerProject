"use client"

import { ArrowUpRight } from "lucide-react"

import type { HouseAnalytics } from "@/lib/incident-analytics"
import { formatDuration, formatPercent } from "@/lib/incident-analytics"
import { cn } from "@/lib/utils"

interface HouseAnalyticsTableProps {
  rows: HouseAnalytics[]
  onSelect: (workshop: string, house: string) => void
}

function getSlaClass(value: number | null) {
  if (value === null) return "text-zinc-500"
  if (value < 70) return "text-red-600 dark:text-red-400"
  if (value < 90) return "text-amber-600 dark:text-amber-400"
  return "text-emerald-600 dark:text-emerald-400"
}

export function HouseAnalyticsTable({ rows, onSelect }: HouseAnalyticsTableProps) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-black/5 px-5 py-5 dark:border-white/8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Показатели по птичникам</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Сортировка по числу инцидентов и худшему показателю реакция в SLA
          </p>
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Птичников: {rows.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="border-b border-black/5 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-white/8 dark:bg-white/4 dark:text-zinc-400">
            <tr>
              <th className="px-5 py-3 font-medium">Цех / птичник</th>
              <th className="px-4 py-3 text-right font-medium">Всего</th>
              <th className="px-4 py-3 text-right font-medium">Критические</th>
              <th className="px-4 py-3 text-right font-medium">Средняя реакция</th>
              <th className="px-4 py-3 text-right font-medium">Реакция в SLA</th>
              <th className="px-4 py-3 text-right font-medium">Закрыто</th>
              <th className="w-12 px-4 py-3"><span className="sr-only">Открыть</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/8">
            {rows.map((row) => (
              <tr
                key={`${row.workshop}-${row.house}`}
                onClick={() => onSelect(row.workshop, row.house)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelect(row.workshop, row.house)
                }}
                tabIndex={0}
                className="group cursor-pointer outline-none transition hover:bg-black/[0.025] focus-visible:bg-sky-50 dark:hover:bg-white/4 dark:focus-visible:bg-sky-950/30"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-zinc-950 dark:text-zinc-50">{row.house}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{row.workshop}</p>
                </td>
                <td className="px-4 py-4 text-right font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">{row.total}</td>
                <td className="px-4 py-4 text-right tabular-nums text-red-600 dark:text-red-400">{row.critical}</td>
                <td className="px-4 py-4 text-right tabular-nums text-zinc-700 dark:text-zinc-200">{formatDuration(row.avgReactionMinutes)}</td>
                <td className={cn("px-4 py-4 text-right font-semibold tabular-nums", getSlaClass(row.slaPercent))}>
                  <span>{formatPercent(row.slaPercent)}</span>
                  <span className="mt-1 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                    {row.slaMetCount} из {row.slaMetCount + row.slaBreachedCount}
                  </span>
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-zinc-700 dark:text-zinc-200">{row.closed}</td>
                <td className="px-4 py-4 text-right">
                  <ArrowUpRight className="ml-auto size-4 text-zinc-300 transition group-hover:text-zinc-700 dark:text-zinc-600 dark:group-hover:text-zinc-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
