"use client"

import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { batches, poultryHouses } from "@/lib/production-filters"

interface TechnicalHeaderProps {
  selectedHouseId?: string
  selectedBatchId?: string
  onSelectHouse: (id: string) => void
  onSelectBatch: (id: string) => void
}

function SelectPill({
  label,
  placeholder,
  children,
}: {
  label?: string
  placeholder: string
  children: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-2xl border border-black/8 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/6 dark:text-zinc-100 dark:hover:bg-white/10">
          <span className="max-w-[200px] truncate">{label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[320px] overflow-y-auto border-black/5 bg-white/95 dark:border-white/10 dark:bg-zinc-900/95"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TechnicalHeader({
  selectedHouseId,
  selectedBatchId,
  onSelectHouse,
  onSelectBatch,
}: TechnicalHeaderProps) {
  // В выпадающем списке птичников показываем только «Птичник 1-01».
  const houseOptions = poultryHouses.filter((house) => house.id === "ph-101")
  const selectedHouse = poultryHouses.find((house) => house.id === selectedHouseId)
  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId)
  const availableBatches = batches.filter(
    (batch) => !selectedHouseId || batch.poultryHouseId === selectedHouseId,
  )

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Технические показатели
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <SelectPill label={selectedHouse?.name} placeholder="Птичник">
          {houseOptions.map((house) => (
            <DropdownMenuItem key={house.id} onClick={() => onSelectHouse(house.id)}>
              {house.name}
            </DropdownMenuItem>
          ))}
        </SelectPill>

        <SelectPill label={selectedBatch?.label} placeholder="Партия">
          {availableBatches.length > 0 ? (
            availableBatches.map((batch) => (
              <DropdownMenuItem key={batch.id} onClick={() => onSelectBatch(batch.id)}>
                {batch.label}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>Нет партий для птичника</DropdownMenuItem>
          )}
        </SelectPill>
      </div>
    </div>
  )
}
