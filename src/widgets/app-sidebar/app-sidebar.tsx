"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ChartLineData01Icon,
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  Home01Icon,
  Settings01Icon,
  UserCheck01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: IconSvgElement
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Tổng quan",
      href: "/dashboard",
      icon: Home01Icon,
    },
    {
      title: "Lễ tân",
      href: "/reception",
      icon: UserCheck01Icon,
    },
    {
      title: "Lịch hẹn",
      href: "/appointments",
      icon: Calendar03Icon,
    },
    {
      title: "Bệnh nhân",
      href: "/patients",
      icon: UserGroupIcon,
    },
    {
      title: "Doanh nghiệp",
      href: "/enterprises",
      icon: Building03Icon,
    },
    {
      title: "Thanh toán",
      href: "/billing",
      icon: CreditCardIcon,
    },
    {
      title: "Báo cáo",
      href: "/reports",
      icon: ChartLineData01Icon,
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: Settings01Icon,
    },
  ]

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/images/logo.png"
            alt="Ngọc Khánh Clinic Logo"
            width={36}
            height={36}
            className="size-full object-contain"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-snug tracking-tight text-foreground">
            Ngọc Khánh Clinic
          </span>
          <span className="truncate text-xs leading-tight text-muted-foreground">
            Quản lý phòng khám
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-secondary-foreground hover:bg-hover hover:text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={1.8}
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-secondary-foreground group-hover:text-primary"
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
