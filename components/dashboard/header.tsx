"use client"

import { ChevronDown, ChevronRight, Clock3, User } from "lucide-react"
import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type DashboardSection = "technical" | "incidents" | "notifications"

interface DashboardHeaderProps {
  activeSection: DashboardSection
  onSectionChange: (section: DashboardSection) => void
}

export function DashboardHeader({
  activeSection,
  onSectionChange,
}: DashboardHeaderProps) {
  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    []
  )

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-background">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
          АгроКонтроль
        </span>
        <ChevronRight className="size-4 text-zinc-600" />
        <span className="text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
          Ситуационный центр
        </span>
        <ChevronRight className="size-4 text-zinc-600" />
        <span className="text-zinc-400 font-medium">Директор по качеству</span>
      </nav>

      {/* Center Tabs */}
      <Tabs
        value={activeSection}
        onValueChange={(value) => onSectionChange(value as DashboardSection)}
        className="hidden md:block"
      >
        <TabsList className="bg-background border border-zinc-800">
          <TabsTrigger
            value="technical"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400"
          >
            Технические показатели
          </TabsTrigger>
          <TabsTrigger
            value="incidents"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400"
          >
            Реестр инцидентов
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400"
          >
            Уведомления
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm text-zinc-500">Реальное время</span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-zinc-500 text-sm hidden lg:flex">
          <Clock3 className="size-3.5" />
          {timestamp}
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-zinc-800 rounded-lg px-2 py-1.5 transition-colors">
              <Avatar className="size-8 border border-zinc-700">
                <AvatarImage src="/avatar.jpg" alt="Павел Романов" />
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                  ПР
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-foreground">
                  Павел Романов
                </div>
                <div className="text-xs text-zinc-500">
                  Контроль качества
                </div>
              </div>
              <ChevronDown className="size-4 text-zinc-500 hidden lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
              <User className="size-4 mr-2" />
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
              Настройки
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}