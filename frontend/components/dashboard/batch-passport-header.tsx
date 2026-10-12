import type { BatchPassportResponse } from "@/lib/batch-passport"
import { batches as frontendBatches } from "@/lib/production-filters"

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Активна", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  CLOSED: { label: "Закрыта", className: "border-zinc-300 bg-zinc-100 text-zinc-700" },
  ARCHIVED: { label: "Архив", className: "border-zinc-300 bg-zinc-50 text-zinc-500" },
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("ru-RU")
}

export function BatchPassportHeader({
  batch,
  ageDays,
}: {
  batch: BatchPassportResponse["batch"]
  ageDays: number | null
}) {
  const status = batch.status ? statusLabels[batch.status] : null

  // Ищем русский label во frontend-справочнике по batchNumber
  const frontend = frontendBatches.find((b) => b.batchNumber === batch.batchNumber)
  const displayName = frontend?.label ?? batch.batchNumber

  return (
    <section className="dashboard-panel p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{displayName}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {batch.workshop ?? "—"} · {batch.house ?? "—"}
            {batch.zone ? ` · ${batch.zone}` : ""}
          </p>
        </div>
        {status && (
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Возраст</dt>
          <dd className="mt-1 font-medium">
            {ageDays !== null ? `${ageDays} дней` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Дата посадки</dt>
          <dd className="mt-1 font-medium">{formatDate(batch.placementDate)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Кросс</dt>
          <dd className="mt-1 font-medium">{batch.cross ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Происхождение</dt>
          <dd className="mt-1 font-medium">{batch.origin ?? "—"}</dd>
        </div>
      </dl>
    </section>
  )
}