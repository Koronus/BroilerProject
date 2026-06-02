import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

// GET /api/tasks - получить все задачи
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const incidentId = searchParams.get('incidentId')
  
  let url = "/api/v1/tasks"
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (incidentId) params.append('incidentId', incidentId)
  if (params.toString()) url += `?${params.toString()}`
  
  const response = await springApi(url)
  const body = await response.text()

  return new Response(body || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}

// POST /api/tasks - создать задачу
export async function POST(request: Request) {
  const body = await request.text()
  const response = await springApi("/api/v1/tasks", {
    method: "POST",
    body: body || undefined,
  })
  const responseBody = await response.text()

  return new Response(responseBody || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}