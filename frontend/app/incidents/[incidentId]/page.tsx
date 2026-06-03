"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Download, ExternalLink, Link2, MessageSquare, RefreshCcw, UserPlus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type DetailData = {
  id: string
  title: string
  context: string
  status: string
  priority: string
  timeline: string[]
  metricContextTitle: string
  metricId: string
  metricSnapshot: string[]
  notes: string[]
  actions: string[]
}

type StoredIncident = {
  id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  workshop: string
  poultryHouse: string
  zone: string
  responsible: string
  metricId: string
  metricLabel: string
  createdAt: string
}

const incidentDetails: Record<string, DetailData> = {
  "INC-1": {
    id: "INC-1",
    title: "Критический перегрев зоны посадки",
    context: "Инцидент высшего приоритета, в работе у Иванова.",
    status: "В работе",
    priority: "Критический",
    timeline: ["10:20 — Фиксация отклонения датчиком", "10:38 — Создание инцидента системой", "10:40 — Иванов взял задачу в работу", "10:45 — Добавлен комментарий об открытии заслонок"],
    metricContextTitle: "Показатель: температура зоны посадки",
    metricId: "temperature_21_30",
    metricSnapshot: ["Норма: 39.4-40.5°C", "Пик: 41.3°C", "Отклонение длилось 18 минут"],
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
    metricContextTitle: "Показатель: падеж",
    metricId: "mortality_21_30",
    metricSnapshot: ["Цех 1 / Птичник 2", "Сегодня: 37 голов", "Требуется ветеринарный осмотр"],
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
    metricContextTitle: "Показатель: потребление воды",
    metricId: "water_intake_21_30",
    metricSnapshot: ["Цех 3 / Птичник 1", "Тренд: снижение", "Гипотеза: падение давления в линии поения"],
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
    metricContextTitle: "Показатель: состояние вентилятора",
    metricId: "temperature_21_30",
    metricSnapshot: ["Ошибка контроллера: 09:00", "Перезапуск: 09:25", "Контрольный период пройден"],
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
    metricContextTitle: "Показатель: аммиак",
    metricId: "ammonia_21_30",
    metricSnapshot: ["Верхняя граница: 10 ppm", "Факт: выше нормы", "SLA первичной реакции нарушен"],
    notes: ["Последняя замена подстилки: 5 дней назад", "Влажность подстилки: 39%"],
    actions: ["Назначить ответственного", "Запросить проверку вентиляции", "Повысить приоритет"],
  },
}

export default function IncidentDetailsPage() {
  const params = useParams<{ incidentId: string }>()
  const [storedIncident] = useState<StoredIncident | null>(() => {
    const savedIncidents = JSON.parse(window.localStorage.getItem("createdIncidents") ?? "{}")
    return savedIncidents[params.incidentId] ?? null
  })

  const incident =
    incidentDetails[params.incidentId] ??
    (storedIncident
      ? {
          id: storedIncident.id,
          title: storedIncident.title,
          context: `${storedIncident.description} Локация: ${storedIncident.workshop} / ${storedIncident.poultryHouse} / ${storedIncident.zone}. Ответственный: ${storedIncident.responsible}.`,
          status: storedIncident.status,
          priority: storedIncident.priority,
          timeline: [
            `${storedIncident.createdAt} — Инцидент создан вручную`,
            "Система — Ожидается первичная реакция ответственного",
          ],
          metricContextTitle: `Показатель: ${storedIncident.metricLabel}`,
          metricId: storedIncident.metricId,
          metricSnapshot: [
            `Категория: ${storedIncident.type}`,
            `Локация: ${storedIncident.poultryHouse}`,
            `Зона: ${storedIncident.zone}`,
          ],
          notes: [
            storedIncident.description,
            `Ответственный: ${storedIncident.responsible}`,
            "Детальные графики доступны в технических показателях.",
          ],
          actions: ["Взять в работу", "Назначить ответственного", "Закрыть после проверки"],
        }
      : {
          id: params.incidentId,
          title: "Новый инцидент",
          context: "Инцидент создан, подробности будут заполнены после синхронизации с реестром.",
          status: "Новый",
          priority: "Средний",
          timeline: ["Система — карточка создана", "Ожидается заполнение деталей"],
          metricContextTitle: "Показатель: состояние стада",
          metricId: "mortality_21_30",
          metricSnapshot: ["Данные уточняются", "Связь с показателем предварительная", "Требуется проверка"],
          notes: ["Описание пока не заполнено.", "Можно вернуться в реестр и уточнить инцидент."],
          actions: ["Назначить ответственного", "Добавить комментарий", "Закрыть после проверки"],
        })

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
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">{incident.metricContextTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {incident.metricSnapshot.map((item) => (
              <div key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-800">
                {item}
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-3">
            <Link href={`/?section=technical&metric=${incident.metricId}`}>
              <ExternalLink className="size-4" />
              Открыть график показателя
            </Link>
          </Button>
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
