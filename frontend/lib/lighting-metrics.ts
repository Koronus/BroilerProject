export interface LightingTelemetryReading {
  sensorCode: string
  value: number
  unit: string
  measuredAt: string
}

export type LightingMetricKind = "min" | "max" | "avg" | "uniformity"
export type LightingTelemetryBySensorCode = Record<string, LightingTelemetryReading[]>
export type LightingStatus = "normal" | "warning" | "critical"

interface Range {
  min?: number
  max?: number
  criticalMin?: number
  criticalMax?: number
}

export const LIGHTING_SENSOR_CODES = [
  "LIGHT-01",
  "LIGHT-02",
  "LIGHT-03",
  "LIGHT-04",
  "LIGHT-05",
] as const

export const LIGHTING_METRIC_KIND_BY_ID: Record<string, LightingMetricKind> = {
  lighting_min_0_3: "min",
  lighting_min_21_30: "min",
  lighting_max_0_3: "max",
  lighting_max_21_30: "max",
  lighting_avg_0_3: "avg",
  lighting_avg_21_30: "avg",
  lighting_uniformity_0_3: "uniformity",
  lighting_uniformity_21_30: "uniformity",
}

const luxRange: Range = { min: 25, max: 40, criticalMin: 15, criticalMax: 50 }
const uniformityRange: Range = { min: 0.7, criticalMin: 0.6 }

export const getLightingMetricKind = (metricId: string) => LIGHTING_METRIC_KIND_BY_ID[metricId]

export const calculateLightingAggregate = (
  telemetry: LightingTelemetryBySensorCode,
  index = 0
) => {
  const values = LIGHTING_SENSOR_CODES
    .map((sensorCode) => telemetry[sensorCode]?.[index]?.value)
    .filter((value): value is number => typeof value === "number")

  if (values.length === 0) {
    return null
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const uniformity = avg > 0 ? min / avg : 0

  return { min, max, avg, uniformity }
}

export const formatLightingMetricValue = (kind: LightingMetricKind, value: number) => {
  if (kind === "uniformity") {
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formattedValue = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value)

  return `${formattedValue} лк`
}

const resolveStatusForRange = (range: Range, value: number): LightingStatus => {
  if (range.criticalMin !== undefined && value < range.criticalMin) return "critical"
  if (range.criticalMax !== undefined && value > range.criticalMax) return "critical"
  if (range.min !== undefined && value < range.min) return "warning"
  if (range.max !== undefined && value > range.max) return "warning"

  return "normal"
}

export const resolveLightingStatus = (kind: LightingMetricKind, value: number): LightingStatus => {
  return resolveStatusForRange(kind === "uniformity" ? uniformityRange : luxRange, value)
}

const formatTelemetryTime = (measuredAt?: string, fallbackIndex = 0) => {
  if (!measuredAt) {
    return `${fallbackIndex + 1}`
  }

  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(measuredAt))
}

export const buildLightingChartData = (
  telemetry: LightingTelemetryBySensorCode,
  kind: LightingMetricKind
): { day: string; value: number }[] => {
  const maxLength = Math.max(...LIGHTING_SENSOR_CODES.map((sensorCode) => telemetry[sensorCode]?.length ?? 0))

  return Array.from({ length: maxLength }, (_, index) => {
    const aggregate = calculateLightingAggregate(telemetry, index)
    if (!aggregate) {
      return null
    }

    const measuredAt = LIGHTING_SENSOR_CODES
      .map((sensorCode) => telemetry[sensorCode]?.[index]?.measuredAt)
      .find(Boolean)
    const value = aggregate[kind]

    return {
      day: formatTelemetryTime(measuredAt, index),
      value: Number(value.toFixed(kind === "uniformity" ? 2 : 1)),
    }
  })
    .filter((item): item is { day: string; value: number } => item !== null)
    .reverse()
}
