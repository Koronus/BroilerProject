import type { BatchPassportResponse } from "@/lib/batch-passport"
import {
  incidentTypeLabels,
  priorityLabels,
  incidentStatusLabels,
} from "@/lib/batch-labels"

export function BatchPassportIncidents({
  incidents,
}: {
  incidents: BatchPassportResponse["incidents"]
}) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-black/5 px-5 py-4">
        <h2 className="text-base font-semibold">Инциденты ({incidents.length})</h2>
      </div>

      {incidents.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500">По этой партии инцидентов нет.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Код</th>
                <th className="px-4 py-3 text-left font-medium">Название</th>
                <th className="px-4 py-3 text-left font-medium">Тип</th>
                <th className="px-4 py-3 text-left font-medium">Приоритет</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-right font-medium">Реакция</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="px-4 py-3 font-medium">{incident.code}</td>
                  <td className="px-4 py-3">{incident.title}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {incidentTypeLabels[incident.type ?? ""] ?? incident.type ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {priorityLabels[incident.priority ?? ""] ?? incident.priority ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {incidentStatusLabels[incident.status ?? ""] ?? incident.status ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600">
                    {incident.reactionMinutes !== null ? `${incident.reactionMinutes} мин` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}