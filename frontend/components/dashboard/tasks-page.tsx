"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TaskStatus = "new" | "inProgress" | "review" | "completed" | "overdue"
type TaskPriority = "critical" | "high" | "medium" | "low"

interface Task {
  id: string
  title: string
  description: string
  metricTitle: string
  currentValue: string
  priority: TaskPriority
  responsible: string
  status: TaskStatus
  createdAt: string
  deadline: string
  incidentId?: string
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  new: { label: "Новая", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  inProgress: { label: "В работе", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  review: { label: "На проверке", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  completed: { label: "Выполнена", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  overdue: { label: "Просрочена", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
}

const priorityConfig: Record<TaskPriority, { label: string; dot: string }> = {
  critical: { label: "Критический", dot: "bg-red-500" },
  high: { label: "Высокий", dot: "bg-orange-500" },
  medium: { label: "Средний", dot: "bg-yellow-500" },
  low: { label: "Низкий", dot: "bg-green-500" },
}

// ========== ТЕСТОВЫЕ ДАННЫЕ ДЛЯ РАЗРАБОТКИ ==========
const getMockTasks = (): Task[] => {
  return [
    {
      id: "mock-1",
      title: "Проверить температуру в бройлерной",
      description: "Измерить температуру в 4-м птичнике, есть отклонения от нормы",
      metricTitle: "Температура",
      currentValue: "24.5°C",
      priority: "high",
      responsible: "Иванов Иван",
      status: "inProgress",
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-2",
      title: "Проверить уровень аммиака",
      description: "Превышение уровня аммиака в воздухе",
      metricTitle: "Аммиак",
      currentValue: "15 ppm",
      priority: "critical",
      responsible: "Петров Петр",
      status: "new",
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-3",
      title: "Откалибровать датчики влажности",
      description: "Датчики показывают некорректные значения",
      metricTitle: "Влажность",
      currentValue: "45%",
      priority: "medium",
      responsible: "Сидоров Сидор",
      status: "review",
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-4",
      title: "Проверить систему вентиляции",
      description: "Жалобы на духоту в помещении",
      metricTitle: "Воздухообмен",
      currentValue: "1200 м³/ч",
      priority: "high",
      responsible: "Кузнецов Николай",
      status: "inProgress",
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-5",
      title: "Замена фильтров в системе поения",
      description: "Плановое обслуживание",
      metricTitle: "Качество воды",
      currentValue: "норма",
      priority: "low",
      responsible: "Михайлов Андрей",
      status: "completed",
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-6",
      title: "Проверить освещение в птичнике",
      description: "Несколько ламп не работают",
      metricTitle: "Освещение",
      currentValue: "180 люкс",
      priority: "medium",
      responsible: "Смирнов Дмитрий",
      status: "new",
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

// Резервное получение задач из localStorage
const getTasksFromStorage = (): Task[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("tasks")
  if (stored && stored !== "[]") {
    return JSON.parse(stored)
  }
  // Если в localStorage пусто, сохраняем тестовые данные
  const mockTasks = getMockTasks()
  localStorage.setItem("tasks", JSON.stringify(mockTasks))
  return mockTasks
}

// Уникальные значения для фильтров
const getUniqueValues = (tasks: Task[], key: keyof Task) => {
  return [...new Set(tasks.map(task => task[key]).filter(Boolean))]
}

// Маппинг статусов
const mapStatusFromBackend = (backendStatus: string): TaskStatus => {
  const statusMap: Record<string, TaskStatus> = {
    'OPEN': 'new',
    'IN_PROGRESS': 'inProgress',
    'RESOLVED': 'review',
    'CLOSED': 'completed',
    'OVERDUE': 'overdue'
  }
  return statusMap[backendStatus] || 'new'
}

const mapStatusToBackend = (frontendStatus: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    'new': 'OPEN',
    'inProgress': 'IN_PROGRESS',
    'review': 'RESOLVED',
    'completed': 'CLOSED',
    'overdue': 'OVERDUE'
  }
  return statusMap[frontendStatus] || 'OPEN'
}

// Маппинг приоритетов
const mapPriorityFromBackend = (backendPriority: string): TaskPriority => {
  const priorityMap: Record<string, TaskPriority> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
    'CRITICAL': 'critical'
  }
  return priorityMap[backendPriority] || 'medium'
}

const mapPriorityToBackend = (frontendPriority: TaskPriority): string => {
  const priorityMap: Record<TaskPriority, string> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
    'critical': 'CRITICAL'
  }
  return priorityMap[frontendPriority] || 'MEDIUM'
}

// Загрузка задач с бэкенда
const loadTasksFromBackend = async (): Promise<Task[] | null> => {
  try {
    const response = await fetch('/api/tasks')
    if (!response.ok) return null
    const backendTasks = await response.json()
    
    if (backendTasks && backendTasks.length > 0) {
      return backendTasks.map((task: any) => ({
        id: task.id,
        title: task.nameTask,
        description: task.descriptionTask,
        metricTitle: task.nameIndicator,
        currentValue: task.valueIndicator,
        priority: mapPriorityFromBackend(task.priority),
        responsible: task.responsible,
        status: mapStatusFromBackend(task.status),
        createdAt: task.createTask,
        deadline: task.termTask,
      }))
    }
    return null
  } catch {
    return null
  }
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [responsibleFilter, setResponsibleFilter] = useState<string>("all")
  const [metricFilter, setMetricFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  
  // Состояние для отображения активных фильтров
  const [showFilters, setShowFilters] = useState(false)

  // Загрузка задач при монтировании компонента
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true)
      
      // Пытаемся загрузить с бэкенда
      const backendTasks = await loadTasksFromBackend()
      
      let loadedTasks: Task[]
      
      if (backendTasks && backendTasks.length > 0) {
        loadedTasks = backendTasks
        // Сохраняем в localStorage как резервную копию
        localStorage.setItem("tasks", JSON.stringify(loadedTasks))
      } else {
        // Fallback на localStorage или мок-данные
        loadedTasks = getTasksFromStorage()
      }
      
      // Обновляем статус просроченных задач
      const updatedTasks = loadedTasks.map(task => {
        if (task.status === "completed") return task
        const isOverdue = new Date(task.deadline) < new Date()
        return { ...task, status: isOverdue ? "overdue" : task.status }
      })
      
      setTasks(updatedTasks)
      setLoading(false)
    }

    loadTasks()
    
    // Обновляем статус просроченных задач каждую минуту
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === "completed") return task
        const isOverdue = new Date(task.deadline) < new Date()
        return { ...task, status: isOverdue ? "overdue" : task.status }
      }))
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Обновление статуса задачи
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Обновляем локальное состояние сразу для лучшего UX
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    )
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
    
    // Отправляем на бэкенд
    try {
      const updatedTask = {
        id: taskId,
        nameTask: task.title,
        descriptionTask: task.description,
        nameIndicator: task.metricTitle,
        valueIndicator: task.currentValue,
        measure: "шт",
        priority: mapPriorityToBackend(task.priority),
        responsible: task.responsible,
        status: mapStatusToBackend(newStatus),
        createTask: task.createdAt,
        termTask: task.deadline
      }

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      })
    } catch {
      // Игнорируем ошибки
    }
  }

  // Получение уникальных значений для фильтров
  const uniqueResponsible = getUniqueValues(tasks, "responsible")
  const uniqueMetrics = getUniqueValues(tasks, "metricTitle")

  // Применение всех фильтров
  const filteredTasks = tasks.filter((task) => {
    // Поиск
    const matchesSearch = searchQuery === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Статус
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    
    // Приоритет
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    
    // Ответственный
    const matchesResponsible = responsibleFilter === "all" || task.responsible === responsibleFilter
    
    // Связанный показатель
    const matchesMetric = metricFilter === "all" || task.metricTitle === metricFilter
    
    // Период по дате создания
    let matchesDate = true
    if (dateFrom) {
      const taskDate = new Date(task.createdAt).setHours(0, 0, 0, 0)
      const fromDate = new Date(dateFrom).setHours(0, 0, 0, 0)
      if (taskDate < fromDate) matchesDate = false
    }
    if (dateTo && matchesDate) {
      const taskDate = new Date(task.createdAt).setHours(0, 0, 0, 0)
      const toDate = new Date(dateTo).setHours(0, 0, 0, 0)
      if (taskDate > toDate) matchesDate = false
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesResponsible && matchesMetric && matchesDate
  })

  // Сброс всех фильтров
  const resetFilters = () => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setResponsibleFilter("all")
    setMetricFilter("all")
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
  }

  // Количество активных фильтров
  const activeFiltersCount = [
    statusFilter !== "all",
    priorityFilter !== "all",
    responsibleFilter !== "all",
    metricFilter !== "all",
    dateFrom !== "",
    dateTo !== "",
    searchQuery !== ""
  ].filter(Boolean).length

  const stats = {
    all: tasks.length,
    new: tasks.filter(t => t.status === "new").length,
    inProgress: tasks.filter(t => t.status === "inProgress").length,
    review: tasks.filter(t => t.status === "review").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => t.status === "overdue").length,
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="flex items-center justify-center h-full py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Задачи</h1>
            <p className="mt-2 text-sm text-zinc-500">Управление задачами и инцидентами</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[300px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по задачам..."
                className="h-10 border-zinc-300 bg-white pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative gap-2"
            >
              <Calendar className="size-4" />
              Фильтры
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Панель расширенных фильтров */}
      {showFilters && (
        <div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-700">Расширенные фильтры</h3>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-zinc-500">
              <X className="size-3 mr-1" />
              Сбросить все
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новые</option>
                <option value="inProgress">В работе</option>
                <option value="review">На проверке</option>
                <option value="completed">Выполнены</option>
                <option value="overdue">Просрочены</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Приоритет</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option value="all">Все приоритеты</option>
                <option value="critical">Критический</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Ответственный</label>
              <select
                value={responsibleFilter}
                onChange={(e) => setResponsibleFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option value="all">Все ответственные</option>
                {uniqueResponsible.map(resp => (
                  <option key={resp} value={resp}>{resp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Связанный показатель</label>
              <select
                value={metricFilter}
                onChange={(e) => setMetricFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option value="all">Все показатели</option>
                {uniqueMetrics.map(metric => (
                  <option key={metric} value={metric}>{metric}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Дата создания (от)</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Дата создания (до)</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid gap-3 border-b border-zinc-200 px-6 py-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <p className="text-xs text-zinc-500">Всего задач</p>
          <p className="text-2xl font-bold text-zinc-900">{stats.all}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-600">Новые</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs text-orange-600">В работе</p>
          <p className="text-2xl font-bold text-orange-700">{stats.inProgress}</p>
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <p className="text-xs text-purple-600">На проверке</p>
          <p className="text-2xl font-bold text-purple-700">{stats.review}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600">Выполнены</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-600">Просрочены</p>
          <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
        </div>
      </section>

      {/* Активные фильтры */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 px-6 py-3">
          <span className="text-xs text-zinc-500">Активные фильтры:</span>
          {statusFilter !== "all" && (
            <Badge className="bg-blue-100 text-blue-700">
              Статус: {statusConfig[statusFilter as TaskStatus]?.label}
              <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-blue-900">×</button>
            </Badge>
          )}
          {priorityFilter !== "all" && (
            <Badge className="bg-orange-100 text-orange-700">
              Приоритет: {priorityConfig[priorityFilter as TaskPriority]?.label}
              <button onClick={() => setPriorityFilter("all")} className="ml-1 hover:text-orange-900">×</button>
            </Badge>
          )}
          {responsibleFilter !== "all" && (
            <Badge className="bg-purple-100 text-purple-700">
              Ответственный: {responsibleFilter}
              <button onClick={() => setResponsibleFilter("all")} className="ml-1 hover:text-purple-900">×</button>
            </Badge>
          )}
          {metricFilter !== "all" && (
            <Badge className="bg-green-100 text-green-700">
              Показатель: {metricFilter}
              <button onClick={() => setMetricFilter("all")} className="ml-1 hover:text-green-900">×</button>
            </Badge>
          )}
          {dateFrom && (
            <Badge className="bg-cyan-100 text-cyan-700">
              С: {new Date(dateFrom).toLocaleDateString()}
              <button onClick={() => setDateFrom("")} className="ml-1 hover:text-cyan-900">×</button>
            </Badge>
          )}
          {dateTo && (
            <Badge className="bg-cyan-100 text-cyan-700">
              По: {new Date(dateTo).toLocaleDateString()}
              <button onClick={() => setDateTo("")} className="ml-1 hover:text-cyan-900">×</button>
            </Badge>
          )}
          {searchQuery && (
            <Badge className="bg-gray-100 text-gray-700">
              Поиск: {searchQuery}
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-gray-900">×</button>
            </Badge>
          )}
        </div>
      )}

      {/* Таблица задач */}
      <div className="flex-1 overflow-auto px-6 py-5">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Задача</th>
                  <th className="px-4 py-3 font-medium">Показатель</th>
                  <th className="px-4 py-3 font-medium">Приоритет</th>
                  <th className="px-4 py-3 font-medium">Ответственный</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Срок</th>
                  <th className="px-4 py-3 font-medium">Создана</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      Нет задач по выбранным фильтрам
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isOverdue = task.status !== "completed" && new Date(task.deadline) < new Date()
                    const displayStatus = isOverdue ? "overdue" : task.status
                    
                    return (
                      <tr key={task.id} className="hover:bg-zinc-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900">{task.title}</div>
                          <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{task.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-zinc-900">{task.metricTitle}</div>
                          <div className="text-xs text-zinc-500">Текущее: {task.currentValue}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={cn("size-2 rounded-full", priorityConfig[task.priority].dot)} />
                            <span>{priorityConfig[task.priority].label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-900">{task.responsible}</td>
                        <td className="px-4 py-3">
                          <select
                            value={displayStatus}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium border cursor-pointer",
                              statusConfig[displayStatus].bg,
                              statusConfig[displayStatus].border
                            )}
                          >
                            <option value="new">Новая</option>
                            <option value="inProgress">В работе</option>
                            <option value="review">На проверке</option>
                            <option value="completed">Выполнена</option>
                            <option value="overdue">Просрочена</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(isOverdue && "text-red-600 font-medium")}>
                            {formatDate(task.deadline)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {formatDate(task.createdAt)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}