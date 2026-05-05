"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Link2, MessageSquare, RefreshCcw, UserPlus } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type DetailData = {
  id: string
  title: string
  context: string
  status: string
  priority: string
  timeline: string[]
  chartTitle: string
  chart: Array<Record<string, number | string>>
  chartType: "line" | "bar" | "combined"
  notes: string[]
  actions: string[]
}

const incidentDetails: Record<string, DetailData> = {
  "INC-1": {
    id: "INC-1",
    title: "Критический перегрев зоны посадки",
    context: "Инцидент высшего приоритета, в работе у Иванова.",
    status: "В работе",
    priority: "Критический",
    timeline: ["10:20 — Фиксация отклонения датчиком", "10:38 — Создание инцидента системой", "10:40 — Иванов взял задачу в работу", "10:45 — Добавлен комментарий об открытии заслонок"],
    chartTitle: "Поминутная температура за 3 часа (Цех 2 / Птичник 4)",
    chartType: "line",
    chart: [
      { t: "10:00", temp: 39.8, normTop: 40.5, normBottom: 39.4 },
      { t: "10:20", temp: 40.9, normTop: 40.5, normBottom: 39.4 },
      { t: "10:30", temp: 41.3, normTop: 40.5, normBottom: 39.4 },
      { t: "10:40", temp: 40.6, normTop: 40.5, normBottom: 39.4 },
      { t: "10:50", temp: 40.1, normTop: 40.5, normBottom: 39.4 },
    ],
    notes: ["Состояние заслонок: открыты", "Состояние вентиляторов: усиленный режим", "Видео: поток камеры птичника доступен"],
    actions: ["Связаться с Ивановым", "Подтвердить нормализацию", "Эскалировать"],
  },
  "INC-2": {
    id: "INC-2",
    title: "Рост падежа",
    context: "Детальная страница для полного post-mortem разбора.",
    status: "Новый",
    priority: "Высокий",
    timeline: ["10:21 — Создание инцидента", "10:25 — Изменен приоритет на высокий", "10:30 — Назначена ветеринарная служба"],
    chartTitle: "Падеж по Цеху 1 / Птичнику 2",
    chartType: "line",
    chart: [
      { t: "Д-4", mortality: 14 },
      { t: "Д-3", mortality: 18 },
      { t: "Д-2", mortality: 22 },
      { t: "Д-1", mortality: 31 },
      { t: "Сегодня", mortality: 37 },
    ],
    notes: ["Медиафайлы: фото и акт осмотра", "Комментарии: чат с упоминаниями", "Связанные объекты: партия, видео, уведомления"],
    actions: ["Переназначить", "Создать дочернюю задачу", "Взять в работу"],
  },
  "INC-3": {
    id: "INC-3",
    title: "Снижение потребления воды",
    context: "Назначен на Соколова, статус Новый.",
    status: "Новый",
    priority: "Средний",
    timeline: ["09:56 — Аналитика выявила аномалию", "09:56 — Инцидент создан и назначен", "Система — Ожидается реакция исполнителя"],
    chartTitle: "Потребление воды и корма (Цех 3 / Птичник 1)",
    chartType: "combined",
    chart: [
      { t: "06:00", water: 520, feed: 330 },
      { t: "08:00", water: 480, feed: 320 },
      { t: "10:00", water: 410, feed: 315 },
      { t: "12:00", water: 360, feed: 300 },
      { t: "14:00", water: 340, feed: 295 },
    ],
    notes: ["Мнемосхема линии поения: датчики давления подсвечены", "Гипотеза: падение давления в ветке 2"],
    actions: ["Переназначить", "Повысить приоритет", "Открыть схему оборудования"],
  },
  "INC-4": {
    id: "INC-4",
    title: "Сбой вентилятора",
    context: "Успешно закрыт, страница для пост-анализа.",
    status: "Закрыт",
    priority: "Высокий",
    timeline: ["09:00 — Ошибка контроллера", "09:10 — Создание INC-4", "09:15 — Морозов взял в работу", "09:25 — Перезапуск вентилятора", "09:40 — Инцидент закрыт"],
    chartTitle: "Обороты вентилятора и климат (Цех 2 / Птичник 5)",
    chartType: "combined",
    chart: [
      { t: "09:00", rpm: 620, temp: 39.8 },
      { t: "09:10", rpm: 300, temp: 40.1 },
      { t: "09:20", rpm: 180, temp: 40.3 },
      { t: "09:30", rpm: 650, temp: 39.9 },
      { t: "09:40", rpm: 700, temp: 39.8 },
    ],
    notes: ["Технический лог контроллера выгружен", "Микроклимат сохранился в пределах нормы"],
    actions: ["Вернуть в работу", "Скачать отчет (PDF/Excel)", "Создать связанный"],
  },
  "INC-5": {
    id: "INC-5",
    title: "Рост аммиака",
    context: "Просроченный кейс, ответственный не назначен.",
    status: "Просрочен",
    priority: "Средний",
    timeline: ["Вчера 18:12 — Зафиксирован рост аммиака", "Вчера 18:42 — Истек SLA первичной реакции", "Сегодня — Инцидент без движения"],
    chartTitle: "Концентрация NH3 (ppm)",
    chartType: "line",
    chart: [
      { t: "17:30", nh3: 8.2, limit: 10 },
      { t: "18:00", nh3: 9.6, limit: 10 },
      { t: "18:30", nh3: 10.4, limit: 10 },
      { t: "19:00", nh3: 11.3, limit: 10 },
      { t: "19:30", nh3: 11.8, limit: 10 },
    ],
    notes: ["Последняя замена подстилки: 5 дней назад", "Влажность подстилки: 39%"],
    actions: ["Назначить ответственного", "Запросить проверку вентиляции", "Повысить приоритет"],
  },
}

export default function IncidentDetailsPage() {
  const params = useParams<{ incidentId: string }>()
  const incident = incidentDetails[params.incidentId]

  if (!incident) {
    return (
      <main className="min-h-screen bg-background px-4 py-5 md:px-8">
        <div className="mx-auto max-w-[1000px] rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-lg font-medium text-zinc-900">Инцидент не найден</p>
          <Link href="/incidents" className="mt-3 inline-flex text-sm text-zinc-600 hover:text-zinc-900">
            Вернуться к списку
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 md:px-8">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Link href="/incidents" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
              <ArrowLeft className="size-4" />К списку инцидентов
            </Link>
            <h1 className="text-2xl font-semibold text-zinc-900">{incident.id}: {incident.title}</h1>
            <p className="text-sm text-zinc-600">{incident.context}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-zinc-300 bg-zinc-100 text-zinc-700">{incident.status}</Badge>
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">{incident.priority}</Badge>
          </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">{incident.chartTitle}</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {incident.chartType === "bar" ? (
                <BarChart data={incident.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : incident.chartType === "combined" ? (
                <BarChart data={incident.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="water" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="feed" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Line dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line dataKey="rpm" stroke="#6366f1" strokeWidth={2} dot={false} />
                </BarChart>
              ) : (
                <LineChart data={incident.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line dataKey="normTop" stroke="#16a34a" strokeDasharray="4 4" dot={false} />
                  <Line dataKey="normBottom" stroke="#16a34a" strokeDasharray="4 4" dot={false} />
                  <Line dataKey="mortality" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line dataKey="nh3" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line dataKey="limit" stroke="#eab308" strokeDasharray="4 4" dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">Хронология</h2>
            <div className="space-y-2 text-sm text-zinc-700">
              {incident.timeline.map((item) => (
                <p key={item} className="rounded-md bg-zinc-50 px-3 py-2">{item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">Расширенный контекст</h2>
            <div className="space-y-2 text-sm text-zinc-700">
              {incident.notes.map((item) => (
                <p key={item} className="rounded-md bg-zinc-50 px-3 py-2">{item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">Действия</h2>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-zinc-950 text-white hover:bg-zinc-800"><MessageSquare className="size-4" />Открыть чат</Button>
            <Button variant="outline"><RefreshCcw className="size-4" />Переоткрыть</Button>
            <Button variant="outline"><Download className="size-4" />Скачать отчет</Button>
            <Button variant="outline"><Link2 className="size-4" />Создать связанный</Button>
            <Button variant="outline"><UserPlus className="size-4" />Назначить ответственного</Button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Рекомендованные для этого инцидента действия: {incident.actions.join(", ")}.</p>
        </section>
      </div>
    </main>
  )
}
