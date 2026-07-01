export interface IncidentAttachment {
  id: string
  incidentId: string
  originalFileName: string
  contentType: string
  sizeBytes: number
  mediaType: string
  createdAt?: string | null
}

export async function uploadIncidentAttachments(incidentId: string | undefined, files: File[]) {
  if (files.length === 0) {
    return []
  }

  if (!incidentId) {
    throw new Error("Не удалось определить созданный инцидент для загрузки материалов")
  }

  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  const response = await fetch(`/api/incidents/${incidentId}/attachments`, {
    method: "POST",
    body: formData,
  })
  const responseBody = await response.text()

  if (!response.ok) {
    throw new Error(responseBody || "Не удалось загрузить фото-/видео-материалы")
  }

  return responseBody ? (JSON.parse(responseBody) as IncidentAttachment[]) : []
}

export function formatAttachmentFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} Б`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}
