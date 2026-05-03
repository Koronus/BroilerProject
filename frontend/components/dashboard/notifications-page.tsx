"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardPlus,
  Clock3,
  Droplets,
  Eye,
  Filter,
  History,
  Link2,
  MessageSquare,
  PauseCircle,
  RadioTower,
  Search,
  Settings,
  Thermometer,
  UserPlus,
  UserRound,
  Wind,
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

type NotificationPriority = "critical" | "high" | "medium" | "low"
type NotificationStatus = "new" | "viewed" | "snoozed" | "incident" | "closed"
type NotificationSource = "sensor" | "system" | "employee" | "analytics"
type DateFilter = "all" | "24h" | "today" | "7d" | "month"

interface SelectOption {
  value: string
  label: string
}

interface NotificationFilters {
  type: string
  farm: string
  building: string
  period: DateFilter
  priority: "all" | NotificationPriority
  status: "all" | NotificationStatus
  source: "all" | NotificationSource
}

interface IncidentFormState {
  title: string
  description: string
  priority: NotificationPriority
  responsible: string
  decisionComment: string
}

interface CreatedIncident {
  code?: string
}

interface BackendNotification {
  id: string
  code: string
  title: string
  description?: string | null
  status: string
  priority?: string | null
  source?: string | null
  sourceDetail?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface FarmNotification {
  id: string
  icon: LucideIcon
  type: string
  title: string
  description: string
  fullText: string
  time: string
  date: string
  createdAtMs?: number
  farm: string
  building: string
  source: NotificationSource
  sourceLabel: string
  priority: NotificationPriority
  status: NotificationStatus
  deviation: string
  value: string
  threshold: string
  similarHistory: string[]
  relatedIncidents: string[]
  recommendation: string
  responsible: string
  comments: string[]
  requiresIncident: boolean
}

const priorityConfig: Record<
  NotificationPriority,
  {
    label: string
    badgeClass: string
    borderClass: string
    textClass: string
  }
> = {
  critical: {
    label: "Критический",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    borderClass: "border-l-red-500",
    textClass: "text-red-600",
  },
  high: {
    label: "Высокий",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    borderClass: "border-l-amber-500",
    textClass: "text-amber-600",
  },
  medium: {
    label: "Средний",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    borderClass: "border-l-sky-500",
    textClass: "text-sky-600",
  },
  low: {
    label: "Низкий",
    badgeClass: "border-zinc-300 bg-zinc-100 text-zinc-700",
    borderClass: "border-l-zinc-600",
    textClass: "text-zinc-600",
  },
}

const statusConfig: Record<NotificationStatus, { label: string; className: string }> = {
  new: {
    label: "Новое",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  viewed: {
    label: "Просмотрено",
    className: "border-zinc-300 bg-zinc-100 text-zinc-700",
  },
  snoozed: {
    label: "Отложено",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  incident: {
    label: "Передано в инцидент",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  closed: {
    label: "Закрыто",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
}

const backendStatusMap: Record<string, NotificationStatus> = {
  NEW: "new",
  VIEWED: "viewed",
  ACKNOWLEDGED: "viewed",
  SNOOZED: "snoozed",
  INCIDENT_CREATED: "incident",
  RESOLVED: "closed",
  CLOSED: "closed",
}

const backendPriorityMap: Record<string, NotificationPriority> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
}

const backendSourceMap: Record<string, NotificationSource> = {
  SENSOR: "sensor",
  SYSTEM: "system",
  EMPLOYEE: "employee",
  ANALYTICS: "analytics",
}

const backendSourceLabelMap: Record<NotificationSource, string> = {
  sensor: "Датчик",
  system: "Система",
  employee: "Сотрудник",
  analytics: "Аналитика",
}

const defaultFilters: NotificationFilters = {
  type: "all",
  farm: "all",
  building: "all",
  period: "all",
  priority: "all",
  status: "all",
  source: "all",
}

const dateFilterOptions: SelectOption[] = [
  { value: "all", label: "Все даты" },
  { value: "24h", label: "Последние 24 часа" },
  { value: "today", label: "Сегодня" },
  { value: "7d", label: "7 дней" },
  { value: "month", label: "Месяц" },
]

const priorityFilterOptions: SelectOption[] = [
  { value: "all", label: "Любой" },
  { value: "critical", label: priorityConfig.critical.label },
  { value: "high", label: priorityConfig.high.label },
  { value: "medium", label: priorityConfig.medium.label },
  { value: "low", label: priorityConfig.low.label },
]

const statusFilterOptions: SelectOption[] = [
  { value: "all", label: "Все статусы" },
  { value: "new", label: statusConfig.new.label },
  { value: "viewed", label: statusConfig.viewed.label },
  { value: "snoozed", label: statusConfig.snoozed.label },
  { value: "incident", label: statusConfig.incident.label },
  { value: "closed", label: statusConfig.closed.label },
]

const sourceFilterOptions: SelectOption[] = [
  { value: "all", label: "Все источники" },
  { value: "sensor", label: "Датчик" },
  { value: "system", label: "Система" },
  { value: "employee", label: "Сотрудник" },
  { value: "analytics", label: "Аналитика" },
]

const emptyIncidentForm: IncidentFormState = {
  title: "",
  description: "",
  priority: "medium",
  responsible: "",
  decisionComment: "",
}

const incidentPriorityMap: Record<NotificationPriority, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
}

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

const sourceIcons: Record<NotificationSource, LucideIcon> = {
  sensor: RadioTower,
  system: Settings,
  employee: UserRound,
  analytics: BrainCircuit,
}

const normalizeBackendEnum = (value?: string | null) => value?.toUpperCase() ?? ""
const unknownValue = "—"

const buildTextFilterOptions = (
  values: string[],
  allLabel: string,
  excludeUnknown = true,
): SelectOption[] => {
  const uniqueValues = Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value && (!excludeUnknown || value !== unknownValue)),
    ),
  )

  return [
    { value: "all", label: allLabel },
    ...uniqueValues.map((value) => ({ value, label: value })),
  ]
}

const formatBackendDateTime = (value?: string | null) => {
  if (!value) {
    return { date: "—", time: "—", timestamp: undefined }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return { date: "—", time: "—", timestamp: undefined }
  }

  return {
    date: date.toLocaleDateString("ru-RU"),
    time: date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: date.getTime(),
  }
}

const parseNotificationDateTime = (dateLabel: string, timeLabel: string) => {
  const [day, month, year] = dateLabel.split(".").map(Number)
  const [hour = 0, minute = 0] = timeLabel.split(":").map(Number)

  if (!day || !month || !year) {
    return undefined
  }

  const date = new Date(year, month - 1, day, hour, minute)

  return Number.isNaN(date.getTime()) ? undefined : date.getTime()
}

const getNotificationTimestamp = (notification: FarmNotification) =>
  notification.createdAtMs ?? parseNotificationDateTime(notification.date, notification.time)

const notificationNeedsIncident = (notification: FarmNotification) =>
  notification.requiresIncident ||
  (notification.status !== "incident" &&
    notification.status !== "closed" &&
    notification.status !== "snoozed" &&
    (notification.priority === "critical" || notification.priority === "high"))

const toFarmNotification = (notification: BackendNotification): FarmNotification => {
  const { date, time, timestamp } = formatBackendDateTime(notification.createdAt)
  const source = backendSourceMap[normalizeBackendEnum(notification.source)] ?? "system"

  return {
    id: notification.id,
    icon: AlertTriangle,
    type: "Уведомление",
    title: notification.title,
    description: notification.description ?? "Описание не указано.",
    fullText: notification.description ?? notification.title,
    time,
    date,
    createdAtMs: timestamp,
    farm: "—",
    building: "—",
    source,
    sourceLabel: notification.sourceDetail ?? backendSourceLabelMap[source],
    priority: backendPriorityMap[normalizeBackendEnum(notification.priority)] ?? "medium",
    status: backendStatusMap[normalizeBackendEnum(notification.status)] ?? "new",
    deviation: "—",
    value: "—",
    threshold: "—",
    similarHistory: [],
    relatedIncidents: [],
    recommendation: "Проверьте детали уведомления в системе.",
    responsible: "Не назначен",
    comments: [`Код уведомления: ${notification.code}`],
    requiresIncident: false,
  }
}

const fallbackNotifications: FarmNotification[] = [
  {
    id: "N-2041",
    icon: Thermometer,
    type: "Микроклимат",
    title: "Температура выше нормы",
    description: "Птичник 4 держится выше допустимого диапазона 18 минут.",
    fullText:
      "Датчик NMC-204 зафиксировал устойчивый рост температуры в зоне посадки. Отклонение сохраняется дольше контрольного периода.",
    time: "10:38",
    date: "15.04.2026",
    farm: "Ферма 2",
    building: "Птичник 4",
    source: "sensor",
    sourceLabel: "Датчик микроклимата",
    priority: "critical",
    status: "new",
    deviation: "+2.3 °C в течение 18 минут",
    value: "33.7 °C",
    threshold: "31.4 °C",
    similarHistory: ["14.04.2026 18:12", "12.04.2026 09:47", "09.04.2026 16:30"],
    relatedIncidents: ["INC-2026-041", "INC-2026-038"],
    recommendation: "Проверить вентиляцию, приток воздуха и работу заслонок.",
    responsible: "Не назначен",
    comments: ["Смена подтвердила духоту в проходе 2.", "Нужна проверка автоматики."],
    requiresIncident: true,
  },
  {
    id: "N-2037",
    icon: AlertTriangle,
    type: "Состояние стада",
    title: "Рост падежа за последние 6 часов",
    description: "Показатель выше нормы на 1.8%, требуется проверка по птичнику.",
    fullText:
      "Система учета зафиксировала ускоренный рост падежа относительно базового сценария для текущего возраста птицы.",
    time: "10:21",
    date: "15.04.2026",
    farm: "Ферма 1",
    building: "Птичник 2",
    source: "system",
    sourceLabel: "Система учета стада",
    priority: "high",
    status: "new",
    deviation: "+1.8% к плановому уровню",
    value: "2.4%",
    threshold: "0.6%",
    similarHistory: ["11.04.2026 07:05", "02.04.2026 21:18"],
    relatedIncidents: ["INC-2026-039"],
    recommendation: "Назначить ветеринарный осмотр и сверить журнал обходов.",
    responsible: "Ветеринарная служба",
    comments: ["Нужна сверка с фактическим обходом."],
    requiresIncident: true,
  },
  {
    id: "N-2031",
    icon: Droplets,
    type: "Ресурсы",
    title: "Снижение потребления воды",
    description: "Потребление ниже ожидаемого уровня для партии 21-30 дней.",
    fullText:
      "Аналитика потребления воды показывает просадку по линии поения. Возможна закупорка или остановка участка.",
    time: "09:56",
    date: "15.04.2026",
    farm: "Ферма 3",
    building: "Птичник 1",
    source: "analytics",
    sourceLabel: "Аналитика потребления",
    priority: "medium",
    status: "viewed",
    deviation: "-12% за 2 часа",
    value: "218 мл/гол.",
    threshold: "248 мл/гол.",
    similarHistory: ["13.04.2026 11:40"],
    relatedIncidents: [],
    recommendation: "Проверить давление в линии поения и доступность ниппелей.",
    responsible: "Иван Соколов",
    comments: ["Ответственный уведомлен."],
    requiresIncident: false,
  },
  {
    id: "N-2028",
    icon: Wind,
    type: "Воздух",
    title: "Аммиак приближается к верхней границе",
    description: "Порог еще не превышен, но тренд растет третий замер подряд.",
    fullText:
      "Датчики качества воздуха показывают устойчивый рост аммиака. До критического порога остается небольшой запас.",
    time: "09:44",
    date: "15.04.2026",
    farm: "Ферма 2",
    building: "Птичник 5",
    source: "sensor",
    sourceLabel: "Датчик воздуха",
    priority: "medium",
    status: "new",
    deviation: "+4 ppm за 45 минут",
    value: "18 ppm",
    threshold: "20 ppm",
    similarHistory: ["10.04.2026 13:22", "06.04.2026 15:14"],
    relatedIncidents: [],
    recommendation: "Усилить вентиляцию и проверить состояние подстилки.",
    responsible: "Не назначен",
    comments: [],
    requiresIncident: false,
  },
  {
    id: "N-2019",
    icon: CheckCircle2,
    type: "Инциденты",
    title: "Инцидент INC-2026-041 закрыт",
    description: "Ответственный отметил восстановление температурного режима.",
    fullText:
      "Инцидент по превышению температуры закрыт после контрольного периода без повторных отклонений.",
    time: "09:40",
    date: "15.04.2026",
    farm: "Ферма 2",
    building: "Птичник 5",
    source: "employee",
    sourceLabel: "Сотрудник смены",
    priority: "low",
    status: "closed",
    deviation: "Отклонений нет",
    value: "29.8 °C",
    threshold: "31.4 °C",
    similarHistory: [],
    relatedIncidents: ["INC-2026-041"],
    recommendation: "Продолжить штатный мониторинг.",
    responsible: "Алексей Морозов",
    comments: ["Проверка завершена, параметры стабильны."],
    requiresIncident: false,
  },
]

const buildKpiItems = (notifications: FarmNotification[]) => {
  const now = Date.now()
  const last24HoursStart = now - 24 * 60 * 60 * 1000

  return [
    {
      label: "Новые за 24 часа",
      value: notifications
        .filter((notification) => {
          const timestamp = getNotificationTimestamp(notification)

          return timestamp !== undefined && timestamp >= last24HoursStart
        })
        .length.toString(),
      tone: "text-emerald-300",
    },
    {
      label: "Критические",
      value: notifications
        .filter((notification) => notification.priority === "critical")
        .length.toString(),
      tone: "text-red-300",
    },
    {
      label: "Непрочитанные",
      value: notifications
        .filter((notification) => notification.status === "new")
        .length.toString(),
      tone: "text-amber-300",
    },
    {
      label: "Требуют создания инцидента",
      value: notifications
        .filter((notification) => notificationNeedsIncident(notification))
        .length.toString(),
      tone: "text-sky-300",
    },
  ]
}

function FieldSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function NotificationActions({
  onOpen,
  onCreateIncident,
  onAssign,
  onSnooze,
  onMarkAsRead,
  canCreateIncident = true,
  canSnooze = true,
  canMarkAsRead = true,
}: {
  onOpen: () => void
  onCreateIncident: () => void
  onAssign: () => void
  onSnooze: () => void
  onMarkAsRead: () => void
  canCreateIncident?: boolean
  canSnooze?: boolean
  canMarkAsRead?: boolean
}) {
  const actionClass =
    "h-8 border-zinc-300 bg-white px-2.5 text-xs text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"

  return (
    <div className="flex flex-wrap gap-2" >
      <Button
        variant="outline"
        size="sm"
        className={actionClass}
        onClick={(event) => {
          event.stopPropagation()
          onOpen()
        }}
      >
        <Eye className="size-3.5" />
        Открыть
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionClass}
        disabled={!canCreateIncident}
        onClick={(event) => {
          event.stopPropagation()
          onCreateIncident()
        }}
      >
        <ClipboardPlus className="size-3.5" />
        Создать инцидент
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionClass}
        onClick={(event) => {
          event.stopPropagation()
          onAssign()
        }}
      >
        <UserPlus className="size-3.5" />
        Назначить
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionClass}
        disabled={!canSnooze}
        onClick={(event) => {
          event.stopPropagation()
          onSnooze()
        }}
      >
        <PauseCircle className="size-3.5" />
        Отложить
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionClass}
        disabled={!canMarkAsRead}
        onClick={(event) => {
          event.stopPropagation()
          onMarkAsRead()
        }}
      >
        <CheckCircle2 className="size-3.5" />
        Прочитано
      </Button>
    </div>
  )
}

function NotificationDetails({
  notification,
  variant = "panel",
  onCreateIncident,
  onAssign,
}: {
  notification: FarmNotification
  variant?: "panel" | "dialog"
  onCreateIncident?: (notification: FarmNotification) => void
  onAssign?: (notification: FarmNotification) => void
}) {
  const SourceIcon = sourceIcons[notification.source]
  const canCreateIncident = notification.status !== "incident"

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col bg-white",
        variant === "panel"
          ? "h-full border-l border-zinc-200 rounded-br-[28px]"
          : "max-h-[82vh]",
      )}
    >
      <div className={cn("border-b border-zinc-200 px-5 py-4", variant === "dialog" && "pr-12")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Детали</p>
            <h2 className="mt-1 text-base font-semibold text-foreground">
              {notification.title}
            </h2>
          </div>
          <Badge className={priorityConfig[notification.priority].badgeClass}>
            {priorityConfig[notification.priority].label}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <section>
          <h3 className="mb-2 text-sm font-medium text-foreground">Полный текст</h3>
          <p className="text-sm leading-6 text-zinc-700">{notification.fullText}</p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-500">Что отклонилось</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">
              {notification.deviation}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-500">Значение и порог</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">
              {notification.value} / {notification.threshold}
            </p>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <History className="size-4 text-zinc-500" />
            История похожих уведомлений
          </div>
          {notification.similarHistory.length > 0 ? (
            <div className="space-y-2">
              {notification.similarHistory.map((item) => (
                <div key={item} className="text-sm text-zinc-400">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Похожих уведомлений не найдено</p>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Link2 className="size-4 text-zinc-500" />
            Связанные инциденты
          </div>
          {notification.relatedIncidents.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {notification.relatedIncidents.map((incident) => (
                <Badge
                  key={incident}
                  className="border-zinc-300 bg-zinc-100 text-zinc-700"
                >
                  {incident}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Связанных инцидентов нет</p>
          )}
        </section>

        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-emerald-700">
            Рекомендуемое действие
          </h3>
          <p className="text-sm leading-6 text-emerald-900">
            {notification.recommendation}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Ответственный
            </p>
            <p className="mt-1 text-sm text-zinc-800">{notification.responsible}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Источник данных
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-800">
              <SourceIcon className="size-4 text-zinc-500" />
              {notification.sourceLabel}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="size-4 text-zinc-500" />
            Комментарии
          </div>
          {notification.comments.length > 0 ? (
            <div className="space-y-2">
              {notification.comments.map((comment) => (
                <p
                  key={comment}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700"
                >
                  {comment}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Комментариев пока нет</p>
          )}
        </section>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-5 py-4">
        <Button
          variant="outline"
          className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
          onClick={() => onAssign?.(notification)}
        >
          <UserPlus className="size-4" />
          Назначить ответственного
        </Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={!canCreateIncident}
          onClick={() => onCreateIncident?.(notification)}
        >
          <ClipboardPlus className="size-4" />
          Создать инцидент
        </Button>
      </div>
    </aside>
  )
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<FarmNotification[]>(fallbackNotifications)
  const [activeNotificationId, setActiveNotificationId] = useState(fallbackNotifications[0].id)
  const [detailsNotificationId, setDetailsNotificationId] = useState<string | null>(null)
  const [incidentNotificationId, setIncidentNotificationId] = useState<string | null>(null)
  const [assignNotificationId, setAssignNotificationId] = useState<string | null>(null)
  const [selectedResponsible, setSelectedResponsible] = useState(responsibleOptions[0])
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>(emptyIncidentForm)
  const [isCreatingIncident, setIsCreatingIncident] = useState(false)
  const [incidentError, setIncidentError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<NotificationFilters>(defaultFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadNotifications() {
      setIsLoading(true)

      try {
        const response = await fetch("/api/notifications", { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`)
        }

        const data = (await response.json()) as BackendNotification[]
        const nextNotifications = data.map(toFarmNotification)

        if (!isCancelled) {
          setNotifications(nextNotifications)
          setActiveNotificationId(nextNotifications[0]?.id ?? "")
          setLoadError(null)
        }
      } catch {
        if (!isCancelled) {
          setNotifications(fallbackNotifications)
          setActiveNotificationId(fallbackNotifications[0].id)
          setLoadError("Бэкенд недоступен, показаны тестовые уведомления")
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      isCancelled = true
    }
  }, [])

  const typeFilterOptions = useMemo(
    () =>
      buildTextFilterOptions(
        notifications.map((notification) => notification.type),
        "Все типы",
        false,
      ),
    [notifications],
  )
  const farmFilterOptions = useMemo(
    () => buildTextFilterOptions(notifications.map((notification) => notification.farm), "Все фермы"),
    [notifications],
  )
  const buildingFilterOptions = useMemo(
    () =>
      buildTextFilterOptions(
        notifications.map((notification) => notification.building),
        "Все птичники",
      ),
    [notifications],
  )
  const kpiItems = useMemo(() => buildKpiItems(notifications), [notifications])

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const now = Date.now()
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    return notifications.filter((notification) => {
      const isSnoozed = notification.status === "snoozed"
      const notificationTimestamp = getNotificationTimestamp(notification)
      const matchesPeriod =
        filters.period === "all" ||
        (notificationTimestamp !== undefined &&
          ((filters.period === "24h" && notificationTimestamp >= now - 24 * 60 * 60 * 1000) ||
            (filters.period === "today" && notificationTimestamp >= startOfToday.getTime()) ||
            (filters.period === "7d" && notificationTimestamp >= now - 7 * 24 * 60 * 60 * 1000) ||
            (filters.period === "month" && notificationTimestamp >= now - 30 * 24 * 60 * 60 * 1000)))

      const matchesSearch =
        !query ||
        [
          notification.title,
          notification.description,
          notification.fullText,
          notification.id,
          notification.farm,
          notification.building,
          notification.sourceLabel,
          notification.type,
          notification.priority,
          notification.status,
          notification.source,
          priorityConfig[notification.priority].label,
          statusConfig[notification.status].label,
          notification.comments.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      const matchesType =
        filters.type === "all" || notification.type === filters.type
      const matchesSnoozedVisibility =
        filters.status === "snoozed" ? isSnoozed : !isSnoozed

      return (
        matchesSearch &&
        matchesPeriod &&
        matchesType &&
        matchesSnoozedVisibility &&
        (filters.farm === "all" || notification.farm === filters.farm) &&
        (filters.building === "all" || notification.building === filters.building) &&
        (filters.priority === "all" || notification.priority === filters.priority) &&
        (filters.status === "all" || notification.status === filters.status) &&
        (filters.source === "all" || notification.source === filters.source)
      )
    })
  }, [filters, notifications, searchQuery])

  const activeNotification =
    filteredNotifications.find((notification) => notification.id === activeNotificationId) ??
    filteredNotifications[0] ??
    null

  const detailsNotification =
    notifications.find((notification) => notification.id === detailsNotificationId) ?? null

  const incidentNotification =
    notifications.find((notification) => notification.id === incidentNotificationId) ?? null

  const assignNotification =
    notifications.find((notification) => notification.id === assignNotificationId) ?? null

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Object.values(filters).some((filterValue) => filterValue !== "all")

  const updateFilter = <Key extends keyof NotificationFilters>(
    key: Key,
    value: NotificationFilters[Key],
  ) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  const resetFilters = () => {
    setSearchQuery("")
    setFilters(defaultFilters)
  }

  const setNotificationStatus = (id: string, status: NotificationStatus) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id ? { ...notification, status } : notification,
      ),
    )
  }

  const updateNotificationStatus = async (
    notification: FarmNotification,
    status: NotificationStatus,
    backendStatus: string,
    errorMessage: string,
  ) => {
    if (notification.status === status) {
      return
    }

    const previousStatus = notification.status

    setNotificationStatus(notification.id, status)

    try {
      const response = await fetch(`/api/notifications/${notification.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendStatus),
      })

      if (!response.ok) {
        const responseBody = await response.text()

        throw new Error(responseBody || "Failed to update notification status")
      }

      setLoadError(null)
    } catch {
      setNotificationStatus(notification.id, previousStatus)
      setLoadError(errorMessage)
    }
  }

  const markNotificationAsViewed = (notification: FarmNotification) => {
    if (notification.status !== "new") {
      return
    }

    void updateNotificationStatus(
      notification,
      "viewed",
      "VIEWED",
      "Не удалось отметить уведомление как просмотренное",
    )
  }

  const snoozeNotification = (notification: FarmNotification) => {
    if (notification.status === "snoozed" || notification.status === "incident" || notification.status === "closed") {
      return
    }

    void updateNotificationStatus(
      notification,
      "snoozed",
      "SNOOZED",
      "Не удалось отложить уведомление",
    )
  }

  const openNotificationDetails = (notification: FarmNotification) => {
    setActiveNotificationId(notification.id)
    setDetailsNotificationId(notification.id)
  }

  const openCreateIncidentDialog = (notification: FarmNotification) => {
    setActiveNotificationId(notification.id)
    setDetailsNotificationId(null)
    setIncidentNotificationId(notification.id)
    setIncidentError(null)
    setIncidentForm({
      title: notification.title,
      description: notification.fullText || notification.description,
      priority: notification.priority,
      responsible: "",
      decisionComment: "",
    })
  }

  const openAssignDialog = (notification: FarmNotification) => {
    setActiveNotificationId(notification.id)
    setDetailsNotificationId(null)
    setIncidentNotificationId(null)
    setAssignNotificationId(notification.id)
    setSelectedResponsible(
      responsibleOptions.includes(notification.responsible)
        ? notification.responsible
        : responsibleOptions[0],
    )
  }

  const closeAssignDialog = () => {
    setAssignNotificationId(null)
    setSelectedResponsible(responsibleOptions[0])
  }

  const assignResponsible = () => {
    if (!assignNotification) {
      return
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => {
        if (notification.id !== assignNotification.id) {
          return notification
        }

        const comment = `Назначен ответственный: ${selectedResponsible}`

        return {
          ...notification,
          responsible: selectedResponsible,
          comments: notification.comments.includes(comment)
            ? notification.comments
            : [...notification.comments, comment],
        }
      }),
    )
    closeAssignDialog()
  }

  const closeCreateIncidentDialog = () => {
    setIncidentNotificationId(null)
    setIncidentError(null)
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

    if (!incidentNotification || isCreatingIncident) {
      return
    }

    setIsCreatingIncident(true)
    setIncidentError(null)

    try {
      const response = await fetch(
        `/api/incidents/from-notification/${incidentNotification.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: incidentForm.title.trim(),
            description: incidentForm.description.trim(),
            priority: incidentPriorityMap[incidentForm.priority],
            responsible: incidentForm.responsible.trim() || null,
            decisionComment: incidentForm.decisionComment.trim() || null,
          }),
        },
      )
      const responseBody = await response.text()

      if (!response.ok) {
        throw new Error(responseBody || "Не удалось создать инцидент")
      }

      let createdIncident: CreatedIncident | null = null

      try {
        createdIncident = responseBody ? JSON.parse(responseBody) : null
      } catch {
        createdIncident = null
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => {
          if (notification.id !== incidentNotification.id) {
            return notification
          }

          const incidentCode = createdIncident?.code

          return {
            ...notification,
            status: "incident",
            requiresIncident: false,
            relatedIncidents:
              incidentCode && !notification.relatedIncidents.includes(incidentCode)
                ? [...notification.relatedIncidents, incidentCode]
                : notification.relatedIncidents,
            comments: incidentCode
              ? [...notification.comments, `Создан инцидент: ${incidentCode}`]
              : notification.comments,
          }
        }),
      )
      closeCreateIncidentDialog()
    } catch (error) {
      setIncidentError(error instanceof Error ? error.message : "Не удалось создать инцидент")
    } finally {
      setIsCreatingIncident(false)
    }
  }

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col bg-background rounded-[28px]">
      <div className="border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Уведомления
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4" />
                Обновлено: 15.04.2026 10:42
              </span>
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
                placeholder="Поиск по уведомлениям"
                className="h-10 border-zinc-300 bg-white pl-9 text-zinc-900 placeholder:text-zinc-500"
              />
            </div>
            <Button
              variant="outline"
              className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
            >
              Отметить все прочитанными
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-3 border-b border-zinc-200 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {item.label}
            </p>
            <p className={cn("mt-2 text-3xl font-bold", item.tone)}>
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="border-b border-zinc-200 px-6 py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <Filter className="size-4 text-zinc-500" />
            Фильтры
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8 border-zinc-300 bg-white px-3 text-xs text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
            >
              Сбросить
            </Button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          <FieldSelect
            label="Тип уведомления"
            value={filters.type}
            onChange={(value) => updateFilter("type", value)}
            options={typeFilterOptions}
          />
          <FieldSelect
            label="Ферма"
            value={filters.farm}
            onChange={(value) => updateFilter("farm", value)}
            options={farmFilterOptions}
          />
          <FieldSelect
            label="Птичник"
            value={filters.building}
            onChange={(value) => updateFilter("building", value)}
            options={buildingFilterOptions}
          />
          <FieldSelect
            label="Дата / период"
            value={filters.period}
            onChange={(value) => updateFilter("period", value as DateFilter)}
            options={dateFilterOptions}
          />
          <FieldSelect
            label="Приоритет"
            value={filters.priority}
            onChange={(value) => updateFilter("priority", value as NotificationFilters["priority"])}
            options={priorityFilterOptions}
          />
          <FieldSelect
            label="Статус прочтения"
            value={filters.status}
            onChange={(value) => updateFilter("status", value as NotificationFilters["status"])}
            options={statusFilterOptions}
          />
          <FieldSelect
            label="Источник данных"
            value={filters.source}
            onChange={(value) => updateFilter("source", value as NotificationFilters["source"])}
            options={sourceFilterOptions}
          />
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
              Лента уведомлений
            </h2>
            <span className="text-sm text-zinc-500">
              Найдено: {filteredNotifications.length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
                По выбранным фильтрам уведомлений не найдено.
              </div>
            ) : filteredNotifications.map((notification) => {
              const Icon = notification.icon
              const SourceIcon = sourceIcons[notification.source]
              const isActive = notification.id === activeNotification?.id

              return (
                <article
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveNotificationId(notification.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setActiveNotificationId(notification.id)
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg border border-l-4 bg-white p-4 outline-none transition-colors shadow-sm",
                    priorityConfig[notification.priority].borderClass,
                    isActive
                      ? "border-zinc-400 bg-zinc-100"
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
                  )}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-zinc-100 p-2">
                          <Icon
                            className={cn(
                              "size-4",
                              priorityConfig[notification.priority].textClass,
                            )}
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-600">
                            {notification.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500">
                        <span>
                          {notification.date}, {notification.time}
                        </span>
                        <span>
                          {notification.farm} / {notification.building}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <SourceIcon className="size-4" />
                          {notification.sourceLabel}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className={priorityConfig[notification.priority].badgeClass}>
                          {priorityConfig[notification.priority].label}
                        </Badge>
                        <Badge className={statusConfig[notification.status].className}>
                          {statusConfig[notification.status].label}
                        </Badge>
                        <Badge className="border-zinc-300 bg-zinc-100 text-zinc-700">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>

                    <NotificationActions
                      onOpen={() => openNotificationDetails(notification)}
                      onCreateIncident={() => openCreateIncidentDialog(notification)}
                      onAssign={() => openAssignDialog(notification)}
                      onSnooze={() => snoozeNotification(notification)}
                      onMarkAsRead={() => markNotificationAsViewed(notification)}
                      canCreateIncident={notification.status !== "incident"}
                      canSnooze={
                        notification.status !== "snoozed" &&
                        notification.status !== "incident" &&
                        notification.status !== "closed"
                      }
                      canMarkAsRead={notification.status === "new"}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-5 lg:hidden">
            {activeNotification ? (
              <NotificationDetails
                notification={activeNotification}
                onCreateIncident={openCreateIncidentDialog}
                onAssign={openAssignDialog}
              />
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
                Уведомлений пока нет.
              </div>
            )}
          </div>
        </section>

        <div className="hidden min-h-0 lg:block">
          {activeNotification ? (
            <NotificationDetails
              notification={activeNotification}
              onCreateIncident={openCreateIncidentDialog}
              onAssign={openAssignDialog}
            />
          ) : (
            <aside className="flex h-full items-center justify-center border-l border-zinc-200 bg-white p-5 text-sm text-zinc-500 rounded-br-[28px]">
              Уведомлений пока нет.
            </aside>
          )}
        </div>
      </div>
      </main>

      <Dialog
        open={detailsNotification !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsNotificationId(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[min(920px,calc(100%-2rem))] overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {detailsNotification?.title ?? "Детали уведомления"}
          </DialogTitle>
          {detailsNotification && (
            <NotificationDetails
              notification={detailsNotification}
              variant="dialog"
              onCreateIncident={openCreateIncidentDialog}
              onAssign={openAssignDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={assignNotification !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeAssignDialog()
          }
        }}
      >
        <DialogContent className="max-w-[min(560px,calc(100%-2rem))] p-0">
          <div className="border-b border-zinc-200 px-6 py-5 pr-12">
            <DialogTitle className="text-base font-semibold text-foreground">
              Назначить ответственного
            </DialogTitle>
            {assignNotification && (
              <p className="mt-2 text-sm text-zinc-500">
                {assignNotification.title}
              </p>
            )}
          </div>

          <div className="space-y-5 p-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Ответственный
              </span>
              <select
                value={selectedResponsible}
                onChange={(event) => setSelectedResponsible(event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
              >
                {responsibleOptions.map((responsible) => (
                  <option key={responsible} value={responsible}>
                    {responsible}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={closeAssignDialog}
                className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={assignResponsible}
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <UserPlus className="size-4" />
                Назначить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={incidentNotification !== null}
        onOpenChange={(open) => {
          if (!open && !isCreatingIncident) {
            closeCreateIncidentDialog()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[min(720px,calc(100%-2rem))] overflow-y-auto p-0">
          <div className="border-b border-zinc-200 px-6 py-5 pr-12">
            <DialogTitle className="text-base font-semibold text-foreground">
              Создать инцидент
            </DialogTitle>
            {incidentNotification && (
              <p className="mt-2 text-sm text-zinc-500">
                {incidentNotification.title}
              </p>
            )}
          </div>

          <form className="space-y-5 p-6" onSubmit={handleCreateIncident}>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Название
              </span>
              <Input
                required
                value={incidentForm.title}
                onChange={(event) => updateIncidentForm("title", event.target.value)}
                className="border-zinc-300 bg-white text-zinc-900"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Описание
              </span>
              <Textarea
                value={incidentForm.description}
                onChange={(event) => updateIncidentForm("description", event.target.value)}
                className="min-h-28 border-zinc-300 bg-white text-zinc-900"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wide text-zinc-500">
                  Приоритет
                </span>
                <select
                  value={incidentForm.priority}
                  onChange={(event) =>
                    updateIncidentForm("priority", event.target.value as NotificationPriority)
                  }
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-zinc-500"
                >
                  {priorityFilterOptions
                    .filter((option) => option.value !== "all")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wide text-zinc-500">
                  Ответственный
                </span>
                <Input
                  value={incidentForm.responsible}
                  onChange={(event) =>
                    updateIncidentForm("responsible", event.target.value)
                  }
                  className="border-zinc-300 bg-white text-zinc-900"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Комментарий
              </span>
              <Textarea
                value={incidentForm.decisionComment}
                onChange={(event) =>
                  updateIncidentForm("decisionComment", event.target.value)
                }
                className="min-h-24 border-zinc-300 bg-white text-zinc-900"
              />
            </label>

            {incidentError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {incidentError}
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
