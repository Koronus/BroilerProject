import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const response = await springApi("/api/v1/batches", {
      signal: AbortSignal.timeout(15_000),
    })
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return Response.json({ error: "Batches backend is unavailable" }, { status: 502 })
  }
}