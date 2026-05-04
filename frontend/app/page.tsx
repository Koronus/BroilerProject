"use client"

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { DashboardHeader, type DashboardSection } from "@/components/dashboard/header"
import { CategorySidebar, categories } from "@/components/dashboard/category-sidebar"
import { DetailPanel } from "@/components/dashboard/detail-panel"
//import { DashboardHeader } from "@/components/dashboard/header"
import { KpiGrid, getMetricsForAge, type BirdAgeGroup } from "@/components/dashboard/kpi-grid"
import { ProductionFilters, resolveAgeGroup } from "@/components/dashboard/production-filters"
import { batches, poultryHouses } from "@/lib/production-filters"
import { NotificationsPage } from "@/components/dashboard/notifications-page" 
import { IncidentsPage } from "@/components/dashboard/incidents-page"

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "zootech")
  const [activeSection, setActiveSection] = useState<DashboardSection>("technical")
  const [activeMetric, setActiveMetric] = useState("mortality")
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [selectedWorkshopIds, setSelectedWorkshopIds] = useState<string[]>(["broiler-1"])
  const [selectedHouseIds, setSelectedHouseIds] = useState<string[]>(["ph-101"])
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(["batch-2026-04-15-b1"])
  const [selectedAgeRangeId, setSelectedAgeRangeId] = useState("all")

  const selectedAge = useMemo<BirdAgeGroup>(
    () => resolveAgeGroup(selectedBatchIds, selectedAgeRangeId),
    [selectedBatchIds, selectedAgeRangeId]
  )

  useEffect(() => {
    const validHouseIds = poultryHouses
      .filter((house) => selectedWorkshopIds.length === 0 || selectedWorkshopIds.includes(house.workshopId))
      .map((house) => house.id)

    setSelectedHouseIds((current) => current.filter((id) => validHouseIds.includes(id)))
  }, [selectedWorkshopIds])

  useEffect(() => {
    const validBatchIds = batches
      .filter((batch) => selectedHouseIds.length === 0 || selectedHouseIds.includes(batch.poultryHouseId))
      .map((batch) => batch.id)

    setSelectedBatchIds((current) => current.filter((id) => validBatchIds.includes(id)))
  }, [selectedHouseIds])

  useEffect(() => {
    const firstMetricInCategory = getMetricsForAge(selectedAge).find(
      (metric) => metric.categoryId === activeCategory
    )

    if (firstMetricInCategory) {
      setActiveMetric(firstMetricInCategory.id)
      setShowDetailPanel(true)
    } else {
      setShowDetailPanel(false)
    }
  }, [activeCategory, selectedAge])

  const toggleSelection = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    )
  }

  const handleBatchToggle = (id: string) => {
    setSelectedAgeRangeId("all")
    toggleSelection(id, setSelectedBatchIds)
  }

  const handleAgeRangeChange = (id: string) => {
    setSelectedAgeRangeId(id)
    if (id !== "all") {
      setSelectedBatchIds([])
    }
  }

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="dashboard-shell mx-auto max-w-[1680px] rounded-[28px]">
        <DashboardHeader activeSection={activeSection}
        onSectionChange={setActiveSection}/>

         {activeSection === "notifications" ? (
            <NotificationsPage />           // ← Рендерим уведомления
            ) : activeSection === "incidents" ? (
            <IncidentsPage />               // ← Рендерим инциденты (если есть)
            ) : (
            
        <div className="space-y-4 p-3 md:p-4">
          <ProductionFilters
            selectedWorkshopIds={selectedWorkshopIds}
            selectedHouseIds={selectedHouseIds}
            selectedBatchIds={selectedBatchIds}
            selectedAgeRangeId={selectedAgeRangeId}
            onWorkshopToggle={(id) => toggleSelection(id, setSelectedWorkshopIds)}
            onHouseToggle={(id) => toggleSelection(id, setSelectedHouseIds)}
            onBatchToggle={handleBatchToggle}
            onAgeRangeChange={handleAgeRangeChange}
          />

          

          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
            <div className="order-2 xl:order-1">
              <CategorySidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            <div className="order-1 min-w-0 xl:order-2">
              <div className="dashboard-panel">
                <KpiGrid
                  onSelectMetric={(metric) => {
                    setActiveMetric(metric)
                    setShowDetailPanel(true)
                  }}
                  activeMetric={activeMetric}
                  activeCategory={activeCategory}
                  selectedAge={selectedAge}
                />
              </div>
            </div>

            {showDetailPanel && (
              <div className="order-3">
                <DetailPanel
                  onClose={() => setShowDetailPanel(false)}
                  activeMetric={activeMetric}
                  // ✅ Передаем все фильтры в DetailPanel
                  activeCategory={activeCategory}
                  selectedAge={selectedAge}
                  selectedWorkshopIds={selectedWorkshopIds}
                  selectedHouseIds={selectedHouseIds}
                  selectedBatchIds={selectedBatchIds}
                  selectedAgeRangeId={selectedAgeRangeId}
                />
              </div>
            )}
          </div>
        
        </div>
            )}
      </div>
    </div>
  )
}