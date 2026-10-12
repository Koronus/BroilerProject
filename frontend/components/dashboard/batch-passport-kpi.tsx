import type { BatchPassportResponse } from "@/lib/batch-passport"

export function BatchPassportKpi({ kpi }: { kpi: BatchPassportResponse["kpi"] }) {
  const cards = [
    {
      label: "Поголовье",
      value:
        kpi.currentBirdCount !== null && kpi.initialBirdCount !== null
          ? `${kpi.currentBirdCount} из ${kpi.initialBirdCount}`
          : "—",
      hint: kpi.survivalRate !== null ? `Сохранность ${kpi.survivalRate}%` : null,
    },
    {
      label: "Смертность",
      value: kpi.mortality !== null ? String(kpi.mortality) : "—",
      hint: kpi.survivalRate !== null ? `Сохранность ${kpi.survivalRate}%` : null,
    },
    {
      label: "Инциденты",
      value: String(kpi.totalIncidents),
      hint:
        kpi.criticalIncidents > 0
          ? `${kpi.criticalIncidents} критических`
          : "Критических нет",
    },
    {
      label: "Открытые задачи",
      value: String(kpi.openTasks),
      hint: kpi.openTasks === 0 ? "Все задачи закрыты" : null,
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="dashboard-panel p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          {card.hint && <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>}
        </article>
      ))}
    </section>
  )
}