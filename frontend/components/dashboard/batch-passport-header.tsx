import { CalendarDays, Dna, Factory, Hash, MapPin, Sprout } from "lucide-react"

import type { BatchPassportResponse } from "@/lib/batch-passport"
import { formatDate, noData } from "@/lib/batch-passport-display"

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Активна", className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300" },
  CLOSED: { label: "Закрыта", className: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-white/10 dark:bg-white/8 dark:text-zinc-200" },
  ARCHIVED: { label: "Архив", className: "border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400" },
}

export function BatchPassportHeader({ passport }: { passport: BatchPassportResponse }) {
  const { batch, ageDays, ageBasis } = passport
  const status = batch.status ? statusLabels[batch.status] : null
  const details = [
    { label: "Дата вывода", value: formatDate(batch.hatchDate), icon: Sprout },
    { label: "Дата посадки", value: formatDate(batch.placementDate), icon: CalendarDays },
    { label: "Кросс", value: batch.cross ?? noData, icon: Dna },
    { label: "Происхождение", value: batch.origin ?? noData, icon: MapPin },
    { label: "Ферма", value: batch.farm ?? noData, icon: Factory },
    { label: "Зона", value: batch.zone ?? noData, icon: MapPin },
  ]

  return (
    <header className="border-b border-black/5 p-5 dark:border-white/8 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Hash className="size-5 text-zinc-400" /><h2 className="text-2xl font-semibold tracking-tight">{batch.batchNumber || noData}</h2></div>
          <p className="mt-2 text-sm text-zinc-500">{batch.workshop ?? noData} · {batch.house ?? noData}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="dashboard-chip">{ageDays === null ? noData : `${ageDays} ${ageBasis === "PLACEMENT_DATE" ? "дн. с посадки" : "дн. с вывода"}`}</span>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${status?.className ?? statusLabels.ARCHIVED.className}`}>{status?.label ?? noData}</span>
        </div>
      </div>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Происхождение и размещение</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-black/5 bg-zinc-50/70 p-4 dark:border-white/8 dark:bg-white/4">
              <dt className="flex items-center gap-2 text-xs text-zinc-500"><Icon className="size-3.5" />{label}</dt>
              <dd className="mt-2 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </header>
  )
}
