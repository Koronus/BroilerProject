const DEFAULT_SPRING_API_URL = "http://localhost:8080"

export async function springApi(path: string, init?: RequestInit) {
  const baseUrl = process.env.SPRING_API_URL ?? DEFAULT_SPRING_API_URL

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  })
}
