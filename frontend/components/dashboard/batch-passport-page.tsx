"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { AlertCircle, DatabaseZap, FileQuestion, RefreshCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BatchPassportRequestError,
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
import { BatchPassportStages } from "./batch-passport-stages"
import { BatchPassportDeviations, BatchPassportMetrics } from "./batch-passport-metrics"
import { BatchPassportDataQuality } from "./batch-passport-data-quality"
import { batchStatusLabels } from "@/lib/batch-labels"

type PassportError = { status: number | null; message: string }

export function BatchPassportPage({ onOpenIncident }: { onOpenIncident?: (incidentId: string) => void }) {
  const [batches, setBatches] = useState<BatchListItem[]>([])
  const [batchesLoading, setBatchesLoading] = useState(true)
  const [batchesError, setBatchesError] = useState<string | null>(null)
  const [batchesRetry, setBatchesRetry] = useState(0)
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectionNotFound, setSelectionNotFound] = useState(false)
  const [passport, setPassport] = useState<BatchPassportResponse | null>(null)
  const [passportLoading, setPassportLoading] = useState(false)
  const [passportError, setPassportError] = useState<PassportError | null>(null)
  const [passportRetry, setPassportRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setBatchesLoading(true)
    setBatchesError(null)
    fetchBatches(controller.signal)
      .then((data) => {
        if (!active) return
        setBatches(data)

        const params = new URLSearchParams(window.location.search)
        const batchId = params.get("batchId")?.trim()
        const batchNumber = params.get("batchNumber")?.trim()

        if (batchId) {
          setSelectedBatchId(batchId)
          setSearchQuery(batchNumber ?? batchId)
          return
        }

        if (batchNumber) {
          const found = data.find((batch) => batch.batchNumber.toLowerCase() === batchNumber.toLowerCase())
          if (found) {
            setSelectedBatchId(found.id)
            setSearchQuery(found.batchNumber)
          } else {
            setSelectionNotFound(true)
            setSearchQuery(batchNumber)
          }
          return
        }

        if (data[0]) {
          setSelectedBatchId(data[0].id)
          setSearchQuery(data[0].batchNumber)
        }
      })
      .catch((error: unknown) => {
        if (active && (!(error instanceof Error) || error.name !== "AbortError")) {
          setBatchesError("Не удалось загрузить список партий. Проверьте доступность API.")
        }
      })
      .finally(() => {
        if (active) setBatchesLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [batchesRetry])

  useEffect(() => {
    if (!selectedBatchId) {
      setPassport(null)
      return
    }

    const controller = new AbortController()
    let active = true
    setPassport(null)
    setPassportError(null)
    setPassportLoading(true)

    fetchBatchPassport(selectedBatchId, controller.signal)
      .then((data) => {
        if (active) setPassport(data)
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof Error && error.name === "AbortError")) return
        if (error instanceof BatchPassportRequestError) {
          setPassportError({ status: error.status, message: error.message })
        } else {
          setPassportError({ status: null, message: "Не удалось получить паспорт партии. Проверьте доступность API." })
        }
      })
      .finally(() => {
        if (active) setPassportLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [selectedBatchId, passportRetry])

  const filteredBatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return batches
    return batches.filter(
      (batch) => batch.batchNumber.toLowerCase().includes(query) || batch.id.toLowerCase().includes(query),
    )
  }, [batches, searchQuery])

  const selectBatch = (batch: BatchListItem) => {
    setSelectionNotFound(false)
    setSearchQuery(batch.batchNumber)
    setSelectedBatchId(batch.id)

    const params = new URLSearchParams(window.location.search)
    params.set("section", "batches")
    params.set("batchId", batch.id)
    params.set("batchNumber", batch.batchNumber)
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`)
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchQuery.trim().toLowerCase()
    const exact = batches.find(
      (batch) => batch.id.toLowerCase() === query || batch.batchNumber.toLowerCase() === query,
    )
    const match = exact ?? (filteredBatches.length === 1 ? filteredBatches[0] : undefined)

    if (match) {
      selectBatch(match)
    } else {
      setSelectedBatchId("")
      setPassport(null)
      setSelectionNotFound(true)
    }
  }

  return (
    <main className="space-y-4 p-3 md:p-4">
      <section className="dashboard-panel p-5 md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Ситуационный центр</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Паспорт партии</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Единая автоматически сформированная карточка происхождения, состояния и событий партии.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(280px,1fr)_minmax(300px,1fr)] xl:w-[760px]">
            <form onSubmit={handleSearch} className="space-y-1.5">
              <label htmlFor="batch-passport-search" className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Поиск по номеру или batchId
              </label>
              <div className="flex gap-2">
                <Input
                  id="batch-passport-search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setSelectionNotFound(false)
                  }}
                  placeholder="BATCH-2026-001 или UUID"
                  className="h-10 bg-white dark:bg-white/5"
                />
                <Button type="submit" variant="outline" size="icon" aria-label="Найти партию">
                  <Search className="size-4" />
                </Button>
              </div>
            </form>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Из списка партий</span>
              <select
                value={batches.some((batch) => batch.id === selectedBatchId) ? selectedBatchId : ""}
                disabled={batchesLoading || Boolean(batchesError)}
                onChange={(event) => {
                  const batch = batches.find((item) => item.id === event.target.value)
                  if (batch) selectBatch(batch)
                }}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              >
                <option value="">{batchesLoading ? "Загрузка…" : "Выберите партию"}</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchNumber} · {batch.house ?? "Нет данных"} · {batchStatusLabels[batch.status ?? ""] ?? batch.status ?? "Нет данных"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {selectedBatchId && <p className="mt-3 break-all text-xs text-zinc-400">batchId: {selectedBatchId}</p>}
      </section>

      {batchesError ? (
        <StatePanel icon={DatabaseZap} title="Ошибка API" description={batchesError} actionLabel="Повторить" onAction={() => setBatchesRetry((value) => value + 1)} />
      ) : batchesLoading || passportLoading ? (
        <BatchPassportSkeleton />
      ) : selectionNotFound || passportError?.status === 404 || (!selectedBatchId && batches.length === 0) ? (
        <StatePanel icon={FileQuestion} title="Партия не найдена" description="Проверьте номер партии или batchId и повторите поиск." />
      ) : passportError ? (
        <StatePanel icon={AlertCircle} title="Ошибка API" description={passportError.message} actionLabel="Повторить" onAction={() => setPassportRetry((value) => value + 1)} />
      ) : passport ? (
        <article className="dashboard-panel overflow-hidden">
          <BatchPassportHeader passport={passport} />
          <BatchPassportDataQuality dataQuality={passport.dataQuality} />
          <BatchPassportKpi kpi={passport.kpi} aggregates={passport.aggregates} />
          <BatchPassportStages passport={passport} />
          <BatchPassportMetrics passport={passport} />
          <BatchPassportDeviations passport={passport} />
          <BatchPassportIncidents incidents={passport.incidents} onOpenIncident={onOpenIncident} />
          <BatchPassportNotifications notifications={passport.notifications} />
          <BatchPassportTasks tasks={passport.tasks} />
          <BatchPassportSummary summary={passport.summary} status={passport.status} generatedAt={passport.generatedAt} />
        </article>
      ) : (
        <StatePanel icon={FileQuestion} title="Выберите партию" description="Найдите партию по номеру, batchId или выберите её из списка." />
      )}
    </main>
  )
}

function StatePanel({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: typeof AlertCircle
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <section className="dashboard-panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-300"><Icon className="size-7" /></span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-500">{description}</p>
      {actionLabel && onAction && <Button className="mt-5" onClick={onAction}><RefreshCcw className="size-4" />{actionLabel}</Button>}
    </section>
  )
}

function BatchPassportSkeleton() {
  return (
    <div className="dashboard-panel space-y-5 overflow-hidden p-5 md:p-6" aria-label="Загрузка паспорта партии">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" /></div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}</div>
      <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-2xl" />)}</div>
    </div>
  )
}
