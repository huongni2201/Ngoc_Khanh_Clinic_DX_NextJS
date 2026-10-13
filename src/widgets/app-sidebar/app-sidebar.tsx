"use client"

import Link from "next/link"
import Image from "next/image"
import { useId } from "react"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Building03Icon,
  CalendarDaysIcon,
  CheckListIcon,
  CreditCardIcon,
  Home01Icon,
  Key01Icon,
  UserCheck01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  hasStaffPermission,
  useCachedUserSession,
  USER_ACCOUNT_CREATE_PERMISSION,
} from "@/modules/accesscontrol"

interface NavItem {
  title: string
  href: string
  icon: IconSvgElement
  /** Shown only when the session carries this permission (display only; the backend decides). */
  permission?: string
}

const ADMINISTRATION_ITEMS: NavItem[] = [
  {
    title: "Tài khoản người dùng",
    href: "/user-accounts/new",
    icon: Key01Icon,
    permission: USER_ACCOUNT_CREATE_PERMISSION,
  },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/"
  if (href === "/doctor") return pathname.startsWith("/doctor") || pathname.startsWith("/encounters")
  if (href.startsWith("/user-accounts")) return pathname.startsWith("/user-accounts")
  return pathname.startsWith(href)
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isActivePath(pathname, item.href)

  return (
    <Link
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
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const administrationLabelId = useId()
  const session = useCachedUserSession()
  const administrationItems = ADMINISTRATION_ITEMS.filter(
    (item) => !item.permission || hasStaffPermission(session, item.permission)
  )

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
        {navItems.map((item) => (
          <NavLink key={item.title} item={item} pathname={pathname} />
        ))}
        {administrationItems.length > 0 ? (
          <div role="group" aria-labelledby={administrationLabelId} className="space-y-1 pt-4">
            <div aria-hidden="true" className="mx-1 mb-3 border-t border-sidebar-border" />
            <p
              id={administrationLabelId}
              className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground"
            >
              Quản trị
            </p>
            {administrationItems.map((item) => (
              <NavLink key={item.title} item={item} pathname={pathname} />
            ))}
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

