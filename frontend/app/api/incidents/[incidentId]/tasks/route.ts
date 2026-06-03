import { springApi } from "@/lib/spring-api"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - получить задачи для конкретного инцидента
export async function GET(
  request: Request,
  context: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await context.params
  const response = await springApi(`/api/v1/incidents/${incidentId}/tasks`)
  const body = await response.text()

  return new Response(body || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}

// POST - создать задачу для инцидента
export async function POST(
  request: Request,
  context: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await context.params
  const body = await request.text()
  const response = await springApi(`/api/v1/incidents/${incidentId}/tasks`, {
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