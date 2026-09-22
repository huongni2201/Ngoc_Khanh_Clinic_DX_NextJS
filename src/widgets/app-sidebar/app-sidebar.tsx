"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Building2,
  FileText,
  Printer,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Tổng quan",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Bệnh nhân",
      href: "/patients",
      icon: Users,
    },
    {
      title: "Doanh nghiệp",
      href: "/enterprises",
      icon: Building2,
      active: true, // Always active for Screen 01 according to spec
    },
    {
      title: "Kết quả",
      href: "/results",
      icon: FileText,
    },
    {
      title: "In ấn",
      href: "/print",
      icon: Printer,
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col border-r border-border bg-card transition-all h-screen sticky top-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-xl">
          <Image
            src="/images/logo.png"
            alt="Ngọc Khánh Clinic Logo"
            width={40}
            height={40}
            className="size-full object-contain"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold text-foreground tracking-tight leading-snug">
            Ngọc Khánh Clinic
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            Quản lý khám sức khỏe doanh nghiệp
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 px-4 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active || pathname.startsWith(item.href)

          return (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              className={cn(
                "group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active-bg text-sidebar-active-fg font-semibold shadow-xs"
                  : "text-secondary-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive ? "text-sidebar-active-fg" : "text-secondary-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
