export interface AnalyticsPeriod {
  from: string
  to: string
  days: number
}

export interface AnalyticsFilters {
  workshop: string | null
  house: string | null
  slaMinutes: number
}

export interface IncidentKpi {
  total: number
  active: number
  critical: number
  avgReactionMinutes: number | null
  medianReactionMinutes: number | null
  reactionMeasuredCount: number
  reactionEligibleCount: number
  slaMetCount: number
  slaBreachedCount: number
  slaPendingCount: number
  slaPercent: number | null
  avgCloseMinutes: number | null
  medianCloseMinutes: number | null
  closeMeasuredCount: number
}

export interface CountBreakdown {
  key: string
  label: string
  count: number
}

export interface HouseAnalytics {
  workshop: string
  house: string
  total: number
  critical: number
  avgReactionMinutes: number | null
  slaMetCount: number
  slaBreachedCount: number
  slaPercent: number | null
  closed: number
}

export interface IncidentAnalyticsResponse {
  period: AnalyticsPeriod
  filters: AnalyticsFilters
  kpi: IncidentKpi
  byType: CountBreakdown[]
  byPriority: CountBreakdown[]
  byStatus: CountBreakdown[]
  byHouse: HouseAnalytics[]
}

export interface IncidentRegistryFilters {
  periodDays: 7 | 30
  workshop?: string
  house?: string
  type?: string
  priority?: string
  status?: string
}

export function formatDuration(minutes: number | null) {
  if (minutes === null) return "Недостаточно данных"
  if (minutes < 60) return `${Math.round(minutes)} мин`

  const roundedMinutes = Math.round(minutes)
  const hours = Math.floor(roundedMinutes / 60)
  const restMinutes = roundedMinutes % 60

  return restMinutes === 0 ? `${hours} ч` : `${hours} ч ${restMinutes} мин`
}

export function formatPercent(value: number | null) {
  if (value === null) return "Недостаточно данных"

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value)}%`
}

export function formatAnalyticsPeriod(period: AnalyticsPeriod) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return `${formatter.format(new Date(period.from))} — ${formatter.format(new Date(period.to))}`
}
