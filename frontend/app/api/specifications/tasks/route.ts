// app/api/tasks/route.ts
import { NextResponse } from 'next/server'

// Хранилище задач (временно, в памяти)
// При перезапуске сервера задачи будут теряться!
let tasks: any[] = []

// GET - получить все задачи
export async function GET() {
  return NextResponse.json({ tasks })
}

// POST - создать новую задачу
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newTask = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    tasks.push(newTask)
    console.log("Создана задача:", newTask)
    
    return NextResponse.json({ task: newTask }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании задачи" },
      { status: 500 }
    )
  }
}

// DELETE - удалить задачу
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  tasks = tasks.filter(task => task.id !== id)
  
  return NextResponse.json({ success: true })
}