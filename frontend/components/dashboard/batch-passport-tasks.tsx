import type { BatchPassportResponse } from "@/lib/batch-passport"

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("ru-RU")
}

export function BatchPassportTasks({
  tasks,
}: {
  tasks: BatchPassportResponse["tasks"]
}) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-black/5 px-5 py-4">
        <h2 className="text-base font-semibold">Задачи ({tasks.length})</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500">По этой партии задач нет.</p>
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
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 font-medium">{task.nameTask}</td>
                  <td className="px-4 py-3 text-zinc-600">{task.responsible}</td>
                  <td className="px-4 py-3 text-zinc-600">{task.priority}</td>
                  <td className="px-4 py-3 text-zinc-600">{task.status ?? "—"}</td>
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