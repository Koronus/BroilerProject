"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { BatchPassportResponse } from "@/lib/batch-passport"
import { formatDateTime, noData } from "@/lib/batch-passport-display"
import { notificationStatusLabels, priorityLabels } from "@/lib/batch-labels"

export function BatchPassportNotifications({
  notifications,
}: {
  notifications: BatchPassportResponse["notifications"]
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleNotifications = expanded ? notifications : notifications.slice(0, 5)

  return (
    <section className="overflow-hidden border-b border-black/5 dark:border-white/8">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <h2 className="text-base font-semibold">Уведомления ({notifications.length})</h2>
        {notifications.length > 5 && (
          <Button variant="outline" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {expanded ? "Свернуть" : `Больше (${notifications.length - 5})`}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500">{noData}</p>
      ) : (
        <ul className="divide-y divide-black/5">
          {visibleNotifications.map((notification) => (
            <li
              key={notification.id}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{notification.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {notification.code || noData} · {priorityLabels[notification.priority ?? ""] ?? notification.priority ?? noData} · {notificationStatusLabels[notification.status ?? ""] ?? notification.status ?? noData}
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
