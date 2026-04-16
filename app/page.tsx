"use client"

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { DashboardHeader, type DashboardSection } from "@/components/dashboard/header"
import { CategorySidebar, categories } from "@/components/dashboard/category-sidebar"
import { DetailPanel } from "@/components/dashboard/detail-panel"
import { KpiGrid, getMetricsForAge, type BirdAgeGroup } from "@/components/dashboard/kpi-grid"
import { ProductionFilters, resolveAgeGroup } from "@/components/dashboard/production-filters"
import { batches, poultryHouses } from "@/lib/production-filters"
import { NotificationsPage } from "@/components/dashboard/notifications-page"
import { IncidentsPage } from "@/components/dashboard/incidents-page"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("technical")
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "zootech")
  const [activeMetric, setActiveMetric] = useState("mortality")
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  
  // Фильтры для производственных показателей (из ветки elmir)
  const [selectedWorkshopIds, setSelectedWorkshopIds] = useState<string[]>(["broiler-1"])
  const [selectedHouseIds, setSelectedHouseIds] = useState<string[]>(["ph-101"])
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(["batch-2026-04-15-b1"])
  const [selectedAgeRangeId, setSelectedAgeRangeId] = useState("all")

  const selectedAge = useMemo<BirdAgeGroup>(
    () => resolveAgeGroup(selectedBatchIds, selectedAgeRangeId),
    [selectedBatchIds, selectedAgeRangeId]
  )

  // Эффекты для фильтрации (из ветки elmir)
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

  // Эффект для установки первой метрики (объединенный)
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

  // Вспомогательные функции для фильтров (из ветки elmir)
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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <DashboardHeader
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {activeSection === "notifications" ? (
        <NotificationsPage />
      ) : activeSection === "incidents" ? (
        <IncidentsPage />
      ) : (
        <>
          {/* Производственные фильтры (из ветки elmir) */}
          <div className="px-6 pt-4">
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
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Categories */}
            <div className="w-64 shrink-0 hidden lg:block border-r border-zinc-800">
              <CategorySidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Center Grid - KPI Cards */}
            <div className="flex-1 min-w-0">
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

            {/* Right Panel - Detail View */}
            {showDetailPanel && (
              <div className="w-[420px] shrink-0 hidden md:block border-l border-zinc-800">
                <DetailPanel 
                  onClose={() => setShowDetailPanel(false)} 
                  activeMetric={activeMetric}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}