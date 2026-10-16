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
  UserMultiple02Icon,
  UserShield01Icon,
  Key01Icon,
  Hospital01Icon,
  Door01Icon,
  StethoscopeIcon,
  HealthIcon,
  Medicine02Icon,
  Layers01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  PERMISSION,
  ROLE_PERMISSIONS_SCREEN_PERMISSIONS,
  usePermissions,
  useCachedUserSession,
  type PermissionCode,
} from "@/modules/accesscontrol"
import { canAccessCatalogManagement, CATALOG_PERMISSIONS } from "@/modules/catalog"

interface NavItem {
  title: string
  href: string
  icon: IconSvgElement
  /** The account must hold it to see the item. Items without one are not gated yet. */
  permission?: PermissionCode
}

interface AdminNavItem extends Omit<NavItem, "permission"> {
  /** The account must hold every one of them to see the item. */
  permissions: readonly PermissionCode[]
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { isKnown, can, canAll } = usePermissions()
  const session = useCachedUserSession()
  const canOpenCatalog = canAccessCatalogManagement(session)

  // Administration items appear only once the session is known to hold the permission, so an
  // account without it never sees them flash. Display only; the backend checks every request.
  const adminItems = ([
    {
      title: "Nhân viên",
      href: "/staff-members",
      icon: UserMultiple02Icon,
      permissions: [PERMISSION.STAFF_MEMBER_VIEW],
    },
    {
      title: "Vai trò",
      href: "/roles",
      icon: UserShield01Icon,
      permissions: [PERMISSION.ROLE_MANAGE],
    },
    {
      title: "Phân quyền vai trò",
      href: "/roles/permissions",
      icon: Key01Icon,
      permissions: ROLE_PERMISSIONS_SCREEN_PERMISSIONS,
    },
  ] satisfies AdminNavItem[]).filter((item) => isKnown && canAll(...item.permissions))
  // "/roles/permissions" sits under "/roles": only the most specific matching item is active.
  const activeAdminHref = adminItems
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]

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
      permission: PERMISSION.ORGANIZATION_SEARCH,
    },
  ]
  // Display only; the backend checks every request. Before the session is known the item shows.
  const visibleItems = navItems.filter(
    (item) => !item.permission || !isKnown || can(item.permission)
  )

  const catalogNavItems: (NavItem & { permission: PermissionCode })[] = [
    {
      title: "Khoa",
      href: "/admin/catalog/departments",
      icon: Hospital01Icon,
      permission: CATALOG_PERMISSIONS.DEPARTMENT_VIEW,
    },
    {
      title: "Phòng",
      href: "/admin/catalog/rooms",
      icon: Door01Icon,
      permission: CATALOG_PERMISSIONS.ROOM_VIEW,
    },
    {
      title: "Chuyên khoa",
      href: "/admin/catalog/specialties",
      icon: StethoscopeIcon,
      permission: CATALOG_PERMISSIONS.SPECIALTY_VIEW,
    },
    {
      title: "Dịch vụ",
      href: "/admin/catalog/services",
      icon: HealthIcon,
      permission: CATALOG_PERMISSIONS.SERVICE_VIEW,
    },
    {
      title: "Thuốc",
      href: "/admin/catalog/medicines",
      icon: Medicine02Icon,
      permission: CATALOG_PERMISSIONS.MEDICINE_VIEW,
    },
  ]

  const visibleCatalogItems = canOpenCatalog
    ? catalogNavItems.filter((item) => isKnown && can(item.permission))
    : []

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 shrink-0">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/images/logo.png"
            alt="Biểu trưng Phòng khám Ngọc Khánh"
            width={36}
            height={36}
            className="size-full object-contain"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-snug tracking-tight text-sidebar-primary-foreground">
            Phòng khám Ngọc Khánh
          </span>
          <span className="truncate text-xs leading-tight text-sidebar-foreground">
            Hệ thống quản lý phòng khám
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav aria-label="Điều hướng chính" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : item.href === "/doctor"
              ? pathname.startsWith("/doctor") || pathname.startsWith("/encounters")
              : pathname.startsWith(item.href)

          return <SidebarLink key={item.title} item={item} isActive={isActive} />
        })}

        {adminItems.length > 0 ? (
          <div className="pt-4">
            <p
              id="sidebar-admin-heading"
              className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground"
            >
              Quản trị
            </p>
            <div role="group" aria-labelledby="sidebar-admin-heading" className="space-y-1">
              {adminItems.map((item) => (
                <SidebarLink
                  key={item.title}
                  item={item}
                  isActive={item.href === activeAdminHref}
                />
              ))}
            </div>
          </div>
        ) : null}
        {visibleCatalogItems.length > 0 ? (
          <div className="pt-4">
            <CatalogCollapsibleNav
              items={visibleCatalogItems}
              pathname={pathname}
            />
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

function CatalogCollapsibleNav({
  items,
  pathname,
}: {
  items: (NavItem & { permission: PermissionCode })[]
  pathname: string
}) {
  const isCatalogActive = pathname.startsWith("/admin/catalog")
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group flex h-10 items-center justify-between rounded-md text-sm font-medium transition-colors",
          !isOpen && isCatalogActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
            : isCatalogActive
            ? "bg-sidebar-accent/50 text-sidebar-accent-foreground font-semibold"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="sidebar-catalog-subitems"
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left cursor-pointer"
        >
          <HugeiconsIcon
            icon={Layers01Icon}
            strokeWidth={1.8}
            className={cn(
              "size-[18px] shrink-0 transition-colors",
              !isOpen && isCatalogActive
                ? "text-sidebar-primary-foreground"
                : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
            )}
          />
          <span className="truncate">Quản lý danh mục</span>
        </button>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="sidebar-catalog-subitems"
          aria-label={isOpen ? "Thu gọn Quản lý danh mục" : "Mở rộng Quản lý danh mục"}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen((prev) => !prev)
          }}
          className={cn(
            "mr-1.5 flex size-7 items-center justify-center rounded-md transition-colors cursor-pointer",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            !isOpen && isCatalogActive
              ? "text-sidebar-primary-foreground/80 hover:text-sidebar-primary-foreground"
              : "text-sidebar-foreground"
          )}
        >
          <HugeiconsIcon
            icon={isOpen ? ArrowDown01Icon : ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 shrink-0"
            aria-hidden="true"
          />
        </button>
      </div>

      {isOpen && (
        <div
          role="group"
          id="sidebar-catalog-subitems"
          aria-label="Danh sách danh mục"
          className="ml-3.5 space-y-1 border-l border-sidebar-border pl-3"
        >
          {items.map((item) => (
            <SidebarSubLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarSubLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <HugeiconsIcon
        icon={item.icon}
        strokeWidth={1.8}
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive
            ? "text-sidebar-primary-foreground"
            : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
        )}
      />
      <span className="truncate">{item.title}</span>
    </Link>
  )
}

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
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

