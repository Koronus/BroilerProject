"use client"

import { useState, useEffect } from "react"
import { DashboardHeader, type DashboardSection } from "@/components/dashboard/header"
import { CategorySidebar, categories } from "@/components/dashboard/category-sidebar"
import { KpiGrid } from "@/components/dashboard/kpi-grid"
import { DetailPanel } from "@/components/dashboard/detail-panel"
import { NotificationsPage } from "@/components/dashboard/notifications-page"
import { IncidentsPage } from "@/components/dashboard/incidents-page"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("technical")
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "zootech")
  const [activeMetric, setActiveMetric] = useState("mortality")
  const [showDetailPanel, setShowDetailPanel] = useState(false)

  // Эффект для установки первой метрики при загрузке или смене категории
  useEffect(() => {
    // Импортируем metrics динамически, чтобы избежать циклической зависимости
    import("@/components/dashboard/kpi-grid").then(({ metrics }) => {
      // Находим первую метрику в выбранной категории
      const firstMetricInCategory = metrics.find(
        metric => metric.categoryId === activeCategory
      )
      
      if (firstMetricInCategory) {
        setActiveMetric(firstMetricInCategory.id)
        // Показываем детализацию для первой метрики
        setShowDetailPanel(true)
      } else {
        setShowDetailPanel(false)
      }
    })
  }, [activeCategory]) // Срабатывает при изменении категории

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

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Categories */}
        <div className="w-64 shrink-0 hidden lg:block">
          <CategorySidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Center Grid - KPI Cards */}
        <div className="flex-1 min-w-0 border-r border-zinc-800">
          <KpiGrid
            onSelectMetric={(metric) => {
              setActiveMetric(metric)
              setShowDetailPanel(true)
            }}
            activeMetric={activeMetric}
            activeCategory={activeCategory}
          />
        </div>

        {/* Right Panel - Detail View */}
        {showDetailPanel && (
          <div className="w-[420px] shrink-0 hidden md:block">
            <DetailPanel 
              onClose={() => setShowDetailPanel(false)} 
              activeMetric={activeMetric}  // Передаем activeMetric
            />
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
