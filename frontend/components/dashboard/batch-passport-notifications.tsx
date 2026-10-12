import type { BatchPassportResponse } from "@/lib/batch-passport"

function formatDateTime(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
}

export function BatchPassportNotifications({
  notifications,
}: {
  notifications: BatchPassportResponse["notifications"]
}) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-black/5 px-5 py-4">
        <h2 className="text-base font-semibold">Уведомления ({notifications.length})</h2>
      </div>

      {notifications.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500">По этой партии уведомлений нет.</p>
      ) : (
        <ul className="divide-y divide-black/5">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{notification.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {notification.code} · {notification.priority ?? "—"} · {notification.status ?? "—"}
                </p>
              </div>
              <span className="text-xs text-zinc-500">
                {formatDateTime(notification.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}