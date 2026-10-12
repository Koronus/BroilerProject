import type { BatchPassportResponse } from "@/lib/batch-passport"

const statusConfig: Record<string, { label: string; className: string }> = {
  OK: { label: "Партия в норме", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  WARNING: { label: "Есть отклонения", className: "border-amber-200 bg-amber-50 text-amber-800" },
  CRITICAL: { label: "Критическое состояние", className: "border-red-200 bg-red-50 text-red-800" },
  UNKNOWN: { label: "Недостаточно данных", className: "border-zinc-300 bg-zinc-50 text-zinc-600" },
}

export function BatchPassportSummary({
  summary,
}: {
  summary: BatchPassportResponse["summary"]
}) {
  const config = statusConfig[summary.status] ?? statusConfig.UNKNOWN

  return (
    <section className="dashboard-panel p-5">
      <h2 className="text-base font-semibold">Итоговая оценка</h2>

      <p className={`mt-3 inline-block rounded-lg border px-3 py-1.5 text-sm font-medium ${config.className}`}>
        {config.label}
      </p>

      {summary.risks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Риски</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {summary.risks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.recommendations.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Рекомендации</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {summary.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}