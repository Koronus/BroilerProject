"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertCircle, RefreshCcw } from "lucide-react"


import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchBatchPassport,
  type BatchPassportResponse,
} from "@/lib/batch-passport"
import { fetchBatches, type BatchListItem } from "@/lib/batch"
import { BatchPassportHeader } from "./batch-passport-header"
import { BatchPassportKpi } from "./batch-passport-kpi"
import { BatchPassportSummary } from "./batch-passport-summary"
import { BatchPassportIncidents } from "./batch-passport-incidents"
import { BatchPassportTasks } from "./batch-passport-tasks"
import { BatchPassportNotifications } from "./batch-passport-notifications"

import { batches as frontendBatches } from "@/lib/production-filters"
import { batchStatusLabels as statusLabels} from "@/lib/batch-labels"

export function BatchPassportPage() {
  const [batches, setBatches] = useState<BatchListItem[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>("")
  const [passport, setPassport] = useState<BatchPassportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Читаем batchId из URL
  useEffect(() => {
  const controller = new AbortController()

  fetchBatches(controller.signal)
    .then((data) => {
      setBatches(data)

      // Читаем URL
      const params = new URLSearchParams(window.location.search)
      const batchNumber = params.get("batchNumber")
      const batchId = params.get("batchId")

      // Приоритет: batchId → batchNumber → первая партия
      let targetId = ""

      if (batchId) {
        targetId = batchId
      } else if (batchNumber) {
        const found = data.find((b) => b.batchNumber === batchNumber)
        if (found) targetId = found.id
      }

      setSelectedBatchId(targetId || data[0]?.id || "")
    })
    .catch((e) => {
      if (e.name !== "AbortError") setError(e.message)
    })

  return () => controller.abort()
}, [])

  const loadPassport = useCallback(
    async (signal?: AbortSignal) => {
      if (!selectedBatchId) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchBatchPassport(selectedBatchId, signal)
        setPassport(data)
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message)
        }
      } finally {
        setLoading(false)
      }
    },
    [selectedBatchId]
  )

  useEffect(() => {
    const controller = new AbortController()
    void loadPassport(controller.signal)
    return () => controller.abort()
  }, [loadPassport])

  if (error && !passport) {
    return (
      <div className="p-4">
        <div className="dashboard-panel flex min-h-80 flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="size-10 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold">Паспорт недоступен</h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">{error}</p>
          <Button className="mt-5" onClick={() => void loadPassport()}>
            <RefreshCcw className="size-4" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="space-y-4 p-3 md:p-4">
      <section className="dashboard-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Паспорт партии</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Единая карточка партии: показатели, инциденты, задачи, итоговая оценка
            </p>
          </div>

          <label className="flex min-w-0 flex-col gap-1.5 md:w-80">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Выбор партии
            </span>
            <select
              value={selectedBatchId}
              onChange={(event) => setSelectedBatchId(event.target.value)}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
            >
              {batches.length === 0 && <option value="">Нет партий</option>}
             
              {batches.map((batch) => {
                const frontend = frontendBatches.find((b) => b.batchNumber === batch.batchNumber)
                const label = frontend?.label ?? batch.batchNumber
                const statusLabel = statusLabels[batch.status ?? ""] ?? batch.status ?? "—"
                return (
                  <option key={batch.id} value={batch.id}>
                    {label} — {batch.house ?? "—"} ({statusLabel})
                  </option>
                )
              })}
            </select>
          </label>
        </div>
      </section>

      {loading && !passport && <BatchPassportSkeleton />}

      {passport && (
        <>
          <BatchPassportHeader batch={passport.batch} ageDays={passport.ageDays} />
          <BatchPassportKpi kpi={passport.kpi} />
          <BatchPassportSummary summary={passport.summary} />
          <BatchPassportIncidents incidents={passport.incidents} />
          <BatchPassportTasks tasks={passport.tasks} />
          <BatchPassportNotifications notifications={passport.notifications} />
        </>
      )}

      {!loading && !passport && !error && (
        <section className="dashboard-panel p-8 text-center text-sm text-zinc-500">
          Выберите партию, чтобы открыть паспорт.
        </section>
      )}
    </main>
  )
}

function BatchPassportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}