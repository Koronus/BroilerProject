"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type IncidentPriority = "critical" | "high" | "medium" | "low"
type IncidentStatus = "new" | "inProgress" | "overdue" | "closed"
type IncidentType =
  | "microclimate"
  | "sanitation"
  | "flockHealth"
  | "feeding"
  | "waterSupply"
  | "productionMetrics"
  | "other"

interface SelectOption {
  value: string
  label: string
}

interface IncidentFormState {
  type: IncidentType
  workshop: string
  house: string
  zone: string
  priority: IncidentPriority
  description: string
  responsible: string
}

interface BackendIncident {
  id: string
  code?: string | null
  title: string
  description?: string | null
  type?: string | null
  workshop?: string | null
  house?: string | null
  zone?: string | null
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
  zone: string
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

const backendIncidentTypeLabelMap: Record<string, string> = {
  MICROCLIMATE: "Микроклимат",
  SANITATION: "Санитария",
  FLOCK_HEALTH: "Падеж и состояние стада",
  FEEDING: "Кормление",
  WATER_SUPPLY: "Водоснабжение",
  PRODUCTION_METRICS: "Производственные показатели",
  OTHER: "Прочее",
}

const backendIncidentTypeIconMap: Record<string, LucideIcon> = {
  MICROCLIMATE: Thermometer,
  SANITATION: ShieldAlert,
  FLOCK_HEALTH: ShieldAlert,
  FEEDING: Wrench,
  WATER_SUPPLY: Droplets,
  PRODUCTION_METRICS: Wrench,
  OTHER: AlertTriangle,
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

const incidentTypeOptions: SelectOption[] = [
  { value: "microclimate", label: "Микроклимат" },
  { value: "sanitation", label: "Санитария" },
  { value: "flockHealth", label: "Падеж и состояние стада" },
  { value: "feeding", label: "Кормление" },
  { value: "waterSupply", label: "Водоснабжение" },
  { value: "productionMetrics", label: "Производственные показатели" },
  { value: "other", label: "Прочее" },
]

const workshopOptions = ["Цех 1", "Цех 2", "Цех 3"]
const houseOptions = ["Птичник 1", "Птичник 2", "Птичник 3"]
const zoneOptions = ["Линия поения 1", "Линия поения 2"]

const responsibleOptions = [
  "Главный ветеринарный врач",
  "Главный зоотехник",
  "Главный инженер",
  "Директор по качеству",
  "Системный администратор",
  "Руководитель комплекса",
  "Служба безопасности",
  "Оператор цеха (птичница)",
]

const emptyIncidentForm: IncidentFormState = {
  type: "microclimate",
  workshop: workshopOptions[0],
  house: houseOptions[0],
  zone: zoneOptions[0],
  priority: "medium",
  description: "",
  responsible: responsibleOptions[0],
}

const incidentTypeMap: Record<IncidentType, string> = {
  microclimate: "MICROCLIMATE",
  sanitation: "SANITATION",
  flockHealth: "FLOCK_HEALTH",
  feeding: "FEEDING",
  waterSupply: "WATER_SUPPLY",
  productionMetrics: "PRODUCTION_METRICS",
  other: "OTHER",
}

const incidentPriorityMap: Record<IncidentPriority, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
}

const unknownValue = "—"
const incidentRefreshIntervalMs = 10_000

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

const parseIncidentDateTime = (dateLabel: string, timeLabel: string) => {
  const [day, month, year] = dateLabel.split(".").map(Number)
  const [hour = 0, minute = 0] = timeLabel.split(":").map(Number)

  if (!day || !month || !year) {
    return undefined
  }

  const date = new Date(year, month - 1, day, hour, minute)

  return Number.isNaN(date.getTime()) ? undefined : date.getTime()
}

const getIncidentTimestamp = (incident: Incident) =>
  parseIncidentDateTime(incident.date, incident.time)

const sortIncidents = (incidents: Incident[]) =>
  [...incidents].sort(
    (a, b) => (getIncidentTimestamp(b) ?? 0) - (getIncidentTimestamp(a) ?? 0),
  )

const toIncident = (incident: BackendIncident): Incident => {
  const source = normalizeBackendEnum(incident.source)
  const type = normalizeBackendEnum(incident.type)
  const hasSpecificType = Boolean(type && type !== "OTHER")
  const { date, time } = formatBackendDateTime(incident.detectedAt ?? incident.createdAt)

  return {
    id: incident.code ?? incident.id,
    date,
    time,
    type: hasSpecificType
      ? backendIncidentTypeLabelMap[type] ?? "Инцидент"
      : source === "MANUAL"
        ? backendIncidentTypeLabelMap[type] ?? "Прочее"
        : backendSourceLabelMap[source] ?? backendIncidentTypeLabelMap[type] ?? "Инцидент",
    icon: hasSpecificType
      ? backendIncidentTypeIconMap[type] ?? AlertTriangle
      : source === "MANUAL"
        ? backendIncidentTypeIconMap[type] ?? AlertTriangle
        : backendSourceIconMap[source] ?? backendIncidentTypeIconMap[type] ?? AlertTriangle,
    shortDescription: incident.title,
    description: incident.description ?? "Описание не указано.",
    farm: incident.workshop ?? unknownValue,
    poultryHouse: incident.house ?? unknownValue,
    zone: incident.zone ?? unknownValue,
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
    zone: "Зона 3",
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
    zone: "Сектор осмотра",
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
    zone: "Линия поения 1",
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
    zone: "Вентиляционный блок",
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
    zone: "Воздушная зона",
    priority: "medium",
    status: "overdue",
    responsible: "Не назначен",
    comment: "Ответственный не назначен, срок первичной реакции истек.",
  },
]

const initialIncidents = sortIncidents(fallbackIncidents)

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
              {[incident.farm, incident.poultryHouse, incident.zone]
                .filter((value) => value && value !== unknownValue)
                .join(" / ") || unknownValue}
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
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [activeIncidentId, setActiveIncidentId] = useState(initialIncidents[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>(emptyIncidentForm)
  const [isCreatingIncident, setIsCreatingIncident] = useState(false)
  const [createIncidentError, setCreateIncidentError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    let hasCompletedInitialLoad = false

    async function loadIncidents() {
      if (!hasCompletedInitialLoad) {
        setIsLoading(true)
      }

      try {
        const response = await fetch("/api/incidents", { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`)
        }

        const data = (await response.json()) as BackendIncident[]
        const nextIncidents = sortIncidents(data.map(toIncident))

        if (!isCancelled) {
          hasCompletedInitialLoad = true
          setIncidents(nextIncidents)
          setActiveIncidentId((currentId) =>
            nextIncidents.some((incident) => incident.id === currentId)
              ? currentId
              : nextIncidents[0]?.id ?? "",
          )
          setLoadError(null)
        }
      } catch {
        if (!isCancelled) {
          if (!hasCompletedInitialLoad) {
            setIncidents(initialIncidents)
            setActiveIncidentId((currentId) =>
              initialIncidents.some((incident) => incident.id === currentId)
                ? currentId
                : initialIncidents[0]?.id ?? "",
            )
          }

          setLoadError(
            hasCompletedInitialLoad
              ? "Не удалось обновить инциденты"
              : "Бэкенд недоступен, показаны тестовые инциденты",
          )
          hasCompletedInitialLoad = true
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
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
        incident.zone,
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

  const openCreateIncidentDialog = () => {
    setIncidentForm(emptyIncidentForm)
    setCreateIncidentError(null)
    setIsCreateDialogOpen(true)
  }

  const closeCreateIncidentDialog = () => {
    setIsCreateDialogOpen(false)
    setCreateIncidentError(null)
    setIncidentForm(emptyIncidentForm)
  }

  const updateIncidentForm = <Key extends keyof IncidentFormState>(
    key: Key,
    value: IncidentFormState[Key],
  ) => {
    setIncidentForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }))
  }

  const handleCreateIncident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isCreatingIncident) {
      return
    }

    setIsCreatingIncident(true)
    setCreateIncidentError(null)

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: incidentTypeMap[incidentForm.type],
          workshop: incidentForm.workshop,
          house: incidentForm.house,
          zone: incidentForm.zone,
          priority: incidentPriorityMap[incidentForm.priority],
          description: incidentForm.description.trim(),
          responsible: incidentForm.responsible.trim() || null,
        }),
      })
      const responseBody = await response.text()

      if (!response.ok) {
        throw new Error(responseBody || "Не удалось создать инцидент")
      }

      const createdIncident = JSON.parse(responseBody) as BackendIncident
      const nextIncident = toIncident(createdIncident)

      setIncidents((currentIncidents) => [nextIncident, ...currentIncidents])
      setActiveIncidentId(nextIncident.id)
      setLoadError(null)
      closeCreateIncidentDialog()
    } catch (error) {
      setCreateIncidentError(
        error instanceof Error ? error.message : "Не удалось создать инцидент",
      )
    } finally {
      setIsCreatingIncident(false)
    }
  }

  return (
    <>
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
            <Button
              type="button"
              onClick={openCreateIncidentDialog}
              className="bg-red-600 text-white hover:bg-red-700"
            >
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
                    <th className="px-4 py-3 font-medium">Цех / птичник / зона</th>
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
                          {[incident.farm, incident.poultryHouse, incident.zone]
                            .filter((value) => value && value !== unknownValue)
                            .join(" / ") || unknownValue}
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

    <Dialog
      open={isCreateDialogOpen}
      onOpenChange={(open) => {
        if (!open && !isCreatingIncident) {
          closeCreateIncidentDialog()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-[min(760px,calc(100%-2rem))] overflow-y-auto p-0">
        <div className="border-b border-zinc-200 px-6 py-5 pr-12">
          <DialogTitle className="text-base font-semibold text-foreground">
            Создать инцидент
          </DialogTitle>
          <p className="mt-2 text-sm text-zinc-500">
            Заполните категорию, место возникновения и ответственного.
          </p>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleCreateIncident}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Тип
              </span>
              <select
                required
                value={incidentForm.type}
                onChange={(event) =>
                  updateIncidentForm("type", event.target.value as IncidentType)
                }
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
              >
                {incidentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Приоритет
              </span>
              <select
                required
                value={incidentForm.priority}
                onChange={(event) =>
                  updateIncidentForm("priority", event.target.value as IncidentPriority)
                }
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
              >
                {Object.entries(priorityConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Цех
              </span>
              <select
                required
                value={incidentForm.workshop}
                onChange={(event) => updateIncidentForm("workshop", event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
              >
                {workshopOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Птичник
              </span>
              <select
                required
                value={incidentForm.house}
                onChange={(event) => updateIncidentForm("house", event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
              >
                {houseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Зона
              </span>
              <select
                required
                value={incidentForm.zone}
                onChange={(event) => updateIncidentForm("zone", event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
              >
                {zoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Описание
            </span>
            <Textarea
              required
              value={incidentForm.description}
              onChange={(event) => updateIncidentForm("description", event.target.value)}
              className="min-h-28 border-zinc-300 bg-white text-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Ответственный
            </span>
            <select
              required
              value={incidentForm.responsible}
              onChange={(event) => updateIncidentForm("responsible", event.target.value)}
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
            >
              {responsibleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {createIncidentError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {createIncidentError}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isCreatingIncident}
              onClick={closeCreateIncidentDialog}
              className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isCreatingIncident}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <ClipboardPlus className="size-4" />
              {isCreatingIncident ? "Создание..." : "Создать инцидент"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
