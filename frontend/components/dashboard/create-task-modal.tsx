// components/dashboard/create-task-modal.tsx
"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  metricTitle: string
  metricId: string
  currentValue: string
}

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  metricTitle, 
  metricId, 
  currentValue 
}: CreateTaskModalProps) {
  const [taskTitle, setTaskTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [responsible, setResponsible] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  const taskData = {
    title: taskTitle,
    description: description,
    priority: priority,
    responsible: responsible || "Не назначен",
    metricId: metricId,
    metricTitle: metricTitle,
    currentValue: currentValue,
  }

  try {
    // Отправляем задачу в API
    const response = await fetch('/api/specifications/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      throw new Error('Ошибка при создании задачи')
    }

    const result = await response.json()
    console.log("Задача создана:", result)

    // Очищаем форму
    setTaskTitle("")
    setDescription("")
    setPriority("medium")
    setResponsible("")
    onClose()
    
    alert(`Задача "${taskTitle}" создана!`)
  } catch (error) {
    console.error("Ошибка:", error)
    alert("Не удалось создать задачу")
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-black/5 p-5 dark:border-white/10">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Создать задачу
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/8"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Название задачи <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Например: Исправить температуру в корпусе 2"
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-white/10 dark:bg-zinc-800"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание проблемы..."
              rows={4}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-white/10 dark:bg-zinc-800"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-white/10 dark:bg-zinc-800"
              >
                <option value="critical">Критический</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ответственный
              </label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Выберите сотрудника"
                list="employees"
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-white/10 dark:bg-zinc-800"
              />
              <datalist id="employees">
                <option>Алексей Морозов</option>
                <option>Иван Соколов</option>
                <option>Павел Романов</option>
                <option>Ветеринарная служба</option>
                <option>Технический отдел</option>
              </datalist>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Связанный показатель: <span className="font-medium">{metricTitle}</span>
              <br />
              Текущее значение: <span className="font-medium">{currentValue}</span>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full border-black/10 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-transparent dark:text-zinc-300"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? "Создание..." : "Создать задачу"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}