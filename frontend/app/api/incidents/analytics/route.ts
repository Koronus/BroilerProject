import analyticsFixture from "@/data/analytics-response.json"
import type { IncidentAnalyticsResponse } from "@/lib/incident-analytics"
import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

const BACKEND_TIMEOUT_MS = 3000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Валидация на фронте — быстрый 400 без похода в backend
  const requestedDays = Number(searchParams.get("periodDays"))
  const periodDays = requestedDays === 30 ? 30 : 7

  const slaMinutes = Number(searchParams.get("slaMinutes")) || 30
  if (slaMinutes !== 30) {
    return Response.json(
      { error: "slaMinutes must be 30" },
      { status: 400 }
    )
  }

  const workshop = searchParams.get("workshop") || null
  const house = searchParams.get("house") || null

  // Собираем query для backend
  const backendParams = new URLSearchParams()
  backendParams.set("periodDays", String(periodDays))
  backendParams.set("slaMinutes", String(slaMinutes))
  if (workshop) backendParams.set("workshop", workshop)
  if (house) backendParams.set("house", house)

  const path = `/api/v1/incidents/analytics?${backendParams.toString()}`

  try {
    const response = await withTimeout(
      springApi(path),
      BACKEND_TIMEOUT_MS
    )

    // Если backend ответил 5xx — тоже уходим в fallback
    if (response.status >= 500) {
      console.warn(
        `[analytics] backend returned ${response.status}, using mock fallback`
      )
      return buildMockResponse({ periodDays, workshop, house, slaMinutes })
    }

    const body = await response.text()

    return new Response(body || null, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "x-analytics-source": "backend",
      },
    })
  } catch (error) {
    console.warn(
      "[analytics] backend unavailable, using mock fallback:",
      error instanceof Error ? error.message : error
    )
    return buildMockResponse({ periodDays, workshop, house, slaMinutes })
  }
}

// ── helpers ────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ])
}

function buildMockResponse({
  periodDays,
  workshop,
  house,
  slaMinutes,
}: {
  periodDays: 7 | 30
  workshop: string | null
  house: string | null
  slaMinutes: number
}) {
  const fixture = analyticsFixture as IncidentAnalyticsResponse
  const periodTo = new Date()
  const periodFrom = new Date(periodTo)
  periodFrom.setDate(periodFrom.getDate() - periodDays)

  return Response.json(
    {
      ...fixture,
      period: {
        from: periodFrom.toISOString(),
        to: periodTo.toISOString(),
        days: periodDays,
      },
      filters: { workshop, house, slaMinutes },
    } satisfies IncidentAnalyticsResponse,
    {
      status: 200,
      headers: {
        "x-analytics-source": "mock",
      },
    }
  )
}