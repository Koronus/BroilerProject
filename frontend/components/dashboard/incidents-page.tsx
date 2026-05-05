"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPlus,
  Clock3,
  Droplets,
  ExternalLink,
  Download,
  Link2,
  PlayCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  Thermometer,
  TimerReset,
  ChevronDown,
  ChevronRight,
  UserRound,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
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
  responsible?: string | null
  decisionComment?: string | null
  createdAt?: string | null
  detectedAt?: string | null
}

interface Incident {
  id: string
  date: string
  time: string
  type: string
  icon: LucideIcon
  shortDescription: string
  description: string
  workshop: string
  poultryHouse: string
  zone: string
  priority: IncidentPriority
  status: IncidentStatus
  responsible: string
  comment: string
  closedAt?: string
}

const priorityConfig: Record<IncidentPriority, { label: string; className: string; rowClass: string; iconClass: string }> = {
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
  new: { label: "Новый", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  inProgress: { label: "В работе", className: "border-sky-200 bg-sky-50 text-sky-700" },
  overdue: { label: "Просрочен", className: "border-red-200 bg-red-50 text-red-700" },
  closed: { label: "Закрыт", className: "border-zinc-300 bg-zinc-100 text-zinc-700" },
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
    time: date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  }
}

const resolveLocation = (code?: string | null) => {
  if (code === "INC-1") return { workshop: "Цех 2", poultryHouse: "Птичник 4", zone: "Зона посадки" }
  if (code === "INC-2") return { workshop: "Цех 1", poultryHouse: "Птичник 2", zone: "Основной зал" }
  if (code === "INC-3") return { workshop: "Цех 3", poultryHouse: "Птичник 1", zone: "Линия поения 2" }
  if (code === "INC-4") return { workshop: "Цех 2", poultryHouse: "Птичник 5", zone: "Модуль вентиляции" }
  if (code === "INC-5") return { workshop: "Цех 2", poultryHouse: "Птичник 5", zone: "Зона подстилки" }

  return { workshop: unknownValue, poultryHouse: unknownValue, zone: unknownValue }
}

const toIncident = (incident: BackendIncident): Incident => {
  const source = normalizeBackendEnum(incident.source)
  const { date, time } = formatBackendDateTime(incident.detectedAt ?? incident.createdAt)
  const id = incident.code ?? incident.id
  const location = resolveLocation(id)

  return {
    id,
    date,
    time,
    type: backendSourceLabelMap[source] ?? "Инцидент",
    icon: backendSourceIconMap[source] ?? AlertTriangle,
    shortDescription: incident.title,
    description: incident.description ?? "Описание не указано.",
    workshop: location.workshop,
    poultryHouse: location.poultryHouse,
    zone: location.zone,
    priority: backendPriorityMap[normalizeBackendEnum(incident.priority)] ?? "medium",
    status: backendStatusMap[normalizeBackendEnum(incident.status)] ?? "new",
    responsible: incident.responsible ?? "Не назначен",
    comment: incident.decisionComment ?? "Комментарий не указан.",
  }
}

const buildKpiItems = (incidents: Incident[]) => [
  { label: "Открытые", value: incidents.filter((i) => i.status !== "closed").length.toString(), icon: Clock3, tone: "text-sky-600" },
  { label: "Критические", value: incidents.filter((i) => i.priority === "critical").length.toString(), icon: AlertTriangle, tone: "text-red-600" },
  { label: "Просроченные", value: incidents.filter((i) => i.status === "overdue").length.toString(), icon: TimerReset, tone: "text-amber-600" },
  { label: "Закрытые", value: incidents.filter((i) => i.status === "closed").length.toString(), icon: CheckCircle2, tone: "text-emerald-600" },
]

const fallbackIncidents: Incident[] = [
  {
    id: "INC-1",
    date: "15.04.2026",
    time: "10:38",
    type: "Микроклимат",
    icon: Thermometer,
    shortDescription: "Критический перегрев зоны посадки",
    description: "Температура в зоне посадки держалась выше нормы 18 минут.",
    workshop: "Цех 2",
    poultryHouse: "Птичник 4",
    zone: "Зона посадки",
    priority: "critical",
    status: "inProgress",
    responsible: "Иванов",
    comment: "Смена открыла заслонки.",
  },
  {
    id: "INC-2",
    date: "15.04.2026",
    time: "10:21",
    type: "Падеж",
    icon: ShieldAlert,
    shortDescription: "Рост падежа",
    description: "Падеж превысил плановый уровень за последние 6 часов.",
    workshop: "Цех 1",
    poultryHouse: "Птичник 2",
    zone: "Основной зал",
    priority: "high",
    status: "new",
    responsible: "Ветеринарная служба",
    comment: "Инцидент создан по уведомлению системы.",
  },
  {
    id: "INC-3",
    date: "15.04.2026",
    time: "09:56",
    type: "Поение",
    icon: Droplets,
    shortDescription: "Снижение потребления воды",
    description: "Потребление воды ниже ожидаемого уровня для партии.",
    workshop: "Цех 3",
    poultryHouse: "Птичник 1",
    zone: "Линия поения 2",
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
    description: "Контроллер сообщил о нестабильной работе вентилятора.",
    workshop: "Цех 2",
    poultryHouse: "Птичник 5",
    zone: "Модуль вентиляции",
    priority: "high",
    status: "closed",
    responsible: "Морозов",
    comment: "Вентилятор перезапущен, контрольный период пройден.",
    closedAt: "15.04.2026, 09:40",
  },
  {
    id: "INC-5",
    date: "14.04.2026",
    time: "18:12",
    type: "Воздух",
    icon: Wind,
    shortDescription: "Рост аммиака",
    description: "Аммиак приближается к верхней границе нормы.",
    workshop: "Цех 2",
    poultryHouse: "Птичник 5",
    zone: "Зона подстилки",
    priority: "medium",
    status: "overdue",
    responsible: "Не назначен",
    comment: "Срок первичной реакции истек.",
  },
]

function FieldSelect({ label, options, value, onValueChange }: { label: string; options: string[]; value: string; onValueChange: (value: string) => void }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onValueChange(event.target.value)} className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function IncidentDetails({
  incident,
  onOpenDetails,
  onCloseIncident,
  onReopenIncident,
  onDownloadReport,
  onCreateRelated,
}: {
  incident: Incident
  onOpenDetails: (id: string) => void
  onCloseIncident: (id: string) => void
  onReopenIncident: (id: string) => void
  onDownloadReport: (id: string) => void
  onCreateRelated: (id: string) => void
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col rounded-br-[28px] border-l border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Карточка инцидента</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{incident.id}</h2>
            <p className="mt-1 text-sm text-zinc-500">{incident.date}, {incident.time}</p>
          </div>
          <Badge className={priorityConfig[incident.priority].className}>{priorityConfig[incident.priority].label}</Badge>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <section>
          <h3 className="mb-2 text-sm font-medium text-foreground">Описание</h3>
          <p className="text-sm leading-6 text-zinc-700">{incident.description}</p>
        </section>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Цех</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{incident.workshop}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Птичник</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{incident.poultryHouse}</p>
          </div>
        </section>
        {incident.status === "closed" && (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-medium">Статус: Закрыт{incident.closedAt ? ` (${incident.closedAt})` : ""}</p>
          </section>
        )}
        <section>
          <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
            {incident.status === "closed" ? "Итог / решение" : "Комментарий"}
          </p>
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {incident.comment}
          </p>
        </section>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-5 py-4">
        {incident.status !== "closed" ? (
          <>
            <Button variant="outline" className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950">
              <PlayCircle className="size-4" />Взять в работу
            </Button>
            <Button
              variant="outline"
              className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
              onClick={() => onCloseIncident(incident.id)}
            >
              <CheckCircle2 className="size-4" />Закрыть
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
              onClick={() => onReopenIncident(incident.id)}
            >
              <RefreshCcw className="size-4" />Переоткрыть
            </Button>
            <Button variant="outline" className="border-zinc-300 bg-white" onClick={() => onDownloadReport(incident.id)}>
              <Download className="size-4" />Скачать отчет
            </Button>
            <Button variant="outline" className="border-zinc-300 bg-white" onClick={() => onCreateRelated(incident.id)}>
              <Link2 className="size-4" />Создать связанный
            </Button>
          </>
        )}
        <Button className="bg-zinc-950 text-white hover:bg-zinc-800" onClick={() => onOpenDetails(incident.id)}>
          <ExternalLink className="size-4" />Открыть подробнее
        </Button>
      </div>
    </aside>
  )
}

const categoryOptions = [
  "Нарушение биобезопасности",
  "Поломка оборудования",
  "Качество кормов",
  "Прочее",
]

const workshopOptions = ["Цех 1", "Цех 2", "Цех 3"]

const housesByWorkshop: Record<string, string[]> = {
  "Цех 1": ["Птичник 1", "Птичник 2"],
  "Цех 2": ["Птичник 4", "Птичник 5"],
  "Цех 3": ["Птичник 1", "Птичник 3"],
}

const zonesByHouse: Record<string, string[]> = {
  "Птичник 1": ["Линия поения 1", "Линия поения 2"],
  "Птичник 2": ["Склад подстилки", "Основной зал"],
  "Птичник 3": ["Зона кормления", "Площадка контроля"],
  "Птичник 4": ["Зона посадки", "Зона вентиляции"],
  "Птичник 5": ["Модуль вентиляции", "Зона подстилки"],
}

const responsibleByCategory: Record<string, string[]> = {
  "Нарушение биобезопасности": ["Ветврач", "Служба дератизации"],
  "Поломка оборудования": ["Главный инженер", "Дежурный механик"],
  "Качество кормов": ["Зоотехник", "Лаборатория кормов"],
  "Прочее": ["Старший смены"],
}

export function IncidentsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>(fallbackIncidents)
  const [activeIncidentId, setActiveIncidentId] = useState(fallbackIncidents[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("Все типы")
  const [houseFilter, setHouseFilter] = useState("Все птичники")
  const [statusFilter, setStatusFilter] = useState("Все статусы")
  const [priorityFilter, setPriorityFilter] = useState("Любой")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isClosedExpanded, setIsClosedExpanded] = useState(false)
  const [createSuccessMessage, setCreateSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState(categoryOptions[0])
  const [newWorkshop, setNewWorkshop] = useState(workshopOptions[0])
  const [newHouse, setNewHouse] = useState(housesByWorkshop[workshopOptions[0]][0])
  const [newZone, setNewZone] = useState(zonesByHouse[housesByWorkshop[workshopOptions[0]][0]][0])
  const [newPriority, setNewPriority] = useState("Высокий")
  const [newDescription, setNewDescription] = useState("")
  const [newResponsible, setNewResponsible] = useState<string[]>(responsibleByCategory[categoryOptions[0]])

  useEffect(() => {
    let isCancelled = false

    async function loadIncidents() {
      setIsLoading(true)

      try {
        const response = await fetch("/api/incidents", { cache: "no-store" })
        if (!response.ok) throw new Error(`Backend returned ${response.status}`)

        const data = (await response.json()) as BackendIncident[]
        const nextIncidents = data.map(toIncident)

        if (!isCancelled) {
          setIncidents(nextIncidents.length > 0 ? nextIncidents : fallbackIncidents)
          setActiveIncidentId((nextIncidents[0] ?? fallbackIncidents[0]).id)
          setLoadError(null)
        }
      } catch {
        if (!isCancelled) {
          setIncidents(fallbackIncidents)
          setActiveIncidentId(fallbackIncidents[0].id)
          setLoadError("Бэкенд недоступен, показаны тестовые инциденты")
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadIncidents()

    return () => {
      isCancelled = true
    }
  }, [])

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return incidents.filter((incident) => {
      const matchesSearch = !query || incident.id.toLowerCase().includes(query)
      const matchesType = typeFilter === "Все типы" || incident.type === typeFilter
      const matchesHouse = houseFilter === "Все птичники" || incident.poultryHouse === houseFilter
      const matchesStatus = statusFilter === "Все статусы" || statusConfig[incident.status].label === statusFilter
      const matchesPriority = priorityFilter === "Любой" || priorityConfig[incident.priority].label === priorityFilter
      return matchesSearch && matchesType && matchesHouse && matchesStatus && matchesPriority
    })
  }, [incidents, searchQuery, typeFilter, houseFilter, statusFilter, priorityFilter])

  const activeFilteredIncidents = filteredIncidents.filter((incident) => incident.status !== "closed")
  const closedFilteredIncidents = filteredIncidents.filter((incident) => incident.status === "closed")

  const activeIncident = filteredIncidents.find((incident) => incident.id === activeIncidentId) ?? filteredIncidents[0] ?? null

  const kpiItems = useMemo(() => buildKpiItems(incidents), [incidents])

  const typeOptions = useMemo(() => ["Все типы", ...Array.from(new Set(incidents.map((i) => i.type)))], [incidents])
  const houseOptions = useMemo(() => ["Все птичники", ...Array.from(new Set(incidents.map((i) => i.poultryHouse)))], [incidents])
  const statusOptions = useMemo(() => ["Все статусы", ...Array.from(new Set(incidents.map((i) => statusConfig[i.status].label)))], [incidents])
  const priorityOptions = useMemo(() => ["Любой", ...Array.from(new Set(incidents.map((i) => priorityConfig[i.priority].label)))], [incidents])

  const currentHouseOptions = housesByWorkshop[newWorkshop] ?? []
  const currentZoneOptions = zonesByHouse[newHouse] ?? []
  const currentResponsibleOptions = responsibleByCategory[newCategory] ?? ["Старший смены"]

  useEffect(() => {
    if (newCategory === "Нарушение биобезопасности") {
      setNewPriority("Высокий")
    }
    setNewResponsible(responsibleByCategory[newCategory] ?? ["Старший смены"])
  }, [newCategory])

  useEffect(() => {
    const firstHouse = currentHouseOptions[0]
    if (firstHouse && !currentHouseOptions.includes(newHouse)) {
      setNewHouse(firstHouse)
    }
  }, [newWorkshop, currentHouseOptions, newHouse])

  useEffect(() => {
    const firstZone = currentZoneOptions[0]
    if (firstZone && !currentZoneOptions.includes(newZone)) {
      setNewZone(firstZone)
    }
  }, [newHouse, currentZoneOptions, newZone])

  const handleCreateIncident = () => {
    const nextNumber =
      incidents.reduce((max, incident) => {
        const match = incident.id.match(/^INC-(\d+)$/)
        const value = match ? Number(match[1]) : 0
        return Math.max(max, value)
      }, 0) + 1

    const id = `INC-${nextNumber}`

    const priorityByLabel: Record<string, IncidentPriority> = {
      Критический: "critical",
      Высокий: "high",
      Средний: "medium",
      Низкий: "low",
    }

    const createdIncident: Incident = {
      id,
      date: new Date().toLocaleDateString("ru-RU"),
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      type: newCategory,
      icon: newCategory === "Поломка оборудования" ? Wrench : AlertTriangle,
      shortDescription: newDescription.slice(0, 80) || "Новый инцидент",
      description: newDescription || "Описание не заполнено.",
      workshop: newWorkshop,
      poultryHouse: newHouse,
      zone: newZone,
      priority: priorityByLabel[newPriority] ?? "medium",
      status: "new",
      responsible: newResponsible.join(", "),
      comment: "Создан вручную через форму инцидента.",
    }

    setIncidents((current) => [createdIncident, ...current])
    setActiveIncidentId(id)
    setIsCreateOpen(false)
    setCreateSuccessMessage(`Инцидент №${id} успешно создан и передан в работу`)
    setTimeout(() => setCreateSuccessMessage(""), 4000)
  }

  const handleCloseIncident = (id: string) => {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id
          ? {
              ...incident,
              status: "closed",
              comment: "Инцидент закрыт вручную через карточку.",
              closedAt: new Date().toLocaleString("ru-RU"),
            }
          : incident,
      ),
    )
    setIsClosedExpanded(true)
  }

  const handleReopenIncident = (id: string) => {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id
          ? { ...incident, status: "inProgress", comment: "Инцидент возвращен в работу.", closedAt: undefined }
          : incident,
      ),
    )
  }

  const handleDownloadReport = (id: string) => {
    setCreateSuccessMessage(`Сформирован отчет по инциденту ${id} (демо).`)
    setTimeout(() => setCreateSuccessMessage(""), 3000)
  }

  const handleCreateRelated = (id: string) => {
    const sourceIncident = incidents.find((incident) => incident.id === id)
    if (!sourceIncident) return

    setNewCategory(sourceIncident.type)
    setNewWorkshop(sourceIncident.workshop)
    setNewHouse(sourceIncident.poultryHouse)
    setNewDescription(`Связан с ${id}: продолжение кейса.`)
    setIsCreateOpen(true)
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col rounded-[28px] bg-background">
      <div className="border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Реестр инцидентов</h1>
            <p className="mt-2 text-sm text-zinc-500">Контроль отклонений, ответственных и статусов выполнения</p>
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
                placeholder="Поиск по номеру инцидента (INC-...)"
                className="h-10 border-zinc-300 bg-white pl-9 text-zinc-900 placeholder:text-zinc-500"
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-red-600 text-white hover:bg-red-700">
              <ClipboardPlus className="size-4" />Создать инцидент
            </Button>
          </div>
        </div>
      </div>
      {createSuccessMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-md">
          {createSuccessMessage}
        </div>
      )}

      <section className="grid gap-3 border-b border-zinc-200 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{item.label}</p>
                <Icon className={cn("size-4", item.tone)} />
              </div>
              <p className={cn("mt-2 text-3xl font-bold", item.tone)}>{item.value}</p>
            </div>
          )
        })}
      </section>

      <section className="border-b border-zinc-200 px-6 py-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FieldSelect label="Период" options={["Последние 24 часа", "Сегодня", "7 дней", "Месяц"]} value="Последние 24 часа" onValueChange={() => {}} />
          <FieldSelect label="Тип" options={typeOptions} value={typeFilter} onValueChange={setTypeFilter} />
          <FieldSelect label="Птичник" options={houseOptions} value={houseFilter} onValueChange={setHouseFilter} />
          <FieldSelect label="Статус" options={statusOptions} value={statusFilter} onValueChange={setStatusFilter} />
          <FieldSelect label="Приоритет" options={priorityOptions} value={priorityFilter} onValueChange={setPriorityFilter} />
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Таблица инцидентов</h2>
            <span className="text-sm text-zinc-500">Найдено: {activeFilteredIncidents.length}</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">№</th>
                    <th className="px-4 py-3 font-medium">Дата</th>
                    <th className="px-4 py-3 font-medium">Тип</th>
                    <th className="px-4 py-3 font-medium">Краткое описание</th>
                    <th className="px-4 py-3 font-medium">Цех</th>
                    <th className="px-4 py-3 font-medium">Птичник</th>
                    <th className="px-4 py-3 font-medium">Приоритет</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Ответственный</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {activeFilteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-zinc-500">Инцидентов по фильтрам нет.</td>
                    </tr>
                  ) : (
                    activeFilteredIncidents.map((incident) => {
                      const Icon = incident.icon
                      const isActive = incident.id === activeIncident?.id

                      return (
                        <tr
                          key={incident.id}
                          tabIndex={0}
                          onClick={() => setActiveIncidentId(incident.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") setActiveIncidentId(incident.id)
                          }}
                          className={cn(
                            "cursor-pointer border-l-4 transition-colors outline-none",
                            priorityConfig[incident.priority].rowClass,
                            isActive ? "bg-zinc-100" : "hover:bg-zinc-50",
                          )}
                        >
                          <td className="px-4 py-3 font-medium text-zinc-900">{incident.id}</td>
                          <td className="px-4 py-3 text-zinc-600">{incident.date} {incident.time}</td>
                          <td className="px-4 py-3"><span className="flex items-center gap-2 text-zinc-800"><Icon className={cn("size-4", priorityConfig[incident.priority].iconClass)} />{incident.type}</span></td>
                          <td className="px-4 py-3 text-zinc-700">{incident.shortDescription}</td>
                          <td className="px-4 py-3 text-zinc-600">{incident.workshop}</td>
                          <td className="px-4 py-3 text-zinc-600">{incident.poultryHouse}</td>
                          <td className="px-4 py-3"><Badge className={priorityConfig[incident.priority].className}>{priorityConfig[incident.priority].label}</Badge></td>
                          <td className="px-4 py-3"><Badge className={statusConfig[incident.status].className}>{statusConfig[incident.status].label}</Badge></td>
                          <td className="px-4 py-3 text-zinc-700">{incident.responsible}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 lg:hidden">
            {activeIncident ? <IncidentDetails incident={activeIncident} onOpenDetails={(id) => router.push(`/incidents/${id}`)} onCloseIncident={handleCloseIncident} onReopenIncident={handleReopenIncident} onDownloadReport={handleDownloadReport} onCreateRelated={handleCreateRelated} /> : <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500">Инцидентов нет.</div>}
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setIsClosedExpanded((value) => !value)}
              className="flex w-full items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-zinc-700"
            >
              <span>Закрытые инциденты ({closedFilteredIncidents.length})</span>
              {isClosedExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>

            {isClosedExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-white text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">№</th>
                      <th className="px-4 py-3 font-medium">Дата</th>
                      <th className="px-4 py-3 font-medium">Тип</th>
                      <th className="px-4 py-3 font-medium">Цех</th>
                      <th className="px-4 py-3 font-medium">Птичник</th>
                      <th className="px-4 py-3 font-medium">Ответственный</th>
                      <th className="px-4 py-3 font-medium">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {closedFilteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-sm text-zinc-500">
                          Закрытых инцидентов по фильтрам нет.
                        </td>
                      </tr>
                    ) : (
                      closedFilteredIncidents.map((incident) => (
                        <tr key={`closed-${incident.id}`} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 font-medium text-zinc-900">{incident.id}</td>
                          <td className="px-4 py-3 text-zinc-600">{incident.date} {incident.time}</td>
                          <td className="px-4 py-3 text-zinc-700">{incident.type}</td>
                          <td className="px-4 py-3 text-zinc-600">{incident.workshop}</td>
                          <td className="px-4 py-3 text-zinc-600">{incident.poultryHouse}</td>
                          <td className="px-4 py-3 text-zinc-700">{incident.responsible}</td>
                          <td className="px-4 py-3">
                            <Button variant="outline" size="sm" onClick={() => handleReopenIncident(incident.id)}>
                              Переоткрыть
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <div className="hidden min-h-0 lg:block">
          {activeIncident ? (
            <IncidentDetails incident={activeIncident} onOpenDetails={(id) => router.push(`/incidents/${id}`)} onCloseIncident={handleCloseIncident} onReopenIncident={handleReopenIncident} onDownloadReport={handleDownloadReport} onCreateRelated={handleCreateRelated} />
          ) : (
            <aside className="flex h-full items-center justify-center rounded-br-[28px] border-l border-zinc-200 bg-white p-5 text-sm text-zinc-500">Инцидентов нет.</aside>
          )}
        </div>
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[460px]">
          <SheetHeader>
            <SheetTitle>Создание инцидента</SheetTitle>
            <SheetDescription>Заполните форму и нажмите «Создать»</SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto px-4 pb-4">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Категория</span>
              <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm">
                {categoryOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Цех</span>
              <select value={newWorkshop} onChange={(event) => setNewWorkshop(event.target.value)} className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm">
                {workshopOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Птичник</span>
              <select value={newHouse} onChange={(event) => setNewHouse(event.target.value)} className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm">
                {currentHouseOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Зона</span>
              <select value={newZone} onChange={(event) => setNewZone(event.target.value)} className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm">
                {currentZoneOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Приоритет</span>
              <select value={newPriority} onChange={(event) => setNewPriority(event.target.value)} className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm">
                {["Низкий", "Средний", "Высокий", "Критический"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Описание</span>
              <Textarea value={newDescription} onChange={(event) => setNewDescription(event.target.value)} placeholder="Опишите, что произошло..." />
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Ответственный</span>
              <select
                multiple
                value={newResponsible}
                onChange={(event) =>
                  setNewResponsible(Array.from(event.target.selectedOptions).map((option) => option.value))
                }
                className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {currentResponsibleOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateIncident} className="bg-zinc-950 text-white hover:bg-zinc-800">
              Создать
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  )
}
