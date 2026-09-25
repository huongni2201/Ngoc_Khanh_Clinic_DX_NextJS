"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  HelpCircleIcon,
  Menu01Icon,
  Notification02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
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
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 sm:px-6",
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
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground lg:hidden"
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          </button>
        )}
        <div className="relative w-full">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Tìm kiếm toàn hệ thống"
            placeholder="Tìm bệnh nhân theo tên, SĐT, số định danh, mã BN..."
            className="h-9 w-full bg-background pr-4 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex size-9 items-center justify-center rounded-md text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <HugeiconsIcon icon={Notification02Icon} className="size-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* Help Button */}
        <button
          type="button"
          aria-label="Trợ giúp"
          className="flex size-9 items-center justify-center rounded-md text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <HugeiconsIcon icon={HelpCircleIcon} className="size-[18px]" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-border/60" />

        {/* User Info */}
        <div className="group flex cursor-pointer select-none items-center gap-2.5 pl-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
            NL
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Nguyễn Thị Lan
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              Lễ tân
            </span>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
          />
        </div>
      </div>
    </header>
  )
}
