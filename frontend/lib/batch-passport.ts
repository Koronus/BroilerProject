/** Contract v1.0 for GET /api/batches/:batchId/passport. No fixture fallback. */
export type PassportStatus = "NORMAL" | "WARNING" | "CRITICAL" | "UNKNOWN"
export type PassportMetricType =
  | "TEMPERATURE" | "HUMIDITY" | "CO2" | "AMMONIA" | "VENTILATION"
  | "LIGHT" | "WEIGHT" | "FEED_CONVERSION" | "FEED_CONSUMPTION" | "WATER_FLOW" | "MORTALITY"

export interface PassportMetric {
  type: PassportMetricType
  unit: string | null
  sampleCount: number
  average: number | null
  minimum: number | null
  maximum: number | null
  latest: number | null
  latestAt: string | null
  norm: { minimum: number | null; maximum: number | null } | null
  deviationCount: number | null
  status: PassportStatus
}

export interface BatchPassportResponse {
  schemaVersion: "1.0"
  generatedAt: string
  batch: {
    id: string; batchNumber: string; status: string | null
    workshop: string | null; house: string | null; zone: string | null
    placementDate: string | null; closeDate: string | null
    initialBirdCount: number | null; currentBirdCount: number | null
    origin: string | null; cross: string | null
    createdAt: string; updatedAt: string | null
    timeZone: string; hatchDate: string | null; farm: string | null
  }
  ageDays: number | null
  ageBasis: "HATCH_DATE" | "PLACEMENT_DATE"
  kpi: {
    initialBirdCount: number | null; currentBirdCount: number | null
    mortality: number | null; survivalRate: number | null
    totalIncidents: number; criticalIncidents: number; openTasks: number
  }
  summary: { status: "OK" | "WARNING" | "CRITICAL" | "UNKNOWN"; risks: string[]; recommendations: string[] }
  period: { from: string | null; to: string; timeZone: string }
  kpis: PassportMetric[]
  microclimate: PassportMetric[]
  lighting: {
    illuminance: PassportMetric[]
    schedule: {
      sampleCount: number
      averageCompliancePercent: number | null
      minimumCompliancePercent: number | null
      maximumCompliancePercent: number | null
      latestCompliancePercent: number | null
      scheduledLightMinutes: number | null
      actualLightMinutes: number | null
      scheduledDarkMinutes: number | null
      actualDarkMinutes: number | null
      deviationMinutes: number | null
      latestAt: string | null
      status: PassportStatus
    }
  }
  consumption: { feed: PassportMetric[]; water: PassportMetric[] }
  mortality: PassportMetric[]
  incidents: Array<{ id: string; code: string; title: string; status: string | null; priority: string | null; type: string | null; createdAt: string | null; startedAt: string | null; reactionMinutes: number | null }>
  notifications: Array<{ id: string; code: string; title: string; status: string | null; priority: string | null; createdAt: string | null }>
  tasks: Array<{ id: string; nameTask: string; status: string | null; priority: string; responsible: string; termTask: string | null }>
  attachments: Array<{ id: string; incidentId: string; fileName: string; contentType: string; sizeBytes: number; mediaType: string; createdAt: string; contentPath: string }>
  aggregates: {
    incidentCount: number; criticalIncidentCount: number; activeCriticalIncidentCount: number
    openTaskCount: number; deviationCount: number | null; deviationsComplete: boolean
  }
  status: PassportStatus
  dataQuality: { complete: boolean; issues: Array<{ code: string; field: string; message: string }> }
}

export class BatchPassportRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "BatchPassportRequestError"
  }
}

export async function fetchBatchPassport(batchId: string, signal?: AbortSignal): Promise<BatchPassportResponse> {
  const response = await fetch(`/api/batches/${encodeURIComponent(batchId)}/passport`, { cache: "no-store", signal })
  if (!response.ok) {
    throw new BatchPassportRequestError(
      response.status === 404
        ? "Партия не найдена"
        : "Не удалось получить паспорт партии. Проверьте доступность API.",
      response.status,
    )
  }
  return response.json() as Promise<BatchPassportResponse>
}
