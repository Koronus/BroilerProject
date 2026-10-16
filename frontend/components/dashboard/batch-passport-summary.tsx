import type { BatchPassportResponse } from "@/lib/batch-passport"
import { formatDateTime, noData } from "@/lib/batch-passport-display"

const statusConfig: Record<string, { label: string; className: string }> = {
  OK: { label: "Партия в норме", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  WARNING: { label: "Есть отклонения", className: "border-amber-200 bg-amber-50 text-amber-800" },
  CRITICAL: { label: "Критическое состояние", className: "border-red-200 bg-red-50 text-red-800" },
  UNKNOWN: { label: "Недостаточно данных", className: "border-zinc-300 bg-zinc-50 text-zinc-600" },
}

export function BatchPassportSummary({
  summary,
  status,
  generatedAt,
}: {
  summary: BatchPassportResponse["summary"]
  status: BatchPassportResponse["status"]
  generatedAt: string
}) {
  const config = statusConfig[status === "NORMAL" ? "OK" : status] ?? statusConfig.UNKNOWN

  return (
    <section className="p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Автоматический вывод</p>
          <h2 className="mt-1 text-lg font-semibold">Итоговая оценка</h2>
        </div>
        <p className="text-xs text-zinc-500">Сформировано: {formatDateTime(generatedAt)}</p>
      </div>

      <p className={`mt-3 inline-block rounded-lg border px-3 py-1.5 text-sm font-medium ${config.className}`}>
        {config.label}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-zinc-50/70 p-4 dark:border-white/8 dark:bg-white/4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Риски</p>
          {summary.risks.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-300">{summary.risks.map((risk, index) => <li key={index}>{risk}</li>)}</ul>
          ) : <p className="mt-2 text-sm text-zinc-500">{noData}</p>}
        </div>
        <div className="rounded-2xl border border-black/5 bg-zinc-50/70 p-4 dark:border-white/8 dark:bg-white/4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Рекомендации</p>
          {summary.recommendations.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">{summary.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}</ul>
          ) : <p className="mt-2 text-sm text-zinc-500">{noData}</p>}
        </div>
      </div>
    </section>
  )
}
