import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ notificationId: string }> },
) {
  const { notificationId } = await context.params
  const body = await request.text()
  const response = await springApi(`/api/v1/notification/${notificationId}/status`, {
    method: "PATCH",
    body,
  })
  const responseBody = await response.text()

  return new Response(responseBody || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}
