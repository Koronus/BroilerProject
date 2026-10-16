"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { BatchPassportResponse } from "@/lib/batch-passport"
import { noData } from "@/lib/batch-passport-display"
import {
  incidentTypeLabels,
  priorityLabels,
  incidentStatusLabels,
} from "@/lib/batch-labels"

export function BatchPassportIncidents({
  incidents,
  onOpenIncident,
}: {
  incidents: BatchPassportResponse["incidents"]
  onOpenIncident?: (incidentId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleIncidents = expanded ? incidents : incidents.slice(0, 5)

  return (
    <section className="overflow-hidden border-b border-black/5 dark:border-white/8">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <h2 className="text-base font-semibold">Инциденты ({incidents.length})</h2>
        {incidents.length > 5 && (
          <Button variant="outline" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {expanded ? "Свернуть" : `Больше (${incidents.length - 5})`}
          </Button>
        )}
      </div>

      {incidents.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500">{noData}</p>
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
                <th className="px-4 py-3 text-right font-medium"><span className="sr-only">Открыть</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visibleIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="px-4 py-3 font-medium">{incident.code || noData}</td>
                  <td className="px-4 py-3">{incident.title || noData}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {incidentTypeLabels[incident.type ?? ""] ?? incident.type ?? noData}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {priorityLabels[incident.priority ?? ""] ?? incident.priority ?? noData}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {incidentStatusLabels[incident.status ?? ""] ?? incident.status ?? noData}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600">
                    {incident.reactionMinutes !== null ? `${incident.reactionMinutes} мин` : noData}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onOpenIncident ? (
                      <button type="button" onClick={() => onOpenIncident(incident.id)} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"><ExternalLink className="size-3.5" />Открыть</button>
                    ) : <span className="text-xs text-zinc-400">{noData}</span>}
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
