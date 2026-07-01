"use client"

import { GrafanaStyleChart } from "./grafana-style-chart"
import { FullChartModal } from "./full-chart-modal"
import { useEffect, useState } from "react"
import { AlertTriangle, ClipboardPlus, Download, X, CheckCircle2, Clock, PlayCircle, User, Calendar as CalendarIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { metricsDetails } from "@/lib/metricks-detail"
import {
  LIGHTING_SENSOR_CODES,
  buildLightingChartData,
  formatLightingMetricValue,
  getLightingMetricKind,
  resolveLightingStatus,
  type LightingTelemetryBySensorCode,
} from "@/lib/lighting-metrics"
import { CreateTaskModal } from "./create-task-modal"
import { ReportsModal } from "./reports-modal"
import { type BirdAgeGroup } from "@/components/dashboard/kpi-grid"
import { workshops, poultryHouses, batches, ageRangeOptions } from "@/lib/production-filters"
import { cn } from "@/lib/utils"

interface DetailPanelProps {
  onClose: () => void
  activeMetric: string
  activeCategory?: string
  selectedAge?: BirdAgeGroup
  selectedWorkshopIds?: string[]
  selectedHouseIds?: string[]
  selectedBatchIds?: string[]
  selectedAgeRangeId?: string
  onNavigateToTasks?: () => void
}

interface TelemetryReading {
  sensorCode: string
  value: number
  unit: string
  measuredAt: string
}

interface MetricTask {
  id: string
  title: string
  description: string
  priority: "critical" | "high" | "medium" | "low"
  responsible: string
  status: "new" | "inProgress" | "review" | "completed" | "overdue"
  deadline: string
  createdAt: string
  incidentId?: string
  metricId?: string
}

const taskStatusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  new: { label: "Новая", color: "text-blue-600", bg: "bg-blue-50", icon: PlayCircle },
  inProgress: { label: "В работе", color: "text-orange-600", bg: "bg-orange-50", icon: PlayCircle },
  review: { label: "На проверке", color: "text-purple-600", bg: "bg-purple-50", icon: CheckCircle2 },
  completed: { label: "Выполнена", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  overdue: { label: "Просрочена", color: "text-red-600", bg: "bg-red-50", icon: Clock },
}

const taskPriorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: "Критический", color: "text-red-600", dot: "bg-red-500" },
  high: { label: "Высокий", color: "text-orange-600", dot: "bg-orange-500" },
  medium: { label: "Средний", color: "text-yellow-600", dot: "bg-yellow-500" },
  low: { label: "Низкий", color: "text-green-600", dot: "bg-green-500" },
}

const sensorCodeByMetricId: Record<string, string> = {
  temperature_0_3: "TEMP-HOUSE-4-01",
  temperature_21_30: "TEMP-HOUSE-4-01",
  humidity_0_3: "HUM-HOUSE-4-01",
  humidity_21_30: "HUM-HOUSE-4-01",
  ammonia_0_3: "AMMONIA-HOUSE-4-01",
  ammonia_21_30: "AMMONIA-HOUSE-4-01",
  feed_intake_0_3: "FEED-HOUSE-4-01",
  feed_intake_21_30: "FEED-HOUSE-4-01",
  water_intake_0_3: "WATER-HOUSE-4-01",
  water_intake_21_30: "WATER-HOUSE-4-01",
}

const normalRangesBySensorCode: Record<string, { min?: number; max?: number; criticalMin?: number; criticalMax?: number }> = {
  "TEMP-HOUSE-4-01": { min: 32, max: 34, criticalMin: 30, criticalMax: 36 },
  "HUM-HOUSE-4-01": { min: 50, max: 65, criticalMin: 40, criticalMax: 75 },
  "AMMONIA-HOUSE-4-01": { min: 0, max: 10, criticalMax: 13 },
  "FEED-HOUSE-4-01": { min: 35, max: 80, criticalMax: 105 },
  "WATER-HOUSE-4-01": { min: 8, max: 18, criticalMax: 24 },
}

const formatTelemetryValue = (reading: TelemetryReading) => {
  const formattedValue = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: reading.value >= 100 ? 0 : 1,
  }).format(reading.value)

  if (reading.unit === "C") return `${formattedValue}°C`
  if (reading.unit === "%") return `${formattedValue}%`

  return `${formattedValue} ${reading.unit}`
}

const resolveTelemetryStatus = (sensorCode: string, value: number): "normal" | "warning" | "critical" => {
  const range = normalRangesBySensorCode[sensorCode]
  if (!range) return "normal"

  if (range.criticalMin !== undefined && value < range.criticalMin) return "critical"
  if (range.criticalMax !== undefined && value > range.criticalMax) return "critical"
  if (range.min !== undefined && value < range.min) return "warning"
  if (range.max !== undefined && value > range.max) return "warning"

  return "normal"
}

export function DetailPanel({ 
  onClose, 
  activeMetric,
  activeCategory = "microclimate",
  selectedAge = "21-30",
  selectedWorkshopIds = [],
  selectedHouseIds = [],
  selectedBatchIds = [],
  selectedAgeRangeId = "all",
  onNavigateToTasks
}: DetailPanelProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area")
  const [liveReading, setLiveReading] = useState<TelemetryReading | null>(null)
  const [lightingTelemetry, setLightingTelemetry] = useState<LightingTelemetryBySensorCode>({})
  const [metricTasks, setMetricTasks] = useState<MetricTask[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  
  let metricData = metricsDetails[activeMetric]

  useEffect(() => {
    let mounted = true
    const sensorCode = sensorCodeByMetricId[activeMetric]
    const lightingKind = getLightingMetricKind(activeMetric)

    const loadTelemetry = async () => {
      if (lightingKind) {
        try {
          const entries = await Promise.all(
            LIGHTING_SENSOR_CODES.map(async (lightingSensorCode) => {
              const response = await fetch(
                `/api/telemetry/readings?sensorCode=${encodeURIComponent(lightingSensorCode)}&limit=13`,
                { cache: "no-store" }
              )

              if (!response.ok) {
                return [lightingSensorCode, []] as const
              }

              const readings = (await response.json()) as TelemetryReading[]
              return [lightingSensorCode, readings] as const
            })
          )

          if (mounted) {
            setLightingTelemetry(Object.fromEntries(entries))
            setLiveReading(null)
          }
        } catch {
          if (mounted) {
            setLightingTelemetry({})
            setLiveReading(null)
          }
        }
        return
      }

      if (!sensorCode) {
        if (mounted) {
          setLiveReading(null)
          setLightingTelemetry({})
        }
        return
      }

      try {
        const response = await fetch(
          `/api/telemetry/readings?sensorCode=${encodeURIComponent(sensorCode)}&limit=1`,
          { cache: "no-store" }
        )

        if (!response.ok) {
          throw new Error("Telemetry request failed")
        }

        const text = await response.text()
        if (!text) {
          if (mounted) setLiveReading(null)
          return
        }

        const readings = JSON.parse(text) as TelemetryReading[]
        if (mounted) {
          setLiveReading(readings[0] ?? null)
          setLightingTelemetry({})
        }
      } catch {
        if (mounted) {
          setLiveReading(null)
          setLightingTelemetry({})
        }
      }
    }

    loadTelemetry()
    const intervalId = window.setInterval(loadTelemetry, 60_000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [activeMetric])

  // Загрузка задач для конкретного показателя
  useEffect(() => {
    const loadMetricTasks = async () => {
      setIsLoadingTasks(true)
      try {
        const response = await fetch(`/api/tasks?metricId=${activeMetric}`)
        const text = await response.text()
        
        if (!text) {
          setMetricTasks([])
          return
        }
        
        const data = JSON.parse(text)
        setMetricTasks(data.tasks || [])
      } catch (error) {
        console.error("Ошибка загрузки задач:", error)
        // Fallback на localStorage
        try {
          const stored = localStorage.getItem("tasks")
          if (stored) {
            const allTasks = JSON.parse(stored)
            const filtered = allTasks.filter((task: any) => task.metricId === activeMetric)
            setMetricTasks(filtered)
          }
        } catch (e) {
          setMetricTasks([])
        }
      } finally {
        setIsLoadingTasks(false)
      }
    }

    if (metricData) {
      loadMetricTasks()
    }
  }, [activeMetric, metricData])

  if (!metricData) {
    return (
      <aside className="dashboard-panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Детализация показателя
          </h2>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 p-2 text-zinc-500 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/8"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">Данные не найдены</p>
      </aside>
    )
  }

  const liveSensorCode = sensorCodeByMetricId[activeMetric]
  const lightingKind = getLightingMetricKind(activeMetric)

  if (lightingKind) {
    const lightingChartData = buildLightingChartData(lightingTelemetry, lightingKind)
    const latestLightingPoint = lightingChartData.at(-1)

    metricData = {
      ...metricData,
      chartData: lightingChartData.length > 0 ? lightingChartData : metricData.chartData,
      currentValue: latestLightingPoint
        ? formatLightingMetricValue(lightingKind, latestLightingPoint.value)
        : metricData.currentValue,
      status: latestLightingPoint
        ? resolveLightingStatus(lightingKind, latestLightingPoint.value)
        : metricData.status,
    }
  } else {
    const currentLiveReading = liveReading?.sensorCode === liveSensorCode ? liveReading : null
    const currentValue = currentLiveReading ? formatTelemetryValue(currentLiveReading) : metricData.currentValue
    const currentStatus = currentLiveReading && liveSensorCode
      ? resolveTelemetryStatus(liveSensorCode, currentLiveReading.value)
      : metricData.status

    metricData = {
      ...metricData,
      currentValue,
      status: currentStatus,
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ФИЛЬТРОВ ==========

  const getSelectedWorkshopNames = () => {
    if (!selectedWorkshopIds || selectedWorkshopIds.length === 0) return "Все цеха"
    const names = workshops.filter(w => selectedWorkshopIds.includes(w.id)).map(w => w.name)
    return names.length ? names.join(", ") : selectedWorkshopIds.join(", ")
  }

  const getSelectedHouseNames = () => {
    if (!selectedHouseIds || selectedHouseIds.length === 0) return "Все птичники"
    const names = poultryHouses.filter(h => selectedHouseIds.includes(h.id)).map(h => h.name)
    return names.length ? names.join(", ") : selectedHouseIds.join(", ")
  }

  const getSelectedBatchNames = () => {
    if (!selectedBatchIds || selectedBatchIds.length === 0) return "Все партии"
    const names = batches.filter(b => selectedBatchIds.includes(b.id)).map(b => b.label)
    return names.length ? names.join(", ") : selectedBatchIds.join(", ")
  }

  const getAgeRangeName = () => {
    const range = ageRangeOptions.find(opt => opt.id === selectedAgeRangeId)
    if (range?.id === "all") return "Все возрасты"
    return range?.label || selectedAgeRangeId
  }

  // ========== РАСЧЕТ СТАТИСТИЧЕСКИХ ПОКАЗАТЕЛЕЙ ==========

  const calculateStats = () => {
    const values = metricData.chartData.map(item => item.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const sorted = [...values].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    let targetMin = -Infinity
    let targetMax = Infinity
    const targetRangeStr = metricData.targetRange.trim()
    
    if (targetRangeStr.includes("-") && !targetRangeStr.includes("<") && !targetRangeStr.includes(">")) {
      const parts = targetRangeStr.split("-")
      targetMin = parseFloat(parts[0]?.replace(/[^0-9.,]/g, '').replace(',', '.') || "-Infinity")
      targetMax = parseFloat(parts[1]?.replace(/[^0-9.,]/g, '').replace(',', '.') || "Infinity")
    } else if (targetRangeStr.includes("<")) {
      const match = targetRangeStr.match(/<\s*([0-9.,]+)/)
      if (match) {
        targetMax = parseFloat(match[1].replace(',', '.'))
        targetMin = -Infinity
      }
    } else if (targetRangeStr.includes(">")) {
      const match = targetRangeStr.match(/>\s*([0-9.,]+)/)
      if (match) {
        targetMin = parseFloat(match[1].replace(',', '.'))
        targetMax = Infinity
      }
    }
    
    const exceedCount = values.filter(v => v > targetMax).length
    
    return { avg, median, min, max, stdDev, exceedCount, targetMin, targetMax }
  }

  const stats = calculateStats()

  const formatUnit = () => {
    if (metricData.title.includes("Температура")) return "°C"
    if (metricData.title.includes("Аммиак")) return " ppm"
    if (metricData.title.includes("Вес")) return metricData.currentValue.includes("кг") ? " кг" : " г"
    if (metricData.title.includes("Равномерность освещения")) return ""
    if (metricData.title.toLowerCase().includes("освещ")) return " лк"
    if (metricData.title.includes("%")) return "%"
    return ""
  }

  // Функция форматирования даты для задач
  const formatTaskDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return `Просрочена на ${Math.abs(diffDays)} дн.`
      if (diffDays === 0) return "Сегодня"
      if (diffDays === 1) return "Завтра"
      return `Через ${diffDays} дн.`
    } catch {
      return "Дата не указана"
    }
  }

  const generateFullReportHTML = () => {
  // Расчет дополнительных статистических показателей
  const values = metricData.chartData.map(item => item.value)
  const range = stats.max - stats.min
  const variance = values.reduce((acc, val) => acc + Math.pow(val - stats.avg, 2), 0) / values.length
  const cv = (stats.stdDev / stats.avg) * 100 // Коэффициент вариации
  const uniformity = Math.max(0, 100 - cv * 2) // Однородность стада (упрощенная формула)
  const dailyChange = values[values.length - 1] - values[0]
  const avgDailyGain = dailyChange / (values.length - 1)
  
  // Определение тренда
  let trend = "Стабильный"
  let trendDirection = "stable"
  if (dailyChange > 0.05 * stats.avg) {
    trend = "Рост"
    trendDirection = "up"
  } else if (dailyChange < -0.05 * stats.avg) {
    trend = "Снижение"
    trendDirection = "down"
  }
  
  // Определение риска
  let riskLevel = "Низкий"
  let riskClass = "status-normal"
  if (metricData.status === "critical") {
    riskLevel = "Высокий"
    riskClass = "status-critical"
  } else if (metricData.status === "warning") {
    riskLevel = "Средний"
    riskClass = "status-warning"
  }
  
  // Формирование ID отчета
  const reportId = `REP-${metricData.title.substring(0, 4).toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`
  
  // Прогноз на 7 дней
  const forecastValue = stats.avg + dailyChange * 2
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Универсальный отчет - ${metricData.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Times New Roman', Times, serif; 
            padding: 40px; 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            line-height: 1.4;
            font-size: 11pt;
          }
          h1 { 
            color: #1e293b; 
            border-bottom: 2px solid #1e293b; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
            font-size: 18pt;
            text-align: center;
          }
          h2 { 
            color: #334155; 
            margin-top: 20px; 
            margin-bottom: 10px; 
            padding-left: 12px;
            font-size: 14pt;
            background: #f8fafc;
          }
          h3 { 
            color: #475569; 
            margin-top: 15px; 
            margin-bottom: 8px;
            font-size: 12pt;
          }
          .header-info {
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin: 15px 0;
          }
          .info-item {
            display: flex;
            padding: 6px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-label {
            font-weight: 600;
            width: 180px;
            color: #475569;
          }
          .info-value {
            color: #1e293b;
          }
          .status-summary {
            background: #fefefe;
            border-left: 4px solid #fbfbfb;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .status-critical { color: #dc2626; font-weight: bold; }
          .status-warning { color: #f59e0b; font-weight: bold; }
          .status-normal { color: #10b981; font-weight: bold; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 12px 0; 
          }
          th, td { 
            border: 1px solid #e2e8f0; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f1f5f9; 
            font-weight: 600;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            margin: 15px 0;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
          }
          .stat-label {
            font-size: 10pt;
            color: #64748b;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 16pt;
            font-weight: bold;
            color: #1e293b;
          }
          .recommendation-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
          }
          .formula-box {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            margin: 10px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #94a3b8;
          }
          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
          }
          @media print {
            .print-btn { display: none; }
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">📄 Сохранить как PDF</button>
        
        <h1>Отчет по технологическому показателю</h1>
        
        <!-- 1. Общая информация -->
        <h2>1. Общая информация</h2>
        <div class="header-info">
          <div class="info-grid">
            <div class="info-item"><span class="info-label">ID отчета:</span><span class="info-value">${reportId}</span></div>
            <div class="info-item"><span class="info-label">Тип показателя:</span><span class="info-value">${metricData.title}</span></div>
            <div class="info-item"><span class="info-label">Категория:</span><span class="info-value">${activeCategory === "microclimate" ? "Микроклимат" : activeCategory === "herd" ? "Состояние стада" : activeCategory === "consumption" ? "Потребление ресурсов" : "Производственные параметры"}</span></div>
            <div class="info-item"><span class="info-label">Объект:</span><span class="info-value">${getSelectedWorkshopNames()}</span></div>
            <div class="info-item"><span class="info-label">Птичник:</span><span class="info-value">${getSelectedHouseNames()}</span></div>
            <div class="info-item"><span class="info-label">Партия:</span><span class="info-value">${getSelectedBatchNames()}</span></div>
            <div class="info-item"><span class="info-label">Возраст птицы:</span><span class="info-value">${selectedAge === "0-3" ? "0-3 дня" : "21-30 дней"}</span></div>
            <div class="info-item"><span class="info-label">Период анализа:</span><span class="info-value">${metricData.chartData.length} измерений (с 12:00 до 14:00)</span></div>
            <div class="info-item"><span class="info-label">Дата формирования:</span><span class="info-value">${new Date().toLocaleString('ru-RU')}</span></div>
            <div class="info-item"><span class="info-label">Источник данных:</span><span class="info-value">Датчики / Система мониторинга</span></div>
            <div class="info-item"><span class="info-label">Количество измерений:</span><span class="info-value">${metricData.chartData.length}</span></div>
            <div class="info-item"><span class="info-label">Версия шаблона:</span><span class="info-value">v2.1</span></div>
          </div>
        </div>
        
        <!-- 2. Сводка состояния -->
        <h2>2. Сводка состояния</h2>
        <div class="status-summary">
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Общий статус:</span><span class="info-value ${metricData.status === 'critical' ? 'status-critical' : metricData.status === 'warning' ? 'status-warning' : 'status-normal'}">${metricData.status === "critical" ? "Критично" : metricData.status === "warning" ? "Требует внимания" : "Норма"}</span></div>
            <div class="info-item"><span class="info-label">Тренд:</span><span class="info-value">${trend}</span></div>
            <div class="info-item"><span class="info-label">Риск:</span><span class="info-value ${riskClass}">${riskLevel}</span></div>
            <div class="info-item"><span class="info-label">Однородность стада:</span><span class="info-value">${uniformity > 85 ? "Высокая" : uniformity > 70 ? "Средняя" : "Низкая"}</span></div>
            <div class="info-item"><span class="info-label">Критических отклонений:</span><span class="info-value">${stats.exceedCount > 0 ? `Выявлено ${stats.exceedCount}` : "Не выявлено"}</span></div>
            <div class="info-item"><span class="info-label">Проблемных зон:</span><span class="info-value">${metricData.problemLocations.length}</span></div>
          </div>
        </div>
        
        <!-- 3. Основные статистические показатели -->
        <h2>3. Основные статистические показатели</h2>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Среднее значение</div><div class="stat-value">${stats.avg.toFixed(2)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Медиана</div><div class="stat-value">${stats.median.toFixed(2)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Минимальное значение</div><div class="stat-value">${stats.min.toFixed(2)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Максимальное значение</div><div class="stat-value">${stats.max.toFixed(2)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Размах</div><div class="stat-value">${range.toFixed(2)}${formatUnit()}</div></div>
        </div>
        
        <!-- 4. Показатели вариативности и однородности -->
        <h2>4. Показатели вариативности и однородности</h2>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Дисперсия</div><div class="stat-value">${variance.toFixed(4)} — ${variance < 0.1 ? "низкий разброс" : "средний разброс"}</div></div>
          <div class="stat-card"><div class="stat-label">Стандартное отклонение</div><div class="stat-value">${stats.stdDev.toFixed(3)}${formatUnit()} — ${stats.stdDev < 0.5 ? "стабильное распределение" : "нестабильное распределение"}</div></div>
          <div class="stat-card"><div class="stat-label">Коэффициент вариации (CV)</div><div class="stat-value">${cv.toFixed(2)}% — ${cv < 5 ? "высокая однородность" : cv < 10 ? "средняя однородность" : "низкая однородность"}</div></div>
          <div class="stat-card"><div class="stat-label">Однородность стада</div><div class="stat-value">${uniformity.toFixed(0)}% — ${uniformity >= 85 ? "выше нормативной" : uniformity >= 70 ? "в пределах нормы" : "ниже нормы"}</div></div>
        </div>
        
        <!-- 5. Формула коэффициента вариации -->
        <h2>5. Формула коэффициента вариации</h2>
        <div class="formula-box">
          <strong>CV = σ / μ × 100%</strong><br>
          Где σ — стандартное отклонение (${stats.stdDev.toFixed(3)}${formatUnit()}), μ — среднее значение (${stats.avg.toFixed(2)}${formatUnit()})<br>
          Для птицеводства коэффициент вариации является одним из ключевых показателей однородности стада.
        </div>
        
        <!-- 6. Нормативные значения -->
        <h2>6. Нормативные значения</h2>
        <table>
          <thead><tr><th>Показатель</th><th>Норма</th><th>Источник</th></tr></thead>
          <tbody>
            <tr><td>${metricData.title} ${selectedAge === "0-3" ? "0-3 дня" : "21-30 дней"}</td><td>${metricData.targetRange}</td><td>Стандарт предприятия</td></tr>
            <tr><td>CV</td><td>≤ 10%</td><td>Технологический норматив</td></tr>
            <tr><td>Однородность</td><td>≥ 85%</td><td>Производственный KPI</td></tr>
          </tbody>
        </table>
        
        <!-- 7. Динамика показателя за период -->
        <h2>7. Динамика показателя за период</h2>
        <table>
          <thead>
            <tr><th>Время</th><th>Значение</th><th>Норма</th><th>Отклонение</th><th>Статус</th></tr>
          </thead>
          <tbody>
            ${metricData.chartData.map(item => {
              const deviation = item.value - stats.avg
              let status = ''
              let statusClass = ''
              if (metricData.targetRange.includes("<")) {
                if (item.value >= stats.targetMax) {
                  status = 'Критическое превышение'
                  statusClass = 'status-critical'
                } else {
                  status = ''
                  statusClass = 'status-normal'
                }
              } else if (metricData.targetRange.includes("-")) {
                if (item.value > stats.targetMax) {
                  status = 'Превышение'
                  statusClass = 'status-critical'
                } else if (item.value < stats.targetMin) {
                  status = 'Понижение'
                  statusClass = 'status-warning'
                } else {
                  status = ''
                  statusClass = 'status-normal'
                }
              } else if (metricData.targetRange.includes(">")) {
                if (item.value < stats.targetMin) {
                  status = 'Критическое понижение'
                  statusClass = 'status-critical'
                } else {
                  status = ''
                  statusClass = 'status-normal'
                }
              }
              return `<tr><td>${item.day}</td><td>${item.value}${formatUnit()}</td><td>${metricData.targetRange}</td><td>${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}${formatUnit()}</td><td class="${statusClass}">${status}</td></tr>`
            }).join('')}
          </tbody>
        </table>
        
        <!-- 8. Анализ динамики -->
        <h2>8. Анализ динамики</h2>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Изменение за период</div><div class="stat-value">${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Среднесуточный прирост</div><div class="stat-value">${avgDailyGain > 0 ? '+' : ''}${avgDailyGain.toFixed(3)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Направление тренда</div><div class="stat-value">${trendDirection === 'up' ? 'Положительный' : trendDirection === 'down' ? 'Отрицательный' : 'Стабильный'}</div></div>
          <div class="stat-card"><div class="stat-label">Стабильность</div><div class="stat-value">${stats.stdDev < 0.5 ? "Высокая" : stats.stdDev < 1 ? "Средняя" : "Низкая"}</div></div>
        </div>
        
        <!-- 9. Проблемные зоны -->
        <h2>9. Проблемные зоны</h2>
        ${metricData.problemLocations.length > 0 ? `
          <table>
            <thead><tr><th>Локация</th><th>Значение</th><th>Отклонение</th><th>Уровень риска</th><th>Статус</th></tr></thead>
            <tbody>
              ${metricData.problemLocations.map(loc => {
                const deviation = parseFloat(loc.value) - stats.avg
                return `<tr>
                  <td>${loc.name}</td>
                  <td>${loc.value}</td>
                  <td>${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}${formatUnit()}</td>
                  <td>${loc.status === 'critical' ? 'Высокий' : 'Средний'}</td>
                  <td class="${loc.status === 'critical' ? 'status-critical' : 'status-warning'}">${loc.status === 'critical' ? '⚠ Требует внимания' : '⚠ Внимание'}</td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        ` : '<p>Проблемных зон не выявлено</p>'}
        
        <!-- 10. Возможные причины отклонений -->
        <h2>10. Возможные причины отклонений</h2>
        <table>
          <thead><tr><th>Фактор</th><th>Вероятность</th></tr></thead>
          <tbody>
            <tr><td>Снижение потребления корма</td><td>${metricData.status === 'critical' ? 'Высокая' : 'Средняя'}</td></tr>
            <tr><td>Нарушение микроклимата</td><td>${metricData.title.includes("Температура") ? 'Высокая' : 'Средняя'}</td></tr>
            <tr><td>Повышенная плотность посадки</td><td>Низкая</td></tr>
            <tr><td>Ошибки системы поения</td><td>Низкая</td></tr>
          </tbody>
        </table>
        
        <!-- 11. Рекомендации системы -->
        <h2>11. Рекомендации системы</h2>
        <div class="recommendation-box">
          <ul style="margin-left: 20px;">
            ${metricData.status === 'critical' ? '<li>Критическое состояние — требуется немедленное вмешательство</li>' : ''}
            ${metricData.problemLocations.length > 0 ? '<li>Провести контрольный анализ в проблемных зонах</li>' : ''}
            <li>Проверить систему мониторинга и калибровку датчиков</li>
            <li>${metricData.title.includes("Температура") ? 'Проверить систему вентиляции и охлаждения' : 'Продолжить мониторинг в штатном режиме'}</li>
            <li>Выполнить повторный анализ через 24 часа</li>
          </ul>
        </div>
        
        <!-- 12. Производственные KPI -->
        <h2>12. Производственные KPI</h2>
        <table>
          <thead><tr><th>KPI</th><th>Значение</th><th>Целевое значение</th><th>Статус</th></tr></thead>
          <tbody>
            <tr><td>${metricData.title}</td><td>${stats.avg.toFixed(2)}${formatUnit()}</td><td>${metricData.targetRange}</td><td class="${metricData.status === 'critical' ? 'status-critical' : 'status-normal'}">${metricData.status === 'critical' ? '⚠' : '✓'}</td></tr>
            <tr><td>CV</td><td>${cv.toFixed(2)}%</td><td>&lt;10%</td><td class="${cv < 10 ? 'status-normal' : 'status-warning'}">${cv < 10 ? '✓' : '⚠'}</td></tr>
            <tr><td>Однородность</td><td>${uniformity.toFixed(0)}%</td><td>&gt;85%</td><td class="${uniformity >= 85 ? 'status-normal' : 'status-warning'}">${uniformity >= 85 ? '✓' : '⚠'}</td></tr>
          </tbody>
        </table>
        
        <!-- 13. Прогноз -->
        <h2>13. Прогноз</h2>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Ожидаемое значение через 7 дней</div><div class="stat-value">${forecastValue.toFixed(2)}${formatUnit()}</div></div>
          <div class="stat-card"><div class="stat-label">Риск ухудшения</div><div class="stat-value ${riskClass}">${riskLevel}</div></div>
          <div class="stat-card"><div class="stat-label">Прогноз однородности</div><div class="stat-value">${cv < 5 ? 'Стабильный' : cv < 10 ? 'Требует контроля' : 'Нестабильный'}</div></div>
        </div>
        
        <!-- 14. Системная информация -->
        <h2>14. Системная информация</h2>
        <div class="header-info">
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Сформирован автоматически:</span><span class="info-value">Да</span></div>
            <div class="info-item"><span class="info-label">Модуль:</span><span class="info-value">AgroControl Monitoring</span></div>
            <div class="info-item"><span class="info-label">Источник:</span><span class="info-value">IoT</span></div>
            <div class="info-item"><span class="info-label">Время генерации:</span><span class="info-value">&lt; 1 сек</span></div>
            <div class="info-item"><span class="info-label">Статус данных:</span><span class="info-value">Актуальны</span></div>
          </div>
        </div>
        
        <div class="footer">
          <p>АгроКонтроль — Ситуационный центр</p>
          <p>Отчет сформирован автоматически. Данные актуальны на момент генерации.</p>
        </div>
      </body>
    </html>
  `
}

  const handleFullReport = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    if (printWindow) {
      printWindow.document.write(generateFullReportHTML())
      printWindow.document.close()
      printWindow.focus()
    }
  }

  const handlePDFReport = () => {
    const pdfWindow = window.open('', '_blank', 'width=800,height=600')
    if (pdfWindow) {
      pdfWindow.document.write(generateFullReportHTML())
      pdfWindow.document.close()
      pdfWindow.print()
      pdfWindow.close()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-600 bg-red-500/12 border-red-500/20 dark:text-red-300"
      case "warning":
        return "text-amber-600 bg-amber-500/12 border-amber-500/20 dark:text-amber-300"
      default:
        return "text-emerald-600 bg-emerald-500/12 border-emerald-500/20 dark:text-emerald-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Критично"
      case "warning":
        return "Внимание"
      default:
        return "Норма"
    }
  }

  const getChartColor = (status: string) => {
    switch (status) {
      case "critical":
        return "#ef4444"
      case "warning":
        return "#f59e0b"
      default:
        return "#10b981"
    }
  }

  // Функция обновления задач
  const refreshTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?metricId=${activeMetric}`)
      const text = await response.text()
      if (text) {
        const data = JSON.parse(text)
        setMetricTasks(data.tasks || [])
      }
    } catch (error) {
      console.error("Ошибка обновления задач:", error)
    }
  }

  return (
    <>
      <aside className="dashboard-panel p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="break-words text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {metricData.title}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportsModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Скачать отчет
              <Download className="size-4" />
            </button>
            <Button
              onClick={() => setIsTaskModalOpen(true)}
              className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <ClipboardPlus className="size-4" />
              Создать задачу
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,300px)]">
          <div className="flex flex-col gap-4">
            <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Текущее значение
              </p>
              <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
                {metricData.currentValue}
              </div>
              <Badge className={`mt-3 border ${getStatusColor(metricData.status)}`}>
                {getStatusText(metricData.status)}
              </Badge>
            </div>

            <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Целевой диапазон
              </p>
              <div className="mt-3 whitespace-nowrap text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
                {metricData.targetRange}
              </div>
              <Badge className="mt-3 border border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                Норма
              </Badge>
            </div>
          </div>

          <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Динамика за 7 дней</h3>
            <GrafanaStyleChart
              title={metricData.title}
              data={metricData.chartData}
              dataKey="value"
              xAxisKey="day"
              unit={formatUnit()}
              color={getChartColor(metricData.status)}
              onExpand={() => setIsChartModalOpen(true)}
              targetMin={stats.targetMin}
              targetMax={stats.targetMax}
            />
          </div>

          <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Проблемные локации</h3>
            <div className="mt-4 space-y-3">
              {metricData.problemLocations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                  Отклонений по локациям не найдено.
                </div>
              ) : (
                metricData.problemLocations.map((location) => (
                  <div
                    key={location.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 px-4 py-3 dark:border-white/8"
                  >
                    <span className="min-w-0 break-words text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {location.name}
                    </span>
                    <span
                      className={
                        location.status === "critical"
                          ? "shrink-0 text-sm font-semibold text-red-600 dark:text-red-300"
                          : "shrink-0 text-sm font-semibold text-amber-600 dark:text-amber-300"
                      }
                    >
                      {location.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* НОВАЯ СЕКЦИЯ: Связанные задачи */}
        <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Связанные задачи
              {metricTasks.length > 0 && (
                <span className="ml-2 text-xs text-zinc-500">({metricTasks.length})</span>
              )}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTaskModalOpen(true)}
              className="rounded-full bg-zinc-950 text-white hover:white dark:bg-white dark:text-white dark:hover:white"
            >
              <ClipboardPlus className="size-4" />
              Создать задачу
            </Button>
          </div>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-500"></div>
            </div>
          ) : metricTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 p-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Нет связанных задач
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-2 text-xs"
              >
                Создать первую задачу
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {metricTasks.map((task) => {
                const StatusIcon = taskStatusConfig[task.status]?.icon || PlayCircle
                const isOverdue = task.status !== "completed" && new Date(task.deadline) < new Date()
                const displayStatus = isOverdue ? "overdue" : task.status
                
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-zinc-200 dark:border-white/8 p-4 hover:bg-zinc-50 dark:hover:bg-white/4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {task.title}
                          </h4>
                          <Badge className={cn("text-xs", taskStatusConfig[displayStatus]?.bg)}>
                            <StatusIcon className="size-3 mr-1" />
                            {taskStatusConfig[displayStatus]?.label || task.status}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <User className="size-3" />
                            <span>{task.responsible || "Не назначен"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                              {formatTaskDate(task.deadline)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={cn("size-2 rounded-full", taskPriorityConfig[task.priority]?.dot || "bg-gray-400")} />
                            <span className="capitalize">{taskPriorityConfig[task.priority]?.label || task.priority}</span>
                          </div>
                        </div>
                      </div>
                      
                      {task.incidentId && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Инцидент: {task.incidentId}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* {metricData.relatedIncident && (
          <div className="mt-5 rounded-[24px] border border-amber-500/20 bg-amber-500/8 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {metricData.relatedIncident.title}
                </h4>
                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-200/85">
                  {metricData.relatedIncident.description}
                </p>
              </div>
            </div>
          </div>
        )} */}

      </aside>

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        onFullReport={handleFullReport}
        onPDFReport={handlePDFReport}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        metricTitle={metricData.title}
        metricId={activeMetric}
        currentValue={metricData.currentValue}
        //onTaskCreated={refreshTasks}
      />

      <FullChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        title={metricData.title}
        data={metricData.chartData}
        dataKey="value"
        xAxisKey="day"
        unit={formatUnit()}
        color={getChartColor(metricData.status)}
        chartType={chartType}
        onChartTypeChange={(type: string) => setChartType(type as "area" | "line" | "bar")}
      />
    </>
  )
}
