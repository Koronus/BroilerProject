export interface BatchListItem {
  id: string
  batchNumber: string
  status: string | null
  workshop: string | null
  house: string | null
  zone: string | null
  placementDate: string | null
  closeDate: string | null
  initialBirdCount: number | null
  currentBirdCount: number | null
  origin: string | null
  cross: string | null
  createdAt: string
  updatedAt: string | null
}

export async function fetchBatches(signal?: AbortSignal): Promise<BatchListItem[]> {
  const response = await fetch("/api/batches", { cache: "no-store", signal })
  if (!response.ok) throw new Error(`Batches request failed: HTTP ${response.status}`)
  return response.json() as Promise<BatchListItem[]>
}