import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  context: { params: Promise<{ incidentId: string }> },
) {
  const { incidentId } = await context.params
  const path = uuidPattern.test(incidentId)
    ? `/api/v1/incident/${encodeURIComponent(incidentId)}`
    : `/api/v1/incident/code/${encodeURIComponent(incidentId)}`

  try {
    const response = await springApi(path, { signal: AbortSignal.timeout(15_000) })
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return Response.json({ error: "Incident backend is unavailable" }, { status: 502 })
  }
}
