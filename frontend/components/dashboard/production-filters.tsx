"use client"

import { Factory, Filter, House, Layers3 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ageRangeOptions,
  batches,
  poultryHouses,
  poultryHouseStatusMeta,
  workshops,
  type Batch,
  type BirdAgeGroup,
} from "@/lib/production-filters"

interface ProductionFiltersProps {
  selectedWorkshopIds: string[]
  selectedHouseIds: string[]
  selectedBatchIds: string[]
  selectedAgeRangeId: string
  onWorkshopToggle: (id: string) => void
  onHouseToggle: (id: string) => void
  onBatchToggle: (id: string) => void
  onAgeRangeChange: (id: string) => void
}

function FilterCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Factory
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white/80 p-4 dark:border-white/8 dark:bg-white/4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-black/5 bg-zinc-950 p-3 text-white dark:border-white/10 dark:bg-white dark:text-zinc-950">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</div>
          <div className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{description}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function ProductionFilters({
  selectedWorkshopIds,
  selectedHouseIds,
  selectedBatchIds,
  selectedAgeRangeId,
  onWorkshopToggle,
  onHouseToggle,
  onBatchToggle,
  onAgeRangeChange,
}: ProductionFiltersProps) {
  const availableHouses = poultryHouses.filter((house) =>
    selectedWorkshopIds.length === 0 ? true : selectedWorkshopIds.includes(house.workshopId)
  )

  const availableBatches = batches.filter((batch) =>
    selectedHouseIds.length === 0 ? true : selectedHouseIds.includes(batch.poultryHouseId)
  )

  return (
    <div className="dashboard-panel p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Производственные фильтры
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Цех, птичник и партия
          </h2>
        </div>
        <div className="dashboard-chip whitespace-nowrap">
          <Filter className="size-3.5" />
          {selectedWorkshopIds.length || workshops.length} цехов в анализе
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <FilterCard
          icon={Factory}
          title="Цех"
          description="Множественный выбор цехов предприятия с указанием производственного направления."
        >
          <div className="flex flex-wrap gap-2">
            {workshops.map((workshop) => {
              const isActive = selectedWorkshopIds.includes(workshop.id)

              return (
                <button
                  key={workshop.id}
                  onClick={() => onWorkshopToggle(workshop.id)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-zinc-900 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                      : "border-black/8 bg-white text-zinc-700 hover:border-black/15 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  )}
                >
                  <span className="font-medium">{workshop.name}</span>
                  <span className={cn("ml-2 text-xs", isActive ? "text-white/70 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400")}>
                    {workshop.direction}
                  </span>
                </button>
              )
            })}
          </div>
        </FilterCard>

        <FilterCard
          icon={House}
          title="Птичник"
          description="Список автоматически ограничивается выбранными цехами. Для каждого птичника виден текущий статус."
        >
          <div className="space-y-2">
            {availableHouses.map((house) => {
              const meta = poultryHouseStatusMeta[house.status]
              const isActive = selectedHouseIds.includes(house.id)

              return (
                <button
                  key={house.id}
                  onClick={() => onHouseToggle(house.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    isActive
                      ? "border-zinc-900 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                      : "border-black/8 bg-white hover:border-black/15 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{house.name}</div>
                    <div className={cn("mt-1 text-xs", isActive ? "text-white/70 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400")}>
                      {workshops.find((item) => item.id === house.workshopId)?.name}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
                      isActive ? "bg-white/12 text-white dark:bg-zinc-900/8 dark:text-zinc-700" : meta.chipClass
                    )}
                  >
                    <span className={cn("size-2 rounded-full", meta.dotClass)} />
                    {meta.label}
                  </span>
                </button>
              )
            })}
          </div>
        </FilterCard>

        <FilterCard
          icon={Layers3}
          title="Партия и возраст"
          description="Партии можно выбирать по идентификатору, а возрастной диапазон использовать как альтернативный режим отбора."
        >
          <div className="flex flex-wrap gap-2">
            {ageRangeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onAgeRangeChange(option.id)}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm transition",
                  selectedAgeRangeId === option.id
                    ? "border-zinc-900 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                    : "border-black/8 bg-white text-zinc-700 hover:border-black/15 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Возрастной диапазон и конкретные партии лучше использовать по отдельности, чтобы срез был однозначным.
          </div>

          <div className="mt-4 space-y-2">
            {availableBatches.map((batch: Batch) => {
              const isActive = selectedBatchIds.includes(batch.id)

              return (
                <button
                  key={batch.id}
                  onClick={() => onBatchToggle(batch.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    isActive
                      ? "border-zinc-900 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                      : "border-black/8 bg-white hover:border-black/15 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  )}
                >
                  <div className="text-sm font-medium">{batch.label}</div>
                  <div className={cn("mt-1 text-xs", isActive ? "text-white/70 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400")}>
                    Возраст: {batch.ageLabel}
                  </div>
                </button>
              )
            })}
          </div>
        </FilterCard>
      </div>
    </div>
  )
}

export function resolveAgeGroup(
  selectedBatchIds: string[],
  selectedAgeRangeId: string
): BirdAgeGroup {
  const rangeMatch = ageRangeOptions.find((option) => option.id === selectedAgeRangeId)
  if (rangeMatch?.ageGroup) {
    return rangeMatch.ageGroup
  }

  const activeBatch = batches.find((batch) => selectedBatchIds.includes(batch.id))
  return activeBatch?.ageGroup || "21-30"
}
