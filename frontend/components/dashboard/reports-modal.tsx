// components/dashboard/reports-modal.tsx
"use client"

import { FileText, FileSpreadsheet, Printer, FileJson, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportsModalProps {
  isOpen: boolean
  onClose: () => void
  onFullReport: () => void
  onPDFReport: () => void
  onExcelReport?: () => void
  onPrintReport?: () => void
  onJSONReport?: () => void
}

export function ReportsModal({ 
  isOpen, 
  onClose, 
  onFullReport,
  onPDFReport,
  onExcelReport,
  onPrintReport,
  onJSONReport
}: ReportsModalProps) {
  if (!isOpen) return null

  const reports = [
    {
      id: "full",
      title: "Полный отчет",
      description: "Вся информация по текущим фильтрам и показателям",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      onClick: onFullReport
    },
    {
      id: "pdf",
      title: "PDF отчет",
      description: "Компактный PDF для печати или отправки",
      icon: FileText,
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
      onClick: onPDFReport
    },
    {
      id: "excel",
      title: "Excel отчет",
      description: "Данные для анализа в таблицах",
      icon: FileSpreadsheet,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      onClick: onExcelReport || (() => alert("Excel отчет в разработке"))
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b border-black/5 p-5 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              📄 Генерация отчетов
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Выберите тип отчета для формирования документа
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/8"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Список отчетов */}
        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => {
              const Icon = report.icon
              return (
                <button
                  key={report.id}
                  onClick={() => {
                    report.onClick()
                    onClose()
                  }}
                  className="group flex items-start gap-4 rounded-xl border border-black/5 p-4 text-left transition-all hover:border-black/10 hover:shadow-md dark:border-white/10 dark:hover:bg-white/5"
                >
                  <div className={`rounded-full p-3 ${report.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {report.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {report.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Подвал */}
        <div className="border-t border-black/5 p-4 dark:border-white/10">
          <p className="text-center text-xs text-zinc-400">
            Выберите тип отчета — документ будет сгенерирован автоматически
          </p>
        </div>
      </div>
    </div>
  )
}