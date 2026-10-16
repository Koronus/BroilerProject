import type { BatchPassportResponse, PassportMetric, PassportStatus } from "@/lib/batch-passport"

export const noData = "Нет данных"

export const metricTypeLabels: Record<string, string> = {
  TEMPERATURE: "Температура",
  HUMIDITY: "Влажность",
  CO2: "Углекислый газ",
  AMMONIA: "Аммиак",
  VENTILATION: "Вентиляция",
  LIGHT: "Освещённость",
  WEIGHT: "Средний вес",
  FEED_CONVERSION: "Конверсия корма",
  FEED_CONSUMPTION: "Потребление корма",
  WATER_FLOW: "Потребление воды",
  MORTALITY: "Смертность",
}

export const statusMeta: Record<PassportStatus, { label: string; className: string; dot: string }> = {
  NORMAL: {
    label: "В норме",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  WARNING: {
    label: "Требует внимания",
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  CRITICAL: {
    label: "Критично",
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
    dot: "bg-red-500",
  },
  UNKNOWN: {
    label: "Нет данных",
    className: "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
}

export function formatNumber(value: number | null, maximumFractionDigits = 1) {
  if (value === null) return noData
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits }).format(value)
}

export function formatMetricValue(value: number | null, unit: string | null) {
  if (value === null) return noData
  const formatted = formatNumber(value)
  return unit ? `${formatted} ${unit}` : formatted
}

export function formatDate(value: string | null) {
  if (!value) return noData

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnly && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
    return `${dateOnly[3]}.${dateOnly[2]}.${dateOnly[1]}`
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? noData : date.toLocaleDateString("ru-RU")
}

export function formatDateTime(value: string | null) {
  if (!value) return noData
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? noData
    : date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
}

export function getAllMetrics(passport: BatchPassportResponse): PassportMetric[] {
  return [
    ...passport.kpis,
    ...passport.microclimate,
    ...passport.lighting.illuminance,
    ...passport.consumption.feed,
    ...passport.consumption.water,
    ...passport.mortality,
  ]
}

export const issueLabels: Record<string, string> = {
  HATCH_DATE_MISSING: "Дата вывода не указана: возраст рассчитан с даты посадки",
  TELEMETRY_UNAVAILABLE: "Телеметрия временно недоступна",
  SENSOR_NOT_ASSIGNED: "Для показателя не назначен датчик",
  MISSING_SENSOR: "Часть назначенных датчиков больше недоступна",
  NORM_NOT_CONFIGURED: "Для показателя не настроен утверждённый норматив",
  NO_READINGS: "За период партии нет показаний",
  INVALID_READINGS: "Часть показаний или временных меток некорректна",
  LIGHTING_SCHEDULE_MISSING: "Нет данных о соблюдении светового режима за период партии",
  PLACEMENT_DATE_MISSING: "Дата посадки не указана",
  INVALID_DATE: "Дата начала выращивания позже даты формирования паспорта",
  EMPTY_PERIOD: "У партии пока нет периода наблюдения",
  INVALID_POPULATION: "Данные о поголовье отсутствуют или противоречат друг другу",
  MISSING_FIELD: "Обязательное значение не указано",
  INVALID_TIME_ZONE: "Указан некорректный часовой пояс; использован часовой пояс приложения",
}
