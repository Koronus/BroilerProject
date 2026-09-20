import analyticsFixture from "@/data/analytics-response.json"
import type { IncidentAnalyticsResponse } from "@/lib/incident-analytics"
import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

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

  // Собираем query для backend
  const backendParams = new URLSearchParams()
  backendParams.set("periodDays", String(periodDays))
  backendParams.set("slaMinutes", String(slaMinutes))

  const workshop = searchParams.get("workshop")
  const house = searchParams.get("house")
  if (workshop) backendParams.set("workshop", workshop)
  if (house) backendParams.set("house", house)

  const path = `/api/v1/incidents/analytics?${backendParams.toString()}`

  const response = await springApi(path)
  const body = await response.text()

  return new Response(body || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}
