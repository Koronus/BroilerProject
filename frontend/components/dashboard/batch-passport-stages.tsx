import { Check, CircleDashed, Flag, Sprout } from "lucide-react"

import type { BatchPassportResponse } from "@/lib/batch-passport"
import { formatDate, noData } from "@/lib/batch-passport-display"
import { cn } from "@/lib/utils"

export function BatchPassportStages({ passport }: { passport: BatchPassportResponse }) {
  const { batch, ageDays, ageBasis } = passport
  const stages = [
    {
      label: "Партия создана",
      value: formatDate(batch.createdAt),
      complete: Boolean(batch.createdAt),
      icon: Check,
    },
    {
      label: "Посадка",
      value: formatDate(batch.placementDate),
      complete: Boolean(batch.placementDate),
      icon: Sprout,
    },
    {
      label: batch.status === "ACTIVE" ? "Выращивание" : "Период выращивания",
      value:
        ageDays === null
          ? noData
          : `${ageDays} ${ageBasis === "PLACEMENT_DATE" ? "дн. с посадки" : "дн. с вывода"}`,
      complete: ageDays !== null,
      icon: CircleDashed,
    },
    {
      label: "Завершение",
      value: formatDate(batch.closeDate),
      complete: Boolean(batch.closeDate),
      icon: Flag,
    },
  ]

  return (
    <section className="border-b border-black/5 p-5 dark:border-white/8 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Жизненный цикл</p>
        <h2 className="mt-1 text-lg font-semibold">Этапы партии</h2>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <li key={stage.label} className="relative rounded-2xl border border-black/5 bg-zinc-50/70 p-4 dark:border-white/8 dark:bg-white/4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  stage.complete ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400",
                )}>
                  <Icon className="size-4" />
                </span>
                <span className="text-xs font-medium text-zinc-500">Этап {index + 1}</span>
              </div>
              <p className="mt-4 text-sm font-semibold">{stage.label}</p>
              <p className="mt-1 text-sm text-zinc-500">{stage.value}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
