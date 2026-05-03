"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPlus,
  Clock3,
  Droplets,
  ExternalLink,
  PlayCircle,
  Search,
  ShieldAlert,
  Thermometer,
  TimerReset,
  UserRound,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type IncidentPriority = "critical" | "high" | "medium" | "low"
type IncidentStatus = "new" | "inProgress" | "overdue" | "closed"

interface BackendIncident {
  id: string
  code?: string | null
  title: string
  description?: string | null
  status: string
  priority: string
  source: string
  notificationId?: string | null
  responsible?: string | null
  decisionComment?: string | null
  createdAt?: string | null
  detectedAt?: string | null
  updatedAt?: string | null
  resolvedAt?: string | null
  closedAt?: string | null
}

interface Incident {
  id: string
  date: string
  time: string
  type: string
  icon: LucideIcon
  shortDescription: string
  description: string
  farm: string
  poultryHouse: string
  priority: IncidentPriority
  status: IncidentStatus
  responsible: string
  comment: string
}

const priorityConfig: Record<
  IncidentPriority,
  {
    label: string
    className: string
    rowClass: string
    iconClass: string
  }
> = {
  critical: {
    label: "Критический",
    className: "border-red-200 bg-red-50 text-red-700",
    rowClass: "border-l-red-500",
    iconClass: "text-red-600",
  },
  high: {
    label: "Высокий",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    rowClass: "border-l-amber-500",
    iconClass: "text-amber-600",
  },
  medium: {
    label: "Средний",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    rowClass: "border-l-sky-500",
    iconClass: "text-sky-600",
  },
  low: {
    label: "Низкий",
    className: "border-zinc-300 bg-zinc-100 text-zinc-700",
    rowClass: "border-l-zinc-400",
    iconClass: "text-zinc-600",
  },
}

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  new: {
    label: "Новый",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  inProgress: {
    label: "В работе",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  overdue: {
    label: "Просрочен",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  closed: {
    label: "Закрыт",
    className: "border-zinc-300 bg-zinc-100 text-zinc-700",
  },
}

const backendPriorityMap: Record<string, IncidentPriority> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
}

const backendStatusMap: Record<string, IncidentStatus> = {
  OPEN: "new",
  IN_PROGRESS: "inProgress",
  RESOLVED: "closed",
  CLOSED: "closed",
  CANCELLED: "closed",
}

const backendSourceLabelMap: Record<string, string> = {
  NOTIFICATION: "Уведомление",
  MANUAL: "Ручной",
  SYSTEM: "Система",
  ANALYTICS: "Аналитика",
}

const backendSourceIconMap: Record<string, LucideIcon> = {
  NOTIFICATION: AlertTriangle,
  MANUAL: UserRound,
  SYSTEM: Wrench,
  ANALYTICS: ShieldAlert,
}

const unknownValue = "—"

const normalizeBackendEnum = (value?: string | null) => value?.toUpperCase() ?? ""

const formatBackendDateTime = (value?: string | null) => {
  if (!value) {
    return { date: unknownValue, time: unknownValue }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return { date: unknownValue, time: unknownValue }
  }

  return {
    date: date.toLocaleDateString("ru-RU"),
    time: date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

const toIncident = (incident: BackendIncident): Incident => {
  const source = normalizeBackendEnum(incident.source)
  const { date, time } = formatBackendDateTime(incident.detectedAt ?? incident.createdAt)

  return {
    id: incident.code ?? incident.id,
    date,
    time,
    type: backendSourceLabelMap[source] ?? "Инцидент",
    icon: backendSourceIconMap[source] ?? AlertTriangle,
    shortDescription: incident.title,
    description: incident.description ?? "Описание не указано.",
    farm: unknownValue,
    poultryHouse: unknownValue,
    priority: backendPriorityMap[normalizeBackendEnum(incident.priority)] ?? "medium",
    status: backendStatusMap[normalizeBackendEnum(incident.status)] ?? "new",
    responsible: incident.responsible ?? "Не назначен",
    comment: incident.decisionComment ?? "Комментарий не указан.",
  }
}

const buildKpiItems = (incidents: Incident[]) => [
  {
    label: "Открытые",
    value: incidents
      .filter((incident) => incident.status !== "closed")
      .length.toString(),
    icon: Clock3,
    tone: "text-sky-600",
  },
  {
    label: "Критические",
    value: incidents
      .filter((incident) => incident.priority === "critical")
      .length.toString(),
    icon: AlertTriangle,
    tone: "text-red-600",
  },
  {
    label: "Просроченные",
    value: incidents
      .filter((incident) => incident.status === "overdue")
      .length.toString(),
    icon: TimerReset,
    tone: "text-amber-600",
  },
  {
    label: "Закрытые",
    value: incidents
      .filter((incident) => incident.status === "closed")
      .length.toString(),
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
]

const fallbackIncidents: Incident[] = [
  {
    id: "INC-1",
    date: "15.04.2026",
    time: "10:38",
    type: "Микроклимат",
    icon: Thermometer,
    shortDescription: "Перегрев зоны 3",
    description:
      "Температура в зоне посадки держалась выше нормы 18 минут. Требуется проверить вентиляцию и приток воздуха.",
    farm: "Цех 2",
    poultryHouse: "Птичник 4",
    priority: "critical",
    status: "inProgress",
    responsible: "Иванов",
    comment: "Смена открыла заслонки, ожидается повторный замер через 15 минут.",
  },
  {
    id: "INC-2",
    date: "15.04.2026",
    time: "10:21",
    type: "Падеж",
    icon: ShieldAlert,
    shortDescription: "Рост падежа",
    description:
      "Падеж превысил плановый уровень за последние 6 часов. Нужен ветеринарный осмотр и сверка журнала обходов.",
    farm: "Цех 1",
    poultryHouse: "Птичник 2",
    priority: "high",
    status: "new",
    responsible: "Ветеринарная служба",
    comment: "Инцидент создан по уведомлению системы учета стада.",
  },
  {
    id: "INC-3",
    date: "15.04.2026",
    time: "09:56",
    type: "Поение",
    icon: Droplets,
    shortDescription: "Снижение воды",
    description:
      "Потребление воды ниже ожидаемого уровня для партии. Возможна закупорка линии или падение давления.",
    farm: "Цех 3",
    poultryHouse: "Птичник 1",
    priority: "medium",
    status: "new",
    responsible: "Соколов",
    comment: "Проверить давление и доступность ниппелей.",
  },
  {
    id: "INC-4",
    date: "15.04.2026",
    time: "09:10",
    type: "Оборудование",
    icon: Wrench,
    shortDescription: "Сбой вентилятора",
    description:
      "Контроллер сообщил о нестабильной работе вентилятора. Риск ухудшения микроклимата при сохранении нагрузки.",
    farm: "Цех 2",
    poultryHouse: "Птичник 5",
    priority: "high",
    status: "closed",
    responsible: "Морозов",
    comment: "Вентилятор перезапущен, контрольный период прошел без повторов.",
  },
  {
    id: "INC-5",
    date: "14.04.2026",
    time: "18:12",
    type: "Воздух",
    icon: Wind,
    shortDescription: "Рост аммиака",
    description:
      "Аммиак приближался к верхней границе нормы. Требуется контроль подстилки и вентиляции.",
    farm: "Цех 2",
    poultryHouse: "Птичник 5",
    priority: "medium",
    status: "overdue",
    responsible: "Не назначен",
    comment: "Ответственный не назначен, срок первичной реакции истек.",
  },
]

function FieldSelect({
  label,
  options,
}: {
  label: string
  options: string[]
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      <select className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function IncidentDetails({ incident }: { incident: Incident }) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-zinc-200 bg-white rounded-br-[28px]" >
      <div className="border-b border-zinc-200 px-5 py-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Карточка инцидента
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{incident.id}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {incident.date}, {incident.time}
            </p>
          </div>
          <Badge className={priorityConfig[incident.priority].className}>
            {priorityConfig[incident.priority].label}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Тип</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{incident.type}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Статус</p>
            <Badge className={cn("mt-2", statusConfig[incident.status].className)}>
              {statusConfig[incident.status].label}
            </Badge>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-foreground">Описание</h3>
          <p className="text-sm leading-6 text-zinc-700">{incident.description}</p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Где произошло
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900">
              {incident.farm} / {incident.poultryHouse}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Ответственный
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-900">
              <UserRound className="size-4 text-zinc-500" />
              {incident.responsible}
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-foreground">Комментарий</h3>
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
            {incident.comment}
          </p>
        </section>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-5 py-4">
        <Button
          variant="outline"
          className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
        >
          <PlayCircle className="size-4" />
          Взять в работу
        </Button>
        <Button
          variant="outline"
          className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
        >
          <CheckCircle2 className="size-4" />
          Закрыть
        </Button>
        <Button className="bg-zinc-950 text-white hover:bg-zinc-800">
          <ExternalLink className="size-4" />
          Открыть подробнее
        </Button>
      </div>
    </aside>
  )
}

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(fallbackIncidents)
  const [activeIncidentId, setActiveIncidentId] = useState(fallbackIncidents[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadIncidents() {
      setIsLoading(true)

      try {
        const response = await fetch("/api/incidents", { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`)
        }

        const data = (await response.json()) as BackendIncident[]
        const nextIncidents = data.map(toIncident)

        if (!isCancelled) {
          setIncidents(nextIncidents)
          setActiveIncidentId(nextIncidents[0]?.id ?? "")
          setLoadError(null)
        }
      } catch {
        if (!isCancelled) {
          setIncidents(fallbackIncidents)
          setActiveIncidentId(fallbackIncidents[0].id)
          setLoadError("Бэкенд недоступен, показаны тестовые инциденты")
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadIncidents()

    return () => {
      isCancelled = true
    }
  }, [])

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return incidents
    }

    return incidents.filter((incident) =>
      [
        incident.id,
        incident.type,
        incident.shortDescription,
        incident.description,
        incident.farm,
        incident.poultryHouse,
        incident.responsible,
      ]
        .join(" ")
        .toLowerCase()
          .includes(query),
    )
  }, [incidents, searchQuery])

  const activeIncident =
    filteredIncidents.find((incident) => incident.id === activeIncidentId) ??
    filteredIncidents[0] ??
    null

  const kpiItems = useMemo(() => buildKpiItems(incidents), [incidents])

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background rounded-[28px] ">
      <div className="border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Реестр инцидентов
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Контроль отклонений, ответственных и статусов выполнения
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              {isLoading && <span>Загрузка из бэкенда...</span>}
              {loadError && <span className="text-amber-600">{loadError}</span>}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <div className="relative w-full sm:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по инцидентам"
                className="h-10 border-zinc-300 bg-white pl-9 text-zinc-900 placeholder:text-zinc-500"
              />
            </div>
            <Button className="bg-red-600 text-white hover:bg-red-700">
              <ClipboardPlus className="size-4" />
              Создать инцидент
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-3 border-b border-zinc-200 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {item.label}
                </p>
                <Icon className={cn("size-4", item.tone)} />
              </div>
              <p className={cn("mt-2 text-3xl font-bold", item.tone)}>
                {item.value}
              </p>
            </div>
          )
        })}
      </section>

      <section className="border-b border-zinc-200 px-6 py-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FieldSelect
            label="Период"
            options={["Последние 24 часа", "Сегодня", "7 дней", "Месяц"]}
          />
          <FieldSelect
            label="Тип"
            options={["Все типы", "Микроклимат", "Падеж", "Поение", "Оборудование"]}
          />
          <FieldSelect
            label="Птичник"
            options={["Все птичники", "Птичник 1", "Птичник 2", "Птичник 4", "Птичник 5"]}
          />
          <FieldSelect
            label="Статус"
            options={["Все статусы", "Новый", "В работе", "Просрочен", "Закрыт"]}
          />
          <FieldSelect
            label="Приоритет"
            options={["Любой", "Критический", "Высокий", "Средний", "Низкий"]}
          />
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] ">
        <section className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
              Таблица инцидентов
            </h2>
            <span className="text-sm text-zinc-500">
              Найдено: {filteredIncidents.length}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">№</th>
                    <th className="px-4 py-3 font-medium">Дата</th>
                    <th className="px-4 py-3 font-medium">Тип</th>
                    <th className="px-4 py-3 font-medium">Краткое описание</th>
                    <th className="px-4 py-3 font-medium">Цех / птичник</th>
                    <th className="px-4 py-3 font-medium">Приоритет</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Ответственный</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-500">
                        Инцидентов пока нет.
                      </td>
                    </tr>
                  ) : filteredIncidents.map((incident) => {
                    const Icon = incident.icon
                    const isActive = incident.id === activeIncident?.id

                    return (
                      <tr
                        key={incident.id}
                        tabIndex={0}
                        onClick={() => setActiveIncidentId(incident.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            setActiveIncidentId(incident.id)
                          }
                        }}
                        className={cn(
                          "cursor-pointer border-l-4 transition-colors outline-none",
                          priorityConfig[incident.priority].rowClass,
                          isActive ? "bg-zinc-100" : "hover:bg-zinc-50",
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          {incident.id}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {incident.date} {incident.time}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-zinc-800">
                            <Icon
                              className={cn(
                                "size-4",
                                priorityConfig[incident.priority].iconClass,
                              )}
                            />
                            {incident.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {incident.shortDescription}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {incident.farm} / {incident.poultryHouse}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={priorityConfig[incident.priority].className}>
                            {priorityConfig[incident.priority].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig[incident.status].className}>
                            {statusConfig[incident.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {incident.responsible}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 lg:hidden">
            {activeIncident ? (
              <IncidentDetails incident={activeIncident} />
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
                Инцидентов пока нет.
              </div>
            )}
          </div>
        </section>

        <div className="hidden min-h-0 lg:block">
          {activeIncident ? (
            <IncidentDetails incident={activeIncident} />
          ) : (
            <aside className="flex h-full items-center justify-center border-l border-zinc-200 bg-white p-5 text-sm text-zinc-500 rounded-br-[28px]">
              Инцидентов пока нет.
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}
