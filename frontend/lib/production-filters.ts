export type WorkshopDirection = "Бройлеры" | "Несушки" | "Родительское стадо" | "Ремонтный молодняк"
export type PoultryHouseStatus = "occupied" | "sanitation" | "empty"
export type BirdAgeGroup = "0-3" | "21-30"

export interface Workshop {
  id: string
  name: string
  direction: WorkshopDirection
}

export interface PoultryHouse {
  id: string
  workshopId: string
  name: string
  status: PoultryHouseStatus
}

export interface Batch {
  id: string
  poultryHouseId: string
  label: string
  ageLabel: string
  ageDaysRange: [number, number]
  ageGroup: BirdAgeGroup
}

export const workshops: Workshop[] = [
  { id: "broiler-1", name: "Бройлерный цех № 1", direction: "Бройлеры" },
  { id: "broiler-2", name: "Бройлерный цех № 2", direction: "Бройлеры" },
  { id: "parent-1", name: "Цех родительского стада", direction: "Родительское стадо" },
  { id: "young-1", name: "Цех выращивания ремонтного молодняка", direction: "Ремонтный молодняк" },
]

export const poultryHouses: PoultryHouse[] = [
  { id: "ph-101", workshopId: "broiler-1", name: "Птичник 1-01", status: "occupied" },
  { id: "ph-102", workshopId: "broiler-1", name: "Птичник 1-02", status: "occupied" },
  { id: "ph-103", workshopId: "broiler-1", name: "Птичник 1-03", status: "sanitation" },
  { id: "ph-201", workshopId: "broiler-2", name: "Птичник 2-01", status: "occupied" },
  { id: "ph-202", workshopId: "broiler-2", name: "Птичник 2-02", status: "empty" },
  { id: "ph-301", workshopId: "parent-1", name: "Птичник РС-01", status: "occupied" },
  { id: "ph-302", workshopId: "parent-1", name: "Птичник РС-02", status: "occupied" },
  { id: "ph-401", workshopId: "young-1", name: "Птичник РМ-01", status: "occupied" },
  { id: "ph-402", workshopId: "young-1", name: "Птичник РМ-02", status: "sanitation" },
]

export const batches: Batch[] = [
  {
    id: "batch-2026-04-15-b1",
    poultryHouseId: "ph-101",
    label: "Партия № 2026-04-15 Бройлер-1",
    ageLabel: "0-3 дня",
    ageDaysRange: [0, 3],
    ageGroup: "0-3",
  },
  {
    id: "batch-2026-03-20-b1",
    poultryHouseId: "ph-102",
    label: "Партия № 2026-03-20 Бройлер-2",
    ageLabel: "21-30 дней",
    ageDaysRange: [21, 30],
    ageGroup: "21-30",
  },
  {
    id: "batch-2026-03-18-b2",
    poultryHouseId: "ph-201",
    label: "Партия № 2026-03-18 Бройлер-3",
    ageLabel: "21-30 дней",
    ageDaysRange: [21, 30],
    ageGroup: "21-30",
  },
  {
    id: "batch-2026-04-14-rs",
    poultryHouseId: "ph-301",
    label: "Партия № 2026-04-14 Родительское стадо-1",
    ageLabel: "0-3 дня",
    ageDaysRange: [0, 3],
    ageGroup: "0-3",
  },
  {
    id: "batch-2026-03-25-rs",
    poultryHouseId: "ph-302",
    label: "Партия № 2026-03-25 Родительское стадо-2",
    ageLabel: "21-30 дней",
    ageDaysRange: [21, 30],
    ageGroup: "21-30",
  },
  {
    id: "batch-2026-04-12-rm",
    poultryHouseId: "ph-401",
    label: "Партия № 2026-04-12 Ремонтный молодняк-1",
    ageLabel: "0-3 дня",
    ageDaysRange: [0, 3],
    ageGroup: "0-3",
  },
]

export const poultryHouseStatusMeta: Record<
  PoultryHouseStatus,
  { label: string; dotClass: string; chipClass: string }
> = {
  occupied: {
    label: "Занят",
    dotClass: "bg-emerald-500",
    chipClass: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  },
  sanitation: {
    label: "На санации",
    dotClass: "bg-amber-500",
    chipClass: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  empty: {
    label: "Пустой",
    dotClass: "bg-zinc-400",
    chipClass: "bg-zinc-500/12 text-zinc-600 dark:text-zinc-300",
  },
}

export const ageRangeOptions = [
  { id: "all", label: "Все возраста", ageGroup: "21-30" as BirdAgeGroup | null },
  { id: "0-14", label: "0-14 дней", ageGroup: "0-3" as BirdAgeGroup },
  { id: "15-28", label: "15-28 дней", ageGroup: "21-30" as BirdAgeGroup },
]
