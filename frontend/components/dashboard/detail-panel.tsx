"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ClipboardPlus, FileText, X } from "lucide-react"
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
import { CreateTaskModal } from "./create-task-modal"
import { ReportsModal } from "./reports-modal"
import { type BirdAgeGroup } from "@/components/dashboard/kpi-grid"
import { workshops, poultryHouses, batches, ageRangeOptions } from "@/lib/production-filters"

interface DetailPanelProps {
  onClose: () => void
  activeMetric: string
  activeCategory?: string
  selectedAge?: BirdAgeGroup
  selectedWorkshopIds?: string[]
  selectedHouseIds?: string[]
  selectedBatchIds?: string[]
  selectedAgeRangeId?: string
}

interface TelemetryReading {
  sensorCode: string
  value: number
  unit: string
  measuredAt: string
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
  selectedAgeRangeId = "all"
}: DetailPanelProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false)
  const [liveReading, setLiveReading] = useState<TelemetryReading | null>(null)
  let metricData = metricsDetails[activeMetric]

  useEffect(() => {
    let mounted = true
    const sensorCode = sensorCodeByMetricId[activeMetric]

    const loadTelemetry = async () => {
      if (!sensorCode) {
        if (mounted) setLiveReading(null)
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

        const readings = (await response.json()) as TelemetryReading[]
        if (mounted) {
          setLiveReading(readings[0] ?? null)
        }
      } catch {
        if (mounted) {
          setLiveReading(null)
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
  
  // Универсальный парсинг targetRange
  let targetMin = -Infinity
  let targetMax = Infinity
  const targetRangeStr = metricData.targetRange.trim()
  
  // Проверка на формат "min-max" (например, "39.4-40.5")
  if (targetRangeStr.includes("-") && !targetRangeStr.includes("<") && !targetRangeStr.includes(">")) {
    const parts = targetRangeStr.split("-")
    targetMin = parseFloat(parts[0]?.replace(/[^0-9.,]/g, '').replace(',', '.') || "-Infinity")
    targetMax = parseFloat(parts[1]?.replace(/[^0-9.,]/g, '').replace(',', '.') || "Infinity")
  }
  // Проверка на формат "< значение" (например, "< 1.5%")
  else if (targetRangeStr.includes("<")) {
    const match = targetRangeStr.match(/<\s*([0-9.,]+)/)
    if (match) {
      targetMax = parseFloat(match[1].replace(',', '.'))
      targetMin = -Infinity
    }
  }
  // Проверка на формат "> значение" (например, "> 90%")
  else if (targetRangeStr.includes(">")) {
    const match = targetRangeStr.match(/>\s*([0-9.,]+)/)
    if (match) {
      targetMin = parseFloat(match[1].replace(',', '.'))
      targetMax = Infinity
    }
  }
  
  console.log("targetRange:", targetRangeStr)
  console.log("targetMin:", targetMin, "targetMax:", targetMax)
  
  const inNormCount = values.filter(v => v >= targetMin && v <= targetMax).length
  const normPercent = (inNormCount / values.length) * 100
  const exceedCount = values.filter(v => v > targetMax).length
  
  return { avg, median, min, max, stdDev, normPercent, exceedCount, targetMin, targetMax }
}

  const stats = calculateStats()

  // Распределение по времени суток (имитация на основе имеющихся данных)
  const getTimeDistribution = () => {
    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    return metricData.chartData.map((item, index) => ({
      day: item.day,
      value: item.value,
      timeOfDay: index < 2 ? "Ночь" : index < 4 ? "Утро" : index < 6 ? "День" : "Вечер"
    }))
  }

  // ========== ФУНКЦИЯ ГЕНЕРАЦИИ ПОЛНОГО ОТЧЕТА ==========

  const generateFullReportHTML = () => {
    const timeDistribution = getTimeDistribution()
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 40px; 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white;
              line-height: 1.5;
            }
            h1 { color: #1e293b; border-bottom: 2px; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #334155; margin-top: 30px; margin-bottom: 15px; border-left: 4px; padding-left: 12px; }
            h3 { color: #475569; margin-top: 20px; margin-bottom: 10px; }
            .header-info {
              background: #f8fafc;
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
            }
            .executive-summary {
              background: #f0fdf4;
              border-left: 4px solid #10b981;
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .status-critical { color: #dc2626; }
            .status-warning { color: #f59e0b; }
            .status-normal { color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 16px;
              margin: 20px 0;
            }
            .stat-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
            }
            .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
            .recommendation-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              border-radius: 12px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
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
              border-radius: 8px;
              cursor: pointer;
            }
            @media print {
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Сохранить как PDF</button>
          
          <h1 style="text-align: center;">ОТЧЁТ</h1>
          <p><strong>По показателю:</strong> ${metricData.title}</p>
          
          <div class="header-info">
            <p><strong>Объект:</strong> ${getSelectedWorkshopNames()}</p>
            <p><strong>Птичники:</strong> ${getSelectedHouseNames()}</p>
            <p><strong>Партии:</strong> ${getSelectedBatchNames()}</p>
            <p><strong>Период:</strong> ${metricData.chartData[0]?.day} - ${metricData.chartData[metricData.chartData.length-1]?.day} (7 дней)</p>
            <p><strong>Дата генерации отчета:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            <p><strong>Возраст птицы:</strong> ${selectedAge === "0-3" ? "0-3 дня" : "21-30 дней"}</p>
          </div>
          
          
          
          <!-- 2. Статистические показатели -->
          <h2>Статистические показатели</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Среднее значение</div>
              <div class="stat-value ${metricData.status === "critical" ? 'status-critical' : metricData.status === "warning" ? 'status-warning' : 'status-normal'}">
                ${stats.avg.toFixed(2)}${formatUnit()}
              </div>
              
            </div>
            <div class="stat-card">
              <div class="stat-label">Медиана</div>
              <div class="stat-value">${stats.median.toFixed(2)}${formatUnit()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Минимальное значение</div>
              <div class="stat-value">${stats.min.toFixed(2)}${formatUnit()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Максимальное значение</div>
              <div class="stat-value ${stats.max > stats.targetMax ? 'status-critical' : ''}">
                ${stats.max.toFixed(2)}${formatUnit()}
              </div>
            </div>
            
            
          </div>
          
          <!-- 3. Распределение по дням -->
          <h2>Динамика за период</h2>
          
          <table>
            <thead>
              <tr><th>День</th><th>Значение</th><th>Норма</th><th>Статус</th></tr>
            </thead>
            <tbody>
              ${metricData.chartData.map(item => {
                let status = ''
                let statusClass = ''
                
                // Для формата "< значение" (критические показатели, должны быть НИЖЕ порога)
                if (metricData.targetRange.includes("<")) {
                  if (item.value >= stats.targetMax) {
                    status = '⚠ Критическое превышение'
                    statusClass = 'status-critical'
                  } else {
                    status = '✓ Норма'
                    statusClass = 'status-normal'
                  }
                }
                // Для формата "min-max"
                else if (metricData.targetRange.includes("-") && !metricData.targetRange.includes("<") && !metricData.targetRange.includes(">")) {
                  if (item.value > stats.targetMax) {
                    status = '⚠ Превышение'
                    statusClass = 'status-critical'
                  } else if (item.value < stats.targetMin) {
                    status = '⚠ Понижение'
                    statusClass = 'status-warning'
                  } else {
                    status = '✓ Норма'
                    statusClass = 'status-normal'
                  }
                }
                // Для формата "> значение"
                else if (metricData.targetRange.includes(">")) {
                  if (item.value < stats.targetMin) {
                    status = '⚠ Критическое понижение'
                    statusClass = 'status-critical'
                  } else {
                    status = '✓ Норма'
                    statusClass = 'status-normal'
                  }
                }
                
                return `
                  <tr>
                    <td>${item.day}</td>
                    <td>${item.value}${formatUnit()}</td>
                    <td>${metricData.targetRange}</td>
                    <td class="${statusClass}">${status}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          
          <!-- 4. Проблемные локации -->
          <h2>Проблемные локации</h2>
          ${metricData.problemLocations.length > 0 ? `
            <table>
              <thead><tr><th>Локация</th><th>Значение</th><th>Статус</th></tr></thead>
              <tbody>
                ${metricData.problemLocations.map(loc => `
                  <tr>
                    <td>${loc.name}</td>
                    <td>${loc.value}</td>
                    <td class="${loc.status === 'critical' ? 'status-critical' : 'status-warning'}">
                      ${loc.status === 'critical' ? '⚠ Критично' : '⚠ Требует внимания'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>Отклонений по локациям не найдено</p>'}
          
          <!-- 5. Связанный инцидент -->
          ${metricData.relatedIncident ? `
            <h2>Связанные инциденты</h2>
            <div style="background: #fef3c7; padding: 16px; border-radius: 12px;">
              <strong>${metricData.relatedIncident.title}</strong>
              <p style="margin-top: 8px;">${metricData.relatedIncident.description}</p>
            </div>
          ` : ''}
          
         
          
          <div class="footer">
            <p>Сформировано автоматически</p>
            <p>Источник данных: ${metricData.chartData.length} измерений</p>
            <p>АгроКонтроль — Ситуационный центр</p>
          </div>
        </body>
      </html>
    `
  }

  const formatUnit = () => {
    if (metricData.title.includes("Температура")) return "°C"
    if (metricData.title.includes("Аммиак")) return " ppm"
    if (metricData.title.includes("Вес")) return metricData.currentValue.includes("кг") ? " кг" : " г"
    if (metricData.title.includes("%")) return "%"
    return ""
  }

  // ========== ОБНОВЛЕННЫЙ ПОЛНЫЙ ОТЧЕТ ==========
  const handleFullReport = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    if (printWindow) {
      printWindow.document.write(generateFullReportHTML())
      printWindow.document.close()
      printWindow.focus()
      printWindow.onbeforeunload = () => { window.focus() }
    }
  }

  // PDF отчет (компактный)
  const handlePDFReport = () => {
  const pdfWindow = window.open('', '_blank', 'width=800,height=600')
  if (pdfWindow) {
    pdfWindow.document.write(generateFullReportHTML())
    pdfWindow.document.close()
    
    // Автоматически вызвать печать/сохранение
    pdfWindow.print()
    pdfWindow.close()
    // Не закрываем окно сразу, но основная страница активна
    // pdfWindow.onafterprint = () => {
    //   pdfWindow.close()
    //   window.focus() // Возвращаем фокус на основную страницу
    // }
  }
}

  // Excel отчет (CSV экспорт)
 // ========== Excel отчет (CSV экспорт) с фильтрами и статистикой ==========

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

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

  const formatYAxis = (value: number) => {
    if (metricData.title.includes("Температура")) return `${value}°C`
    if (metricData.title.includes("FCR") || metricData.title.includes("Конверсия")) return value.toString()
    if (metricData.title.includes("Аммиак")) return `${value} ppm`
    if (metricData.title.includes("Вес")) return metricData.currentValue.includes("кг") ? `${value} кг` : `${value} г`
    if (metricData.title.includes("Потребление корма")) return metricData.currentValue.includes("кг") ? `${value} кг` : `${value} г`
    if (metricData.title.includes("Потребление воды")) return metricData.currentValue.includes("мл") ? `${value} мл` : `${value} л`
    return `${value}%`
  }

  const formatTooltip = (value: number) => {
    if (metricData.title.includes("Температура")) return [`${value}°C`, metricData.title]
    if (metricData.title.includes("FCR") || metricData.title.includes("Конверсия")) return [value.toString(), metricData.title]
    if (metricData.title.includes("Аммиак")) return [`${value} ppm`, metricData.title]
    if (metricData.title.includes("Вес")) {
      const unit = metricData.currentValue.includes("кг") ? "кг" : "г"
      return [`${value} ${unit}`, metricData.title]
    }
    return [`${value}`, metricData.title]
  }

  return (
    <>
      <aside className="dashboard-panel p-5 md:p-6">
        {/* ... остальной JSX (без изменений) ... */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Детализация
            </p>
            <h2 className="mt-2 break-words text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              {metricData.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 p-2 text-zinc-500 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/8"
            aria-label="Закрыть панель"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
            <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
              {metricData.targetRange}
            </div>
            <Badge className="mt-3 border border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
              Норма
            </Badge>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Динамика за 7 дней</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor(metricData.status)} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={getChartColor(metricData.status)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.16)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={formatYAxis} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.96)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "16px",
                    color: "#18181b",
                  }}
                  formatter={formatTooltip}
                  labelStyle={{ color: "#71717a" }}
                />
                <Area type="monotone" dataKey="value" stroke={getChartColor(metricData.status)} strokeWidth={2.5} fillOpacity={1} fill="url(#detailMetric)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4">
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 px-4 py-4 dark:border-white/8"
                >
                  <span className="min-w-0 break-words text-sm font-medium text-zinc-900 dark:text-zinc-100">{location.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={location.status === "critical" ? "text-sm font-semibold text-red-600 dark:text-red-300" : "text-sm font-semibold text-amber-600 dark:text-amber-300"}>
                      {location.value}
                    </span>
                    <Badge
                      className={
                        location.status === "critical"
                          ? "border border-red-500/20 bg-red-500/12 text-red-600 dark:text-red-300"
                          : "border border-amber-500/20 bg-amber-500/12 text-amber-600 dark:text-amber-300"
                      }
                    >
                      {location.status === "critical" ? "Критично" : "Внимание"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {metricData.relatedIncident && (
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
        )}

        {/* Кнопки */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsReportsModalOpen(true)}
            className="rounded-full border-black/10 bg-white/80 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/4 dark:text-zinc-200 dark:hover:bg-white/8"
          >
            <FileText className="size-4" />
            Отчеты
          </Button>
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <ClipboardPlus className="size-4" />
            Создать задачу
          </Button>
        </div>
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
      />
    </>
  )
}
