"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from "recharts"
import { Expand } from "lucide-react"

interface GrafanaStyleChartProps {
  title: string
  data: any[]
  dataKey: string
  xAxisKey: string
  unit?: string
  color?: string
  showLegend?: boolean
  onExpand?: () => void
  targetMin?: number
  targetMax?: number
}

type ChartType = "area" | "line" | "bar"

export function GrafanaStyleChart({
  title,
  data,
  dataKey,
  xAxisKey,
  unit = "",
  color = "#3b82f6",
  showLegend = true,
  onExpand,
  targetMin,
  targetMax,
}: GrafanaStyleChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area")
  const [showGrid, setShowGrid] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)

  // Разделяем данные на сегменты для отрисовки разными цветами
  const coloredSegments = useMemo(() => {
    if (!data || data.length === 0 || targetMin === undefined || targetMax === undefined) {
      return [{ data, color: color, isOutlier: false }]
    }

    const segments: { data: any[]; color: string; isOutlier: boolean }[] = []
    let currentSegment: any[] = []
    let currentIsOutlier: boolean = false

    data.forEach((point, index) => {
      const value = point[dataKey]
      const isOutlier = value < targetMin || value > targetMax

      if (currentSegment.length === 0) {
        currentIsOutlier = isOutlier
        currentSegment.push(point)
      } else if (currentIsOutlier === isOutlier) {
        currentSegment.push(point)
      } else {
        // Сохраняем текущий сегмент
        if (currentSegment.length > 0) {
          segments.push({
            data: [...currentSegment],
            color: currentIsOutlier ? "#ef4444" : color,
            isOutlier: currentIsOutlier,
          })
        }
        // Начинаем новый сегмент
        currentSegment = [point]
        currentIsOutlier = isOutlier
      }
    })

    // Добавляем последний сегмент
    if (currentSegment.length > 0) {
      segments.push({
        data: [...currentSegment],
        color: currentIsOutlier ? "#ef4444" : color,
        isOutlier: currentIsOutlier,
      })
    }

    return segments
  }, [data, dataKey, targetMin, targetMax, color])

  // Компонент для зоны нормы
  const NormalRangeBand = () => {
    if (targetMin === undefined || targetMax === undefined || data.length === 0) return null
    return (
      <ReferenceArea
        y1={targetMin}
        y2={targetMax}
        fill="#10b981"
        fillOpacity={0.1}
        stroke="#10b981"
        strokeOpacity={0.3}
        ifOverflow="visible"
      />
    )
  }

  // Отрисовка сегментированной области (Area)
  const renderColoredArea = () => {
    return coloredSegments.map((segment, idx) => (
      <Area
        key={idx}
        type="linear"
        dataKey={dataKey}
        data={segment.data}
        stroke={segment.color}
        fill={`${segment.color}20`}
        strokeWidth={2}
        connectNulls={true}
        isAnimationActive={false}
      />
    ))
  }

  // Отрисовка сегментированной линии (Line)
  const renderColoredLine = () => {
    return coloredSegments.map((segment, idx) => (
      <Line
        key={idx}
        type="monotone"
        dataKey={dataKey}
        data={segment.data}
        stroke={segment.color}
        strokeWidth={2}
        dot={{ r: 3, fill: segment.color, stroke: segment.color }}
        connectNulls={true}
        isAnimationActive={false}
      />
    ))
  }

  // Отрисовка столбцов (Bar)
  const renderColoredBar = () => {
    return data.map((item, idx) => {
      const value = item[dataKey]
      const isOutlier = targetMin !== undefined && targetMax !== undefined && (value < targetMin || value > targetMax)
      return (
        <Bar
          key={idx}
          dataKey={dataKey}
          data={[item]}
          fill={isOutlier ? "#ef4444" : color}
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
          isAnimationActive={false}
        />
      )
    })
  }

  const renderChart = () => {
    const commonProps = {
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart data={data} {...commonProps}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorOutlier" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(value: any) => [`${value}${unit}`, title]} />}
            {showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
            
            <NormalRangeBand />
            {renderColoredArea()}
          </AreaChart>
        )
      case "line":
        return (
          <LineChart data={data} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(value: any) => [`${value}${unit}`, title]} />}
            {showLegend && <Legend />}
            
            <NormalRangeBand />
            {renderColoredLine()}
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={data} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(value: any) => [`${value}${unit}`, title]} />}
            {showLegend && <Legend />}
            
            <NormalRangeBand />
            {renderColoredBar()}
          </BarChart>
        )
      default:
        return (
          <AreaChart data={data} {...commonProps}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorOutlier" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(value: any) => [`${value}${unit}`, title]} />}
            {showLegend && <Legend />}
            
            <NormalRangeBand />
            {renderColoredArea()}
          </AreaChart>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden my-5 mx-2">
      <div className="flex items-center justify-between px-3 py-1 border-b border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full" />
          <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white"
          >
            <option value="area">Область</option>
            <option value="line">Линия</option>
            <option value="bar">Столбцы</option>
          </select> */}
          
          <button 
            onClick={() => onExpand?.()} 
            className="p-1.5 rounded hover:bg-zinc-200 transition-colors"
            title="Открыть увеличенный график"
          >
            <Expand className="size-4 text-zinc-500" />
          </button>
        </div>
      </div>
      
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}