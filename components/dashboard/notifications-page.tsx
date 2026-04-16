"use client"

import { useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type NotificationPriority = "critical" | "high" | "medium" | "low"
type NotificationStatus = "new" | "viewed" | "incident" | "closed"
type NotificationSource = "sensor" | "system" | "employee" | "analytics"

interface FarmNotification {
  id: string
  icon: LucideIcon
  type: string
  title: string
  description: string
  fullText: string
  time: string
  date: string
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
  incident: {
    label: "Передано в инцидент",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  closed: {
    label: "Закрыто",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
}

const sourceIcons: Record<NotificationSource, LucideIcon> = {
  sensor: RadioTower,
  system: Settings,
  employee: UserRound,
  analytics: BrainCircuit,
}

const notifications: FarmNotification[] = [
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

const kpiItems = [
  { label: "Новые за 24 часа", value: "38", tone: "text-emerald-300" },
  { label: "Критические", value: "6", tone: "text-red-300" },
  { label: "Непрочитанные", value: "14", tone: "text-amber-300" },
  { label: "Требуют создания инцидента", value: "5", tone: "text-sky-300" },
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

function NotificationActions({
  onOpen,
}: {
  onOpen: () => void
}) {
  const actionClass =
    "h-8 border-zinc-300 bg-white px-2.5 text-xs text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"

  return (
    <div className="flex flex-wrap gap-2" >
      <Button variant="outline" size="sm" className={actionClass} onClick={onOpen}>
        <Eye className="size-3.5" />
        Открыть
      </Button>
      <Button variant="outline" size="sm" className={actionClass}>
        <ClipboardPlus className="size-3.5" />
        Создать инцидент
      </Button>
      <Button variant="outline" size="sm" className={actionClass}>
        <UserPlus className="size-3.5" />
        Назначить
      </Button>
      <Button variant="outline" size="sm" className={actionClass}>
        <PauseCircle className="size-3.5" />
        Отложить
      </Button>
      <Button variant="outline" size="sm" className={actionClass}>
        <CheckCircle2 className="size-3.5" />
        Прочитано
      </Button>
    </div>
  )
}

function NotificationDetails({
  notification,
}: {
  notification: FarmNotification
}) {
  const SourceIcon = sourceIcons[notification.source]

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-zinc-200 bg-white rounded-br-[28px]">
      <div className="border-b border-zinc-200 px-5 py-4">
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
        >
          <UserPlus className="size-4" />
          Назначить ответственного
        </Button>
        <Button className="bg-red-600 text-white hover:bg-red-700">
          <ClipboardPlus className="size-4" />
          Создать инцидент
        </Button>
      </div>
    </aside>
  )
}

export function NotificationsPage() {
  const [activeNotificationId, setActiveNotificationId] = useState(notifications[0].id)
  const [searchQuery, setSearchQuery] = useState("")

  const activeNotification =
    notifications.find((notification) => notification.id === activeNotificationId) ??
    notifications[0]

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return notifications
    }

    return notifications.filter((notification) =>
      [
        notification.title,
        notification.description,
        notification.farm,
        notification.building,
        notification.sourceLabel,
        notification.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [searchQuery])

  return (
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
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Filter className="size-4 text-zinc-500" />
          Фильтры
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          <FieldSelect
            label="Тип уведомления"
            options={["Все типы", "Микроклимат", "Ресурсы", "Воздух", "Инциденты"]}
          />
          <FieldSelect label="Ферма" options={["Все фермы", "Ферма 1", "Ферма 2", "Ферма 3"]} />
          <FieldSelect
            label="Птичник"
            options={["Все птичники", "Птичник 1", "Птичник 2", "Птичник 4", "Птичник 5"]}
          />
          <FieldSelect
            label="Дата / период"
            options={["Последние 24 часа", "Сегодня", "7 дней", "Месяц"]}
          />
          <FieldSelect
            label="Приоритет"
            options={["Любой", "Критический", "Высокий", "Средний", "Низкий"]}
          />
          <FieldSelect
            label="Статус прочтения"
            options={["Все статусы", "Новое", "Просмотрено", "Передано", "Закрыто"]}
          />
          <FieldSelect
            label="Источник данных"
            options={["Все источники", "Датчик", "Система", "Сотрудник", "Аналитика"]}
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
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon
              const SourceIcon = sourceIcons[notification.source]
              const isActive = notification.id === activeNotification.id

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
                      onOpen={() => setActiveNotificationId(notification.id)}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-5 lg:hidden">
            <NotificationDetails notification={activeNotification} />
          </div>
        </section>

        <div className="hidden min-h-0 lg:block">
          <NotificationDetails notification={activeNotification} />
        </div>
      </div>
    </main>
  )
}
