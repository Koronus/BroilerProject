import { springApi } from "@/lib/spring-api"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const response = await springApi(`/api/v1/telemetry/readings${request.nextUrl.search}`)
  const body = await response.text()

  return new Response(body || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}
