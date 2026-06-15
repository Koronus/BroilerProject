// components/dashboard/LightingUniformityDetails.tsx
"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GrafanaStyleChart } from "./grafana-style-chart"
import { FullChartModal } from "./full-chart-modal"

interface UniformityData {
  currentUniformity: number | null
  minLux: number | null
  maxLux: number | null
  avgLux: number | null
  status: "normal" | "warning" | "violation" | "no_data"
  sensorCount: number
  lastUpdated: string | null
}

interface LightingUniformityDetailsProps {
  onClose: () => void
}

const aggregateUniformityByTime = (
  readings: { value: number; timestamp: Date; sensorCode: string }[],
  intervalMinutes: number = 5
): { day: string; value: number }[] => {
  // Группируем по времени
  const timeGroups = new Map<string, { values: number[]; time: Date }>()
  
  readings.forEach(reading => {
    const minutes = reading.timestamp.getMinutes()
    const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes
    const roundedTime = new Date(reading.timestamp)
    roundedTime.setMinutes(roundedMinutes)
    roundedTime.setSeconds(0)
    roundedTime.setMilliseconds(0)
    
    const timeKey = roundedTime.toISOString()
    
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, { values: [reading.value], time: roundedTime })
    } else {
      timeGroups.get(timeKey)!.values.push(reading.value)
    }
  })
  
  // Рассчитываем равномерность для каждого временного интервала
  const result: { day: string; value: number }[] = []
  
  timeGroups.forEach((group, key) => {
    if (group.values.length >= 2) {
      const min = Math.min(...group.values)
      const max = Math.max(...group.values)
      const avg = group.values.reduce((a, b) => a + b, 0) / group.values.length
      const uniformity = ((max - min) / avg) * 100
      
      result.push({
        day: group.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: Math.min(uniformity, 100)
      })
    }
  })
  
  return result.sort((a, b) => a.day.localeCompare(b.day))
}

export function LightingUniformityDetails({ onClose }: LightingUniformityDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area")
  const [data, setData] = useState<UniformityData>({
    currentUniformity: null,
    minLux: null,
    maxLux: null,
    avgLux: null,
    status: "no_data",
    sensorCount: 0,
    lastUpdated: null
  })
  const [uniformityChartData, setUniformityChartData] = useState<{ day: string; value: number }[]>([])

  const LIGHT_SENSORS = ["LIGHT-01", "LIGHT-02", "LIGHT-03", "LIGHT-04", "LIGHT-05"]

  useEffect(() => {
    loadUniformityData()
    const interval = setInterval(loadUniformityData, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadUniformityData = async () => {
    try {
      // Получаем последние показания
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
      
      let currentUniformity: number | null = null
      let status: "normal" | "warning" | "violation" | "no_data" = "no_data"
      
      if (activeSensors >= 2) {
        const avgLux = sumLux / activeSensors
        currentUniformity = (maxLux - minLux) / avgLux * 100
        
        if (currentUniformity <= 20) status = "normal"
        else if (currentUniformity <= 35) status = "warning"
        else status = "violation"
        
        setData({
          currentUniformity,
          minLux,
          maxLux,
          avgLux,
          status,
          sensorCount: activeSensors,
          lastUpdated
        })
      } else {
        setData({
          currentUniformity: null,
          minLux: activeSensors > 0 ? minLux : null,
          maxLux: activeSensors > 0 ? maxLux : null,
          avgLux: null,
          status: "no_data",
          sensorCount: activeSensors,
          lastUpdated
        })
      }
      
      // Получаем историю для графика
      const historyPromises = LIGHT_SENSORS.map(sensorCode =>
        fetch(`/api/telemetry/readings?sensorCode=${sensorCode}&limit=200`).then(r => r.json())
      )
      const historyResults = await Promise.all(historyPromises)
      
      let allReadings: { value: number; timestamp: Date; sensorCode: string }[] = []
      historyResults.forEach((readings, index) => {
        readings.forEach((reading: any) => {
          const date = new Date(reading.measuredAt)
          allReadings.push({
            value: reading.value,
            timestamp: date,
            sensorCode: LIGHT_SENSORS[index]
          })
        })
      })
      
      allReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      
      const aggregatedData = aggregateUniformityByTime(allReadings, 5)
      setUniformityChartData(aggregatedData)
      
    } catch (error) {
      console.error("Ошибка загрузки данных равномерности:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = () => {
    switch (data.status) {
      case "normal": return "Норма"
      case "warning": return "Предупреждение"
      case "violation": return "Нарушение равномерности"
      default: return "Недостаточно данных"
    }
  }

  const getStatusColor = () => {
    switch (data.status) {
      case "normal": return "text-green-600 bg-green-50"
      case "warning": return "text-amber-600 bg-amber-50"
      case "violation": return "text-red-600 bg-red-50"
      default: return "text-gray-500 bg-gray-50"
    }
  }

  const getChartColor = () => {
    // switch (data.status) {
    //   case "normal": return "#10b981"
    //   case "warning": return "#f59e0b"
    //   case "violation": return "#ef4444"
    //   default: return "#3b82f6"
    // }
    return "#10b981"
  }

  if (loading) {
    return (
      <aside className="dashboard-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Равномерность освещения</h2>
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
              Равномерность освещения
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 p-2 text-zinc-500 transition hover:bg-black/5"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[24px] border border-black/5 bg-white/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-semibold">
              {data.currentUniformity !== null ? `${data.currentUniformity.toFixed(1)}%` : "—"}
            </span>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                data.status === "normal" ? "bg-green-500" :
                data.status === "warning" ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(data.currentUniformity || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Норма: ≤20% | {data.currentUniformity !== null && data.currentUniformity > 20 ? "Требуется внимание" : "В пределах нормы"}
          </p>
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

        {uniformityChartData.length > 0 && (
          <div className="mt-5">
            <GrafanaStyleChart
              title="Динамика равномерности освещения"
              data={uniformityChartData}
              dataKey="value"
              xAxisKey="day"
              unit="%"
              color={getChartColor()}
              targetMin={0}
              targetMax={20}
              onExpand={() => setIsChartModalOpen(true)}
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
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        title="Динамика равномерности освещения"
        data={uniformityChartData}
        dataKey="value"
        xAxisKey="day"
        unit="%"
        color={getChartColor()}
        chartType={chartType}
        onChartTypeChange={(type: string) => setChartType(type as "area" | "line" | "bar")}
      />
    </>
  )
}