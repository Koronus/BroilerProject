"use client"

import { ChevronRight, ChevronDown, User } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type DashboardSection = "technical" | "incidents" | "notifications"

interface DashboardHeaderProps {
  activeSection: DashboardSection
  onSectionChange: (section: DashboardSection) => void
}

export function DashboardHeader({
  activeSection,
  onSectionChange,
}: DashboardHeaderProps) {
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
        {/* Timestamp */}
        <div className="text-zinc-500 text-sm hidden lg:block">
          14.04.2026 17:13:25
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
              <span className="text-sm text-foreground hidden lg:block">Павел Романов</span>
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
