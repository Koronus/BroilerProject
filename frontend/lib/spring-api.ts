const DEFAULT_SPRING_API_URL = "http://130.193.41.107:8081"

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
