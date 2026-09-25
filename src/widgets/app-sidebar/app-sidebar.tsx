"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Building03Icon,
  CalendarDaysIcon,
  CheckListIcon,
  CreditCardIcon,
  Home01Icon,
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
      icon: CalendarDaysIcon,
    },
    {
      title: "Bệnh nhân",
      href: "/patients",
      icon: UserGroupIcon,
    },
    {
      title: "Lượt khám",
      href: "/doctor",
      icon: CheckListIcon,
    },
    {
      title: "Thanh toán",
      href: "/billing",
      icon: CreditCardIcon,
    },
    {
      title: "Đơn vị",
      href: "/organizations",
      icon: Building03Icon,
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
          <span className="text-sm font-semibold leading-snug tracking-tight text-sidebar-primary-foreground">
            Ngọc Khánh Clinic
          </span>
          <span className="truncate text-xs leading-tight text-sidebar-foreground">
            Hệ thống quản lý phòng khám
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : item.href === "/doctor"
              ? pathname.startsWith("/doctor") || pathname.startsWith("/encounters")
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={1.8}
                  className={cn(
                    "size-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                />
                <span className="truncate">{item.title}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

