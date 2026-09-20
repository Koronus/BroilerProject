import analyticsFixture from "@/data/analytics-response.json"
import type { IncidentAnalyticsResponse } from "@/lib/incident-analytics"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedDays = Number(searchParams.get("periodDays"))
  const periodDays = requestedDays === 30 ? 30 : 7
  const workshop = searchParams.get("workshop") || null
  const house = searchParams.get("house") || null
  const slaMinutes = Number(searchParams.get("slaMinutes")) || 30
  const fixture = analyticsFixture as IncidentAnalyticsResponse
  const periodTo = new Date(fixture.period.to)
  const periodFrom = new Date(periodTo)

  periodFrom.setDate(periodFrom.getDate() - periodDays)

  return Response.json({
    ...fixture,
    period: {
      from: periodFrom.toISOString(),
      to: periodTo.toISOString(),
      days: periodDays,
    },
    filters: { workshop, house, slaMinutes },
  } satisfies IncidentAnalyticsResponse)
}
