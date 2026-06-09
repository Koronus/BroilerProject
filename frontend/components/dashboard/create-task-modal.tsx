// components/create-task-modal.tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  metricTitle?: string
  metricId?: string
  currentValue?: string
  onTaskCreated?: () => void
}

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  metricTitle, 
  metricId,
  currentValue,
  onTaskCreated 
}: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nameTask: '',
    descriptionTask: '',
    nameIndicator: metricTitle || '',
    valueIndicator: currentValue || '',
    measure: '',
    priority: 'MEDIUM',
    responsible: '',
    status: 'OPEN',
    termTask: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Подготавливаем данные для отправки на бэкенд
      const taskData = {
        nameTask: formData.nameTask,
        descriptionTask: formData.descriptionTask,
        nameIndicator: metricTitle || formData.nameIndicator,
        valueIndicator: currentValue || formData.valueIndicator,
        measure: formData.measure || 'шт',
        priority: formData.priority.toUpperCase(),
        responsible: formData.responsible,
        status: 'OPEN',
        termTask: new Date(formData.termTask).toISOString()
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Ошибка создания задачи')
      }

      // Закрываем модалку и обновляем список
      onClose()
      if (onTaskCreated) onTaskCreated()
      
      // Сбрасываем форму
      setFormData({
        nameTask: '',
        descriptionTask: '',
        nameIndicator: metricTitle || '',
        valueIndicator: currentValue || '',
        measure: '',
        priority: 'MEDIUM',
        responsible: '',
        status: 'OPEN',
        termTask: ''
      })
    } catch (error) {
      console.error('Error creating task:', error)
      alert(error instanceof Error ? error.message : 'Ошибка при создании задачи')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Создать задачу</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название задачи *</label>
            <Input
              name="nameTask"
              value={formData.nameTask}
              onChange={handleChange}
              required
              placeholder="Введите название задачи"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              name="descriptionTask"
              value={formData.descriptionTask}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Опишите задачу подробнее"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ответственный *</label>
            <Input
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              required
              placeholder="ФИО ответственного"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Приоритет</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="LOW">Низкий</option>
              <option value="MEDIUM">Средний</option>
              <option value="HIGH">Высокий</option>
              <option value="CRITICAL">Критический</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Срок выполнения *</label>
            <Input
              type="datetime-local"
              name="termTask"
              value={formData.termTask}
              onChange={handleChange}
              required
            />
          </div>

          {metricTitle && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Связано с показателем: {metricTitle}
              {currentValue && ` (текущее значение: ${currentValue})`}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}