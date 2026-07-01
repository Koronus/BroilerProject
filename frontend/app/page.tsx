"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardHeader, type DashboardSection } from "@/components/dashboard/header"
import { CategorySidebar, categories } from "@/components/dashboard/category-sidebar"
import { DetailPanel } from "@/components/dashboard/detail-panel"
import { KpiGrid, getMetricsForAge, type BirdAgeGroup } from "@/components/dashboard/kpi-grid"
import { resolveAgeGroup } from "@/components/dashboard/production-filters"
import { TechnicalHeader } from "@/components/dashboard/technical-header"
import { batches, poultryHouses } from "@/lib/production-filters"
import { NotificationsPage } from "@/components/dashboard/notifications-page"
import { IncidentsPage } from "@/components/dashboard/incidents-page"
import { TasksPage } from "@/components/dashboard/tasks-page"
import { NotificationBanner } from "@/components/dashboard/notification-banner"

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "zootech")
  const [activeSection, setActiveSection] = useState<DashboardSection>("technical")
  const [activeMetric, setActiveMetric] = useState("mortality")
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [selectedWorkshopIds, setSelectedWorkshopIds] = useState<string[]>(["broiler-1"])
  const [selectedHouseIds, setSelectedHouseIds] = useState<string[]>(["ph-101"])
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(["batch-2026-04-15-b1"])
  const [selectedAgeRangeId, setSelectedAgeRangeId] = useState("all")
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>()

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

  const handleSelectHouse = (id: string) => {
    const house = poultryHouses.find((item) => item.id === id)
    if (house) {
      setSelectedWorkshopIds([house.workshopId])
    }
    setSelectedHouseIds([id])
    const firstBatch = batches.find((batch) => batch.poultryHouseId === id)
    setSelectedBatchIds(firstBatch ? [firstBatch.id] : [])
    setSelectedAgeRangeId("all")
  }

  const handleSelectBatch = (id: string) => {
    setSelectedBatchIds([id])
    setSelectedAgeRangeId("all")
  }

  const handleOpenIncidentCard = (incidentId: string) => {
    setSelectedIncidentId(incidentId)
    setActiveSection("incidents")
  }

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="dashboard-shell mx-auto max-w-[1680px] rounded-[28px]">
        <DashboardHeader 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {activeSection === "notifications" ? (
          <NotificationsPage />
        ) : activeSection === "incidents" ? (
          <IncidentsPage selectedIncidentId={selectedIncidentId} />
        ) : activeSection === "tasks" ? (
          <TasksPage />
        ) : (
          <div className="space-y-4 p-3 md:p-4">
            <NotificationBanner onOpen={handleOpenIncidentCard} />

            <TechnicalHeader
              selectedHouseId={selectedHouseIds[0]}
              selectedBatchId={selectedBatchIds[0]}
              onSelectHouse={handleSelectHouse}
              onSelectBatch={handleSelectBatch}
            />

            <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
              <div className="order-2 xl:order-1">
                <CategorySidebar
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>

              <div className="order-1 min-w-0 space-y-4 xl:order-2">
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

                {showDetailPanel && (
                  <DetailPanel
                    onClose={() => setShowDetailPanel(false)}
                    activeMetric={activeMetric}
                    activeCategory={activeCategory}
                    selectedAge={selectedAge}
                    selectedWorkshopIds={selectedWorkshopIds}
                    selectedHouseIds={selectedHouseIds}
                    selectedBatchIds={selectedBatchIds}
                    selectedAgeRangeId={selectedAgeRangeId}
                    onNavigateToTasks={() => setActiveSection("tasks")}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}