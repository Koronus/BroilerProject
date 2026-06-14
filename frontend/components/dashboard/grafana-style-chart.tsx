"use client"

import { useState } from "react"
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

  // Функция для форматирования значения с нужным количеством знаков
  const formatValue = (value: number) => {
    // Для влажности и процентов - 2 знака
    if (unit === "%" || title.toLowerCase().includes("влажность")) {
      return value.toFixed(2)
    }
    // Для температуры - 1 знак
    if (unit === "°C" || title.toLowerCase().includes("температура")) {
      return value.toFixed(1)
    }
    // Для остальных - 2 знака
    return value.toFixed(2)
  }

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

  // Форматтер для оси Y
  const yAxisTickFormatter = (value: number) => {
    return `${formatValue(value)}${unit}`
  }

  // Форматтер для Tooltip
  const tooltipFormatter = (value: any) => {
    return [`${formatValue(value)}${unit}`, title]
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
              tickFormatter={yAxisTickFormatter}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={tooltipFormatter} />}
            {showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
            
            <NormalRangeBand />
            <Area
              type="linear"
              dataKey={dataKey}
              name={title}
              stroke={color}
              fill={`${color}20`}
              strokeWidth={2}
              connectNulls={true}
              isAnimationActive={false}
            />
          </AreaChart>
        )
      case "line":
        return (
          <LineChart data={data} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={yAxisTickFormatter}
              domain={['auto', 'auto']}
             
              allowDecimals={true}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            
            <NormalRangeBand />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, stroke: color }}
              connectNulls={true}
              isAnimationActive={false}
            />
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={data} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={yAxisTickFormatter}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            
            <NormalRangeBand />
            <Bar
              dataKey={dataKey}
              name={title}
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              isAnimationActive={false}
            />
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
              tickFormatter={yAxisTickFormatter}
              domain={['auto', 'auto']}
              tickCount={8}
            />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            
            <NormalRangeBand />
            <Area
              type="linear"
              dataKey={dataKey}
              name={title}
              stroke={color}
              fill={`${color}20`}
              strokeWidth={2}
              connectNulls={true}
              isAnimationActive={false}
            />
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
