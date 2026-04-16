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

export function DashboardHeader( {
      activeSection,
      onSectionChange,
    }: DashboardHeaderProps){
  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    []
  )

  return (
    <header className="border-b border-black/5 px-4 py-4 dark:border-white/8 md:px-6">
      <div className="flex flex-nowrap items-center justify-between gap-6 overflow-x-auto">
        <div className="min-w-0 flex-1">
          <nav className="flex flex-nowrap items-center gap-1.5 overflow-hidden text-sm text-zinc-500 dark:text-zinc-400">
            <span className="dashboard-chip">АгроКонтроль</span>
            <ChevronRight className="size-4 opacity-50" />
            <span className="truncate">Ситуационный центр</span>
            <ChevronRight className="size-4 opacity-50" />
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
              Директор по качеству
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
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

          <div className="flex shrink-0 items-center gap-3">
            <div className="dashboard-chip whitespace-nowrap">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              Реальное время
            </div>

            <div className="dashboard-chip hidden whitespace-nowrap md:inline-flex">
              <Clock3 className="size-3.5" />
              {timestamp}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-2 py-2 text-left shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10">
                  <Avatar className="size-9 border border-black/5 dark:border-white/10">
                    <AvatarImage src="/avatar.jpg" alt="Павел Романов" />
                    <AvatarFallback className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                      ПР
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden min-w-0 sm:block">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Павел Романов
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Контроль качества
                    </div>
                  </div>
                  <ChevronDown className="hidden size-4 text-zinc-400 sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-black/5 bg-white/95 dark:border-white/10 dark:bg-zinc-900/95">
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuItem>Настройки</DropdownMenuItem>
                <DropdownMenuItem>Выйти</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
