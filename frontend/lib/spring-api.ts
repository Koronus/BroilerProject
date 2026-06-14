const DEFAULT_SPRING_API_URL = "http://localhost:8080"

export async function springApi(path: string, init?: RequestInit) {
  const baseUrl = process.env.SPRING_API_URL ?? DEFAULT_SPRING_API_URL
  const headers = new Headers(init?.headers)
  const hasFormDataBody =
    typeof FormData !== "undefined" && init?.body instanceof FormData

  if (!hasFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })
}
