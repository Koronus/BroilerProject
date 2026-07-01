"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  Droplets,
  ShieldAlert,
  Thermometer,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type BannerPriority = "critical" | "high" | "medium" | "low"

export interface BannerIncident {
  id: string
  location: string
  title: string
  priority: BannerPriority
  icon: LucideIcon
}

interface BackendIncident {
  id: string
  code?: string | null
  title: string
  house?: string | null
  status: string
  priority: string
  type?: string | null
}

interface NotificationBannerProps {
  onOpen: (incidentId: string) => void
}

const priorityMap: Record<string, BannerPriority> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
}

// Статус OPEN на бэкенде соответствует инциденту со статусом «Новый».
const NEW_INCIDENT_STATUS = "OPEN"

const typeIconMap: Record<string, LucideIcon> = {
  MICROCLIMATE: Thermometer,
  WATER_SUPPLY: Droplets,
  FLOCK_HEALTH: ShieldAlert,
  SANITATION: ShieldAlert,
  FEEDING: Wrench,
  PRODUCTION_METRICS: Wrench,
  OTHER: AlertTriangle,
}

const toneByPriority: Record<
  BannerPriority,
  { card: string; iconWrap: string; icon: string }
> = {
  critical: {
    card: "border-red-200 hover:border-red-300",
    iconWrap: "bg-red-100",
    icon: "text-red-600",
  },
  high: {
    card: "border-red-200 hover:border-red-300",
    iconWrap: "bg-red-100",
    icon: "text-red-600",
  },
  medium: {
    card: "border-amber-200 hover:border-amber-300",
    iconWrap: "bg-amber-100",
    icon: "text-amber-600",
  },
  low: {
    card: "border-zinc-200 hover:border-zinc-300",
    iconWrap: "bg-zinc-100",
    icon: "text-zinc-600",
  },
}

const incidentRefreshIntervalMs = 10_000

// Демо-карточки на случай недоступного бэкенда. id ссылаются на демо-инциденты
// INC-2 / INC-3 (статус «Новый»), чтобы клик открывал конкретный инцидент.
const fallbackIncidents: BannerIncident[] = [
  { id: "INC-2", location: "Птичник 2", title: "Рост падежа", priority: "high", icon: ShieldAlert },
  { id: "INC-3", location: "Птичник 1", title: "Снижение потребления воды", priority: "medium", icon: Droplets },
]

const toBannerIncident = (incident: BackendIncident): BannerIncident => ({
  // IncidentsPage выбирает инцидент по code ?? id — используем тот же идентификатор.
  id: incident.code ?? incident.id,
  location: incident.house?.trim() || "—",
  title: incident.title,
  priority: priorityMap[(incident.priority ?? "").toUpperCase()] ?? "medium",
  icon: typeIconMap[(incident.type ?? "").toUpperCase()] ?? AlertTriangle,
})

export function NotificationBanner({ onOpen }: NotificationBannerProps) {
  const [incidents, setIncidents] = useState<BannerIncident[]>(fallbackIncidents)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  useEffect(() => {
    let isCancelled = false
    let hasLoaded = false

    async function loadIncidents() {
      try {
        const response = await fetch("/api/incidents", { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`)
        }

        const data = (await response.json()) as BackendIncident[]
        const newIncidents = data
          .filter((incident) => (incident.status ?? "").toUpperCase() === NEW_INCIDENT_STATUS)
          .map(toBannerIncident)

        if (!isCancelled) {
          hasLoaded = true
          // Если новых инцидентов нет — оставляем демо-карточки, чтобы блок не пропадал.
          setIncidents(newIncidents.length > 0 ? newIncidents : fallbackIncidents)
        }
      } catch {
        if (!isCancelled && !hasLoaded) {
          setIncidents(fallbackIncidents)
        }
      }
    }

    void loadIncidents()
    const intervalId = window.setInterval(() => {
      void loadIncidents()
    }, incidentRefreshIntervalMs)

    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const dismissIncident = (id: string) => {
    setDismissedIds((current) => (current.includes(id) ? current : [...current, id]))
  }

  const visibleIncidents = incidents.filter((incident) => !dismissedIds.includes(incident.id))

  if (visibleIncidents.length === 0) {
    return null
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {visibleIncidents.map((incident) => {
        const Icon = incident.icon
        const tone = toneByPriority[incident.priority]

        return (
          <div
            key={incident.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(incident.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onOpen(incident.id)
              }
            }}
            className={cn(
              "group relative flex w-[280px] shrink-0 cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 pr-9 text-left shadow-sm outline-none transition-all duration-200",
              "hover:-translate-y-1 hover:shadow-[0_16px_36px_-18px_rgba(15,23,42,0.45)] focus-visible:ring-2 focus-visible:ring-zinc-900/30",
              tone.card,
            )}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tone.iconWrap)}>
              <Icon className={cn("size-4", tone.icon)} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{incident.location}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600">{incident.title}</p>
            </div>

            <ArrowUpRight className="pointer-events-none absolute bottom-3 right-3 size-4 translate-x-1 text-zinc-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />

            <button
              type="button"
              aria-label="Скрыть карточку"
              onClick={(event) => {
                event.stopPropagation()
                dismissIncident(incident.id)
              }}
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
