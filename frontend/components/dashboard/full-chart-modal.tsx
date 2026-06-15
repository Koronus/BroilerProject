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
   ReferenceLine,
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
  targetMin?: number
  targetMax?: number
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
  targetMin,
  targetMax,
}: FullChartModalProps) {
  if (!isOpen) return null

  // Функция для форматирования значения с нужным количеством знаков
  const formatValue = (value: number) => {
    if (unit === "%" || title.toLowerCase().includes("влажность")) {
      return value.toFixed(1)
    }
    if (unit === "°C" || title.toLowerCase().includes("температура")) {
      return value.toFixed(1)
    }
    if (title.toLowerCase().includes("fcr") || title.toLowerCase().includes("конверсия")) {
      return value.toFixed(2)
    }
    return value.toFixed(2)
  }

  // Получение всех уникальных значений для оси Y
  const getAllYAxisValues = () => {
    if (!data || data.length === 0) return []
    const values = data.map(item => item[dataKey]).filter(v => v !== undefined && v !== null)
    // Сортируем и убираем дубликаты
    const uniqueSorted = [...new Set(values)].sort((a, b) => a - b)
    return uniqueSorted
  }

  // Получение всех уникальных значений для оси Y с учетом целевого диапазона
  const getYAxisTicks = () => {
    const values = getAllYAxisValues()
    if (values.length === 0) return undefined
    
    // Добавляем целевые значения, если они есть и не входят в набор
    const allValues = [...values]
    if (targetMin !== undefined && targetMin !== -Infinity && !allValues.includes(targetMin)) {
      allValues.push(targetMin)
    }
    if (targetMax !== undefined && targetMax !== Infinity && !allValues.includes(targetMax)) {
      allValues.push(targetMax)
    }
    
    // Сортируем
    allValues.sort((a, b) => a - b)
    
    // Если значений слишком много (больше 10), показываем каждое второе
    if (allValues.length > 10) {
      const step = Math.ceil(allValues.length / 8)
      return allValues.filter((_, index) => index % step === 0)
    }
    
    return allValues
  }

  const yAxisTicks = getYAxisTicks()

  // Форматтер для оси Y - показывает все значения
  const yAxisTickFormatter = (value: number) => {
    return `${formatValue(value)}${unit}`
  }

  // Форматтер для Tooltip
  const tooltipFormatter = (value: any) => {
    return [`${formatValue(value)}${unit}`, title]
  }

  // Форматтер для оси X (для временных меток)
  const xAxisTickFormatter = (value: string) => {
    return value
  }

  // Получение домена для оси Y (min и max с небольшим запасом)
  const getYAxisDomain = () => {
    const values = data.map(item => item[dataKey]).filter(v => v !== undefined && v !== null)
    if (values.length === 0) return ['auto', 'auto']
    
    let min = Math.min(...values)
    let max = Math.max(...values)
    
    // Добавляем целевой диапазон
    if (targetMin !== undefined && targetMin !== -Infinity && targetMin < min) {
      min = targetMin
    }
    if (targetMax !== undefined && targetMax !== Infinity && targetMax > max) {
      max = targetMax
    }
    
    // Добавляем небольшой запас (5% от диапазона)
    const padding = (max - min) * 0.05
    return [min - padding, max + padding]
  }

  const yAxisDomain = getYAxisDomain()

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 40, bottom: 60 },
    }

    const chartProps = {
      ...commonProps,
      children: (
        <>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fill: "#64748b", fontSize: 11 }} 
            tickFormatter={xAxisTickFormatter}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis 
            tick={{ fill: "#64748b", fontSize: 11 }} 
            tickFormatter={yAxisTickFormatter}
            domain={yAxisDomain}
            ticks={yAxisTicks}
            width={60}
            allowDecimals={true}
            label={{ 
              value: unit, 
              angle: -90, 
              position: "insideLeft",
              style: { fill: "#64748b", fontSize: 12 },
              offset: -10
            }}
          />
          <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `Время: ${label}`} />
          <Legend />
        </>
      ),
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={xAxisTickFormatter}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={yAxisTickFormatter}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              width={60}
              allowDecimals={true}
              label={{ 
                value: unit, 
                angle: -90, 
                position: "insideLeft",
                style: { fill: "#64748b", fontSize: 12 },
                offset: -10
              }}
            />
            <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `Время: ${label}`} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={`${color}20`} 
              strokeWidth={3}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
            />
            {targetMin !== undefined && targetMin !== -Infinity && (
              <ReferenceLine y={targetMin} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Нижняя граница: ${targetMin}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
            {targetMax !== undefined && targetMax !== Infinity && (
              <ReferenceLine y={targetMax} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Верхняя граница: ${targetMax}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
          </AreaChart>
        )
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={xAxisTickFormatter}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={yAxisTickFormatter}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              width={60}
              allowDecimals={true}
              label={{ 
                value: unit, 
                angle: -90, 
                position: "insideLeft",
                style: { fill: "#64748b", fontSize: 12 },
                offset: -10
              }}
            />
            <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `Время: ${label}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3} 
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
            />
            {targetMin !== undefined && targetMin !== -Infinity && (
              <ReferenceLine y={targetMin} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Нижняя граница: ${targetMin}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
            {targetMax !== undefined && targetMax !== Infinity && (
              <ReferenceLine y={targetMax} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Верхняя граница: ${targetMax}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
          </LineChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={xAxisTickFormatter}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={yAxisTickFormatter}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              width={60}
              allowDecimals={true}
              label={{ 
                value: unit, 
                angle: -90, 
                position: "insideLeft",
                style: { fill: "#64748b", fontSize: 12 },
                offset: -10
              }}
            />
            <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `Время: ${label}`} />
            <Legend />
            <Bar 
              dataKey={dataKey} 
              fill={color} 
              radius={[4, 4, 0, 0]}
            />
            {targetMin !== undefined && targetMin !== -Infinity && (
              <ReferenceLine y={targetMin} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Нижняя граница: ${targetMin}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
            {targetMax !== undefined && targetMax !== Infinity && (
              <ReferenceLine y={targetMax} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Верхняя граница: ${targetMax}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
          </BarChart>
        )
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={xAxisTickFormatter}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 11 }} 
              tickFormatter={yAxisTickFormatter}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              width={60}
              allowDecimals={true}
              label={{ 
                value: unit, 
                angle: -90, 
                position: "insideLeft",
                style: { fill: "#64748b", fontSize: 12 },
                offset: -10
              }}
            />
            <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `Время: ${label}`} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={`${color}20`} 
              strokeWidth={3}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
            />
            {targetMin !== undefined && targetMin !== -Infinity && (
              <ReferenceLine y={targetMin} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Нижняя граница: ${targetMin}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
            {targetMax !== undefined && targetMax !== Infinity && (
              <ReferenceLine y={targetMax} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Верхняя граница: ${targetMax}${unit}`, fill: "#f59e0b", fontSize: 10 }} />
            )}
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
      </div>
    </div>
  )
}