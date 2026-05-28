"use client"

import { X } from "lucide-react"
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
} from "recharts"

interface FullChartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: any[]
  dataKey: string
  xAxisKey: string
  unit: string
  color: string
  chartType: string
  onChartTypeChange: (type: string) => void
}

export function FullChartModal({
  isOpen,
  onClose,
  title,
  data,
  dataKey,
  xAxisKey,
  unit,
  color,
  chartType,
  onChartTypeChange,
}: FullChartModalProps) {
  if (!isOpen) return null

  // Вычисляем динамические ticks на основе данных
  const getDynamicTicks = () => {
    if (!data || data.length === 0) return undefined
    const values = data.map(item => item[dataKey]).filter(v => v !== undefined && v !== null)
    if (values.length === 0) return undefined
    const min = Math.min(...values)
    const max = Math.max(...values)
    const step = (max - min) / 8
    const ticks: number[] = []
    for (let i = 0; i <= 8; i++) {
      ticks.push(+(min + i * step).toFixed(1))
    }
    return ticks
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              ticks={getDynamicTicks()}
            />
            <Tooltip formatter={(value: any) => [`${value}${unit}`, title]} />
            <Legend />
            <Area type="linear" dataKey={dataKey} stroke={color} fill={`${color}20`} strokeWidth={3} />
          </AreaChart>
        )
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              ticks={getDynamicTicks()}
            />
            <Tooltip formatter={(value: any) => [`${value}${unit}`, title]} />
            <Legend />
            <Line type="linear" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              ticks={getDynamicTicks()}
            />
            <Tooltip formatter={(value: any) => [`${value}${unit}`, title]} />
            <Legend />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              tickFormatter={(value) => `${value}${unit}`}
              domain={['auto', 'auto']}
              ticks={getDynamicTicks()}
            />
            <Tooltip formatter={(value: any) => [`${value}${unit}`, title]} />
            <Legend />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`${color}20`} strokeWidth={3} />
          </AreaChart>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900">
              Детализация: {title}
            </h3>
            <select
              value={chartType}
              onChange={(e) => onChartTypeChange(e.target.value)}
              className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white"
            >
              <option value="area">Область</option>
              <option value="line">Линия</option>
              <option value="bar">Столбцы</option>
            </select>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 p-6 min-h-[500px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={500}>
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 text-sm text-zinc-500 flex justify-between">
          <span>Всего точек: {data.length}</span>
          <span>Единица измерения: {unit}</span>
        </div> */}
      </div>
    </div>
  )
}