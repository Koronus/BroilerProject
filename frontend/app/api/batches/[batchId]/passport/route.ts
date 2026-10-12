import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  context: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await context.params
  try {
    const response = await springApi(`/api/v1/batches/${encodeURIComponent(batchId)}/passport`, {
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
    return Response.json({ error: "Batch passport backend is unavailable" }, { status: 502 })
  }
}
