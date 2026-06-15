// components/dashboard/LightingDetails.tsx
"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GrafanaStyleChart } from "./grafana-style-chart"
import { FullChartModal } from "./full-chart-modal"

interface LightingData {
  avgLux: number | null
  minLux: number | null
  maxLux: number | null
  illuminanceStatus: "normal" | "low" | "high" | "no_data"
  sensorCount: number
  lastUpdated: string | null
}

interface LightingDetailsProps {
  onClose: () => void
  ageType: "0_7" | "7_plus"
}

// Функция для группировки данных по временным интервалам (усреднение)
const aggregateByTimeInterval = (
  data: { value: number; timestamp: Date }[],
  intervalMinutes: number = 5
): { time: string; value: number }[] => {
  const groups = new Map<string, { sum: number; count: number; time: Date }>()
  
  data.forEach(point => {
    const minutes = point.timestamp.getMinutes()
    const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes
    const roundedTime = new Date(point.timestamp)
    roundedTime.setMinutes(roundedMinutes)
    roundedTime.setSeconds(0)
    roundedTime.setMilliseconds(0)
    
    const timeKey = roundedTime.toISOString()
    
    if (!groups.has(timeKey)) {
      groups.set(timeKey, { sum: point.value, count: 1, time: roundedTime })
    } else {
      const group = groups.get(timeKey)!
      group.sum += point.value
      group.count++
    }
  })
  
  return Array.from(groups.values())
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    .map(group => ({
      time: group.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: group.sum / group.count
    }))
}

export function LightingDetails({ onClose, ageType }: LightingDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [isIlluminanceModalOpen, setIsIlluminanceModalOpen] = useState(false)
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area")
  const [data, setData] = useState<LightingData>({
    avgLux: null,
    minLux: null,
    maxLux: null,
    illuminanceStatus: "no_data",
    sensorCount: 0,
    lastUpdated: null
  })
  const [illuminanceChartData, setIlluminanceChartData] = useState<{ day: string; value: number }[]>([])

  const LIGHT_SENSORS = ["LIGHT-01", "LIGHT-02", "LIGHT-03", "LIGHT-04", "LIGHT-05"]
  const minNorm = ageType === "0_7" ? 25 : 5
  const maxNorm = ageType === "0_7" ? 40 : 15

  useEffect(() => {
    loadLightingData()
    const interval = setInterval(loadLightingData, 300000)
    return () => clearInterval(interval)
  }, [ageType])

  const loadLightingData = async () => {
    try {
      const sensorPromises = LIGHT_SENSORS.map(sensorCode =>
        fetch(`/api/telemetry/readings?sensorCode=${sensorCode}&limit=1`).then(r => r.json())
      )
      const sensorResults = await Promise.all(sensorPromises)
      
      let minLux = Infinity
      let maxLux = -Infinity
      let sumLux = 0
      let activeSensors = 0
      let lastUpdated: string | null = null
      
      sensorResults.forEach((readings) => {
        if (readings && readings.length > 0 && readings[0].value) {
          const value = readings[0].value
          minLux = Math.min(minLux, value)
          maxLux = Math.max(maxLux, value)
          sumLux += value
          activeSensors++
          if (!lastUpdated || readings[0].measuredAt > lastUpdated) {
            lastUpdated = readings[0].measuredAt
          }
        }
      })
      
      const historyPromises = LIGHT_SENSORS.map(sensorCode =>
        fetch(`/api/telemetry/readings?sensorCode=${sensorCode}&limit=200`).then(r => r.json())
      )
      const historyResults = await Promise.all(historyPromises)
      
      let allReadings: { value: number; timestamp: Date }[] = []
      historyResults.forEach((readings) => {
        readings.forEach((reading: any) => {
          const date = new Date(reading.measuredAt)
          allReadings.push({
            value: reading.value,
            timestamp: date
          })
        })
      })
      
      allReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      
      const aggregatedData = aggregateByTimeInterval(allReadings, 5)
      setIlluminanceChartData(aggregatedData.map(r => ({
        day: r.time,
        value: r.value
      })))
      
      let illuminanceStatus: "normal" | "low" | "high" | "no_data" = "no_data"
      
      if (activeSensors >= 2) {
        const avgLux = sumLux / activeSensors
        
        if (avgLux < minNorm) illuminanceStatus = "low"
        else if (avgLux > maxNorm) illuminanceStatus = "high"
        else illuminanceStatus = "normal"
        
        setData({
          avgLux,
          minLux: minLux !== Infinity ? minLux : null,
          maxLux: maxLux !== -Infinity ? maxLux : null,
          illuminanceStatus,
          sensorCount: activeSensors,
          lastUpdated
        })
      } else {
        setData({
          avgLux: null,
          minLux: minLux !== Infinity ? minLux : null,
          maxLux: maxLux !== -Infinity ? maxLux : null,
          illuminanceStatus: "no_data",
          sensorCount: activeSensors,
          lastUpdated
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки данных освещения:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIlluminanceStatusText = () => {
    switch (data.illuminanceStatus) {
      case "normal": return "Норма"
      case "low": return "Ниже нормы"
      case "high": return "Выше нормы"
      default: return "Нет данных"
    }
  }

  const getIlluminanceStatusColor = () => {
    switch (data.illuminanceStatus) {
      case "normal": return "text-green-600 bg-green-50 border-green-200"
      case "low": return "text-red-600 bg-red-50 border-red-200"
      case "high": return "text-orange-600 bg-orange-50 border-orange-200"
      default: return "text-gray-500 bg-gray-50 border-gray-200"
    }
  }

  const getTitle = () => {
    if (ageType === "0_7") return "Освещенность"
    return "Освещенность"
  }

  if (loading) {
    return (
      <aside className="dashboard-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{getTitle()}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-black/5">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
        </div>
      </aside>
    )
  }

  return (
    <>
      <aside className="dashboard-panel p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Детализация
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 p-2 text-zinc-500 transition hover:bg-black/5"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-black/5 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Средняя освещенность
            </p>
            <div className="mt-3 text-3xl font-semibold text-zinc-950">
              {data.avgLux !== null ? `${data.avgLux.toFixed(1)} лк` : "—"}
            </div>
            <Badge className={`mt-3 border ${getIlluminanceStatusColor()}`}>
              {getIlluminanceStatusText()}
            </Badge>
          </div>

          <div className="rounded-[24px] border border-black/5 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Целевой диапазон
            </p>
            <div className="mt-3 text-3xl font-semibold text-zinc-950">
              {minNorm} - {maxNorm} лк
            </div>
            <Badge className="mt-3 border border-emerald-500/20 bg-emerald-500/12 text-emerald-600">
              Норма
            </Badge>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5">
          <h3 className="text-sm font-medium text-zinc-900 mb-3">Статистика освещения</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-zinc-500">Минимум</p>
              <p className="text-xl font-semibold">{data.minLux !== null ? `${data.minLux.toFixed(1)} лк` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Максимум</p>
              <p className="text-xl font-semibold">{data.maxLux !== null ? `${data.maxLux.toFixed(1)} лк` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Среднее</p>
              <p className="text-xl font-semibold">{data.avgLux !== null ? `${data.avgLux.toFixed(1)} лк` : "—"}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-3 text-center">
            Активных датчиков: {data.sensorCount} из 5
          </p>
        </div>

        {illuminanceChartData.length > 0 && (
          <div className="mt-5">
            <GrafanaStyleChart
              title="Динамика освещенности"
              data={illuminanceChartData}
              dataKey="value"
              xAxisKey="day"
              unit="лк"
              color="#10b981"
              targetMin={minNorm}
              targetMax={maxNorm}
              onExpand={() => setIsIlluminanceModalOpen(true)}
            />
          </div>
        )}

        {data.lastUpdated && (
          <p className="text-xs text-zinc-400 mt-4 text-right">
            Обновлено: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        )}
      </aside>

      <FullChartModal
        isOpen={isIlluminanceModalOpen}
        onClose={() => setIsIlluminanceModalOpen(false)}
        title="Динамика освещенности"
        data={illuminanceChartData}
        dataKey="value"
        xAxisKey="day"
        unit="лк"
        color="#10b981"
        chartType={chartType}
        onChartTypeChange={(type: string) => setChartType(type as "area" | "line" | "bar")}
      />
    </>
  )
}