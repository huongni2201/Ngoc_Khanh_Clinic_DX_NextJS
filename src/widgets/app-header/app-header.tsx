"use client"

import * as React from "react"
import { Search, Bell, HelpCircle, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  className?: string
  onOpenMobileMenu?: () => void
}

export function AppHeader({ className, onOpenMobileMenu }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-xs",
        className
      )}
    >
      {/* Left section with mobile hamburger and Search Bar */}
      <div className="flex items-center gap-3 w-full max-w-xl">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Mở menu"
            className="flex size-9 lg:hidden shrink-0 items-center justify-center rounded-lg text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Tìm bệnh nhân theo tên, SĐT, số định danh, mã BN..."
            className="h-10 w-full rounded-lg border-border bg-background pl-9 pr-4 text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex size-9 items-center justify-center rounded-lg text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* Help Button */}
        <button
          type="button"
          aria-label="Trợ giúp"
          className="flex size-9 items-center justify-center rounded-lg text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <HelpCircle className="size-5" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-border/60" />

        {/* User Info */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer select-none group">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-border/80 bg-muted flex items-center justify-center">
            {/* Receptionist Avatar SVG */}
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-full object-cover"
            >
              <rect width="36" height="36" fill="#eff6ff" />
              <circle cx="18" cy="13" r="6" fill="#e2b897" />
              <path
                d="M12 13C12 9.686 14.686 7 18 7C21.314 7 24 9.686 24 13C24 14.5 23.5 15.5 22.5 16.5C21.5 14 20 13 18 13C16 13 14.5 14 13.5 16.5C12.5 15.5 12 14.5 12 13Z"
                fill="#1e293b"
              />
              <path
                d="M10 32C10 26 13.5 22 18 22C22.5 22 26 26 26 32"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <path
                d="M16 22L18 27L20 22"
                fill="#2563eb"
              />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Nguyễn Thị Lan
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              Lễ tân
            </span>
          </div>
          <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </header>
  )
}
