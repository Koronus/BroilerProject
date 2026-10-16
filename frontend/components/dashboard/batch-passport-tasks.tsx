"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { BatchPassportResponse } from "@/lib/batch-passport"
import { formatDate, noData } from "@/lib/batch-passport-display"
import { priorityLabels, taskStatusLabels } from "@/lib/batch-labels"

export function BatchPassportTasks({
  tasks,
}: {
  tasks: BatchPassportResponse["tasks"]
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleTasks = expanded ? tasks : tasks.slice(0, 5)

  return (
    <section className="overflow-hidden border-b border-black/5 dark:border-white/8">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <h2 className="text-base font-semibold">Задачи ({tasks.length})</h2>
        {tasks.length > 5 && (
          <Button variant="outline" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {expanded ? "Свернуть" : `Больше (${tasks.length - 5})`}
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500">{noData}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Задача</th>
                <th className="px-4 py-3 text-left font-medium">Ответственный</th>
                <th className="px-4 py-3 text-left font-medium">Приоритет</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-right font-medium">Срок</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visibleTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 font-medium">{task.nameTask || noData}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{task.responsible || noData}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{priorityLabels[task.priority] ?? task.priority ?? noData}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{taskStatusLabels[task.status ?? ""] ?? task.status ?? noData}</td>
                  <td className="px-4 py-3 text-right text-zinc-600">
                    {formatDate(task.termTask)}
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
