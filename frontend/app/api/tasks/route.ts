// app/api/tasks/route.ts
import { springApi } from "@/lib/spring-api"

export const dynamic = "force-dynamic"

// GET /api/tasks - получить все задачи или с фильтрацией
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Получаем параметры фильтрации
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const responsible = searchParams.get('responsible')
  const nameIndicator = searchParams.get('nameIndicator')
  const metricId = searchParams.get('metricId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  
  // Строим URL для Spring бэкенда
  let url = "/api/v1/task"
  const params = new URLSearchParams()
  
  if (status) params.append('status', status.toUpperCase())
  if (priority) params.append('priority', priority.toUpperCase())
  if (responsible) params.append('responsible', responsible)
  if (nameIndicator) params.append('nameIndicator', nameIndicator)
  if (dateFrom) params.append('dateFrom', dateFrom)
  if (dateTo) params.append('dateTo', dateTo)
  
  // Если есть параметры, используем /filter эндпоинт
  if (params.toString()) {
    url += `/filter?${params.toString()}`
  }
  
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
  
  const response = await springApi("/api/v1/task", {
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

// PUT /api/tasks/:id - обновить задачу
export async function PUT(request: Request) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  const body = await request.text()
  
  const response = await springApi(`/api/v1/task/${id}`, {
    method: "PUT",
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

// DELETE /api/tasks/:id - удалить задачу
export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  
  const response = await springApi(`/api/v1/task/${id}`, {
    method: "DELETE",
  })
  
  const responseBody = await response.text()
  
  return new Response(responseBody || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  })
}