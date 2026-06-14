"use client"

import { useState, type ChangeEvent } from "react"
import { Paperclip, UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatAttachmentFileSize } from "@/lib/incident-attachments"
import { cn } from "@/lib/utils"

interface IncidentAttachmentPickerProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
}

const acceptedFilePrefixes = ["image/", "video/"]
const maxFileSizeBytes = 300 * 1024 * 1024

export function IncidentAttachmentPicker({
  files,
  onFilesChange,
  disabled = false,
}: IncidentAttachmentPickerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length === 0) {
      return
    }

    const rejectedFiles: string[] = []
    const nextFiles = [...files]

    selectedFiles.forEach((file) => {
      const hasAcceptedType = acceptedFilePrefixes.some((prefix) => file.type.startsWith(prefix))

      if (!hasAcceptedType) {
        rejectedFiles.push(`${file.name}: только фото или видео`)
        return
      }

      if (file.size > maxFileSizeBytes) {
        rejectedFiles.push(`${file.name}: больше 300 МБ`)
        return
      }

      const alreadySelected = nextFiles.some(
        (selectedFile) =>
          selectedFile.name === file.name &&
          selectedFile.size === file.size &&
          selectedFile.lastModified === file.lastModified,
      )

      if (!alreadySelected) {
        nextFiles.push(file)
      }
    })

    onFilesChange(nextFiles)
    setErrorMessage(rejectedFiles.length > 0 ? rejectedFiles.join("; ") : null)
    event.target.value = ""
  }

  const removeFile = (file: File) => {
    onFilesChange(
      files.filter(
        (selectedFile) =>
          selectedFile.name !== file.name ||
          selectedFile.size !== file.size ||
          selectedFile.lastModified !== file.lastModified,
      ),
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Фото-/видео-материалы</p>
          <p className="mt-1 text-xs text-zinc-500">До 300 МБ на файл, фото и видео</p>
        </div>

        <label
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100",
            disabled && "pointer-events-none opacity-60",
          )}
        >
          <UploadCloud className="size-4" />
          Загрузить
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={disabled}
            onChange={addFiles}
            className="sr-only"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="size-4 shrink-0 text-zinc-500" />
                <span className="truncate text-zinc-800">{file.name}</span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {formatAttachmentFileSize(file.size)}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => removeFile(file)}
                className="size-7 text-zinc-500 hover:text-zinc-900"
                aria-label={`Убрать ${file.name}`}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  )
}
