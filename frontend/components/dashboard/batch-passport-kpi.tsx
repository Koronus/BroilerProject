import type { BatchPassportResponse } from "@/lib/batch-passport"
import { formatNumber, noData } from "@/lib/batch-passport-display"

export function BatchPassportKpi({ kpi, aggregates }: { kpi: BatchPassportResponse["kpi"]; aggregates: BatchPassportResponse["aggregates"] }) {
  const cards = [
    { label: "Поголовье", value: kpi.currentBirdCount === null ? noData : formatNumber(kpi.currentBirdCount, 0), hint: kpi.initialBirdCount === null ? `Исходное: ${noData}` : `из ${formatNumber(kpi.initialBirdCount, 0)} голов` },
    { label: "Сохранность", value: kpi.survivalRate === null ? noData : `${formatNumber(kpi.survivalRate)}%`, hint: kpi.mortality === null ? `Смертность: ${noData}` : `Смертность: ${formatNumber(kpi.mortality, 0)}` },
    { label: "Инциденты", value: String(aggregates.incidentCount), hint: `Критических: ${aggregates.criticalIncidentCount}` },
    { label: "Открытые задачи", value: String(aggregates.openTaskCount), hint: aggregates.openTaskCount === 0 ? "Все задачи закрыты" : "Требуют исполнения" },
  ]

  return (
    <section className="border-b border-black/5 p-5 dark:border-white/8 md:p-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-black/5 bg-zinc-50/70 p-4 dark:border-white/8 dark:bg-white/4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p><p className="mt-2 text-2xl font-semibold">{card.value}</p><p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
