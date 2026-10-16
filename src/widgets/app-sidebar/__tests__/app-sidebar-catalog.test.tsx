import * as React from "react"
import { render as renderUi, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { AppSidebar } from "../app-sidebar"
import { SESSION_QUERY_KEY } from "@/modules/accesscontrol/utils/session-cache"
import { CATALOG_PERMISSIONS } from "@/modules/catalog"
import { PERMISSION } from "@/modules/accesscontrol"
import { staffSession } from "@/modules/accesscontrol/__tests__/fixtures"
import type { UserSession } from "@/modules/accesscontrol"

let currentSession: UserSession | null = null
let currentPathname = "/admin/catalog/departments"

function render(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(SESSION_QUERY_KEY, currentSession)
  return renderUi(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}))

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />
  },
}))

describe("AppSidebar - Catalog Navigation", () => {
  it("shows every catalog and staff administration for TEST with granted permissions", () => {
    currentSession = {
      ...staffSession,
      roleAssignments: [{ roleId: "local-test", roleCode: "TEST", permissions: [
        ...Object.values(CATALOG_PERMISSIONS), PERMISSION.STAFF_MEMBER_VIEW,
      ] }],
    }
    render(<AppSidebar />)
    for (const name of ["Khoa", "Phòng", "Chuyên khoa", "Dịch vụ", "Thuốc", "Nhân viên"]) {
      expect(screen.getByRole("link", { name })).toBeVisible()
    }
  })

  it("does not show catalogs for TEST when the backend snapshot grants no catalog permissions", () => {
    currentSession = {
      ...staffSession,
      roleAssignments: [{ roleId: "local-test", roleCode: "TEST", permissions: [] }],
    }
    render(<AppSidebar />)
    expect(screen.queryByText("Quản lý danh mục")).not.toBeInTheDocument()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    currentSession = null
    currentPathname = "/admin/catalog/departments"
  })

  it("does not show catalog group when user is not logged in", () => {
    currentSession = null

    render(<AppSidebar />)
    expect(screen.queryByText("Quản lý danh mục")).not.toBeInTheDocument()
  })

  it("does not show catalog group for staff without CLINIC_MANAGER role", () => {
    const session: UserSession = {
      userId: "u1",
      staffId: "s1",
      patientId: null,
      username: "doctor",
      principalType: "STAFF",
      roleAssignments: [
        {
          roleId: "r1",
          roleCode: "DOCTOR",
          permissions: [CATALOG_PERMISSIONS.DEPARTMENT_VIEW],
        },
      ],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    currentSession = session

    render(<AppSidebar />)
    expect(screen.queryByText("Quản lý danh mục")).not.toBeInTheDocument()
  })

  it("shows all 5 catalog items for admin with all catalog VIEW permissions", () => {
    const session: UserSession = {
      userId: "u2",
      staffId: "s2",
      patientId: null,
      username: "admin",
      principalType: "STAFF",
      roleAssignments: [
        {
          roleId: "r2",
          roleCode: "CLINIC_MANAGER",
          permissions: [
            CATALOG_PERMISSIONS.DEPARTMENT_VIEW,
            CATALOG_PERMISSIONS.ROOM_VIEW,
            CATALOG_PERMISSIONS.SPECIALTY_VIEW,
            CATALOG_PERMISSIONS.SERVICE_VIEW,
            CATALOG_PERMISSIONS.MEDICINE_VIEW,
          ],
        },
      ],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    currentSession = session

    render(<AppSidebar />)
    expect(screen.getByText("Quản lý danh mục")).toBeInTheDocument()
    expect(screen.getByText("Khoa")).toBeInTheDocument()
    expect(screen.getByText("Phòng")).toBeInTheDocument()
    expect(screen.getByText("Chuyên khoa")).toBeInTheDocument()
    expect(screen.getByText("Dịch vụ")).toBeInTheDocument()
    expect(screen.getByText("Thuốc")).toBeInTheDocument()
  })

  it("filters catalog items based on granted permissions", () => {
    const session: UserSession = {
      userId: "u3",
      staffId: "s3",
      patientId: null,
      username: "limited_admin",
      principalType: "STAFF",
      roleAssignments: [
        {
          roleId: "r3",
          roleCode: "CLINIC_MANAGER",
          permissions: [CATALOG_PERMISSIONS.DEPARTMENT_VIEW],
        },
      ],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    currentSession = session

    render(<AppSidebar />)
    expect(screen.getByText("Quản lý danh mục")).toBeInTheDocument()
    expect(screen.getByText("Khoa")).toBeInTheDocument()
    expect(screen.queryByText("Phòng")).not.toBeInTheDocument()
    expect(screen.queryByText("Chuyên khoa")).not.toBeInTheDocument()
    expect(screen.queryByText("Dịch vụ")).not.toBeInTheDocument()
    expect(screen.queryByText("Thuốc")).not.toBeInTheDocument()
  })

  it("does not show catalog group when the clinic manager has no catalog VIEW permissions", () => {
    const session: UserSession = {
      userId: "u4",
      staffId: "s4",
      patientId: null,
      username: "admin_no_catalog",
      principalType: "STAFF",
      roleAssignments: [
        {
          roleId: "r4",
          roleCode: "CLINIC_MANAGER",
          permissions: [],
        },
      ],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    currentSession = session

    render(<AppSidebar />)
    expect(screen.queryByText("Quản lý danh mục")).not.toBeInTheDocument()
  })

  it("does not give an administrator the clinic manager menu even with a cached catalog permission", () => {
    currentSession = {
      userId: "u5", staffId: "s5", patientId: null, username: "administrator", principalType: "STAFF",
      roleAssignments: [{ roleId: "r-admin", roleCode: "ADMINISTRATOR", permissions: [CATALOG_PERMISSIONS.DEPARTMENT_VIEW] }],
      idleExpiresAt: "2099-01-01T12:00:00Z", absoluteExpiresAt: "2099-01-01T20:00:00Z",
    }
    render(<AppSidebar />)
    expect(screen.queryByText("Quản lý danh mục")).not.toBeInTheDocument()
  })

  it.each([
    ["departments", "Khoa"],
    ["rooms", "Phòng"],
    ["specialties", "Chuyên khoa"],
    ["services", "Dịch vụ"],
    ["medicines", "Thuốc"],
  ])("keeps the active %s catalog when collapsing and reopening the group", async (route, label) => {
    const user = (await import("@testing-library/user-event")).default.setup()
    currentPathname = `/admin/catalog/${route}`
    currentSession = {
      ...staffSession,
      roleAssignments: [{ roleId: "local-test", roleCode: "TEST", permissions: [
        ...Object.values(CATALOG_PERMISSIONS),
      ] }],
    }
    render(<AppSidebar />)
    const toggle = screen.getByRole("button", { name: "Quản lý danh mục" })
    expect(screen.queryByRole("link", { name: "Quản lý danh mục" })).not.toBeInTheDocument()
    expect(toggle).not.toHaveAttribute("href")
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page")
    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("group", { name: "Danh sách danh mục" })).not.toBeInTheDocument()
    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page")
  })

  it("toggles the 5 child catalogs when clicking the expand/collapse button", async () => {
    const user = (await import("@testing-library/user-event")).default.setup()
    currentSession = {
      ...staffSession,
      roleAssignments: [{ roleId: "local-test", roleCode: "TEST", permissions: [
        ...Object.values(CATALOG_PERMISSIONS),
      ] }],
    }
    render(<AppSidebar />)

    // Initially open: child items are visible
    expect(screen.getByRole("link", { name: "Khoa" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Phòng" })).toBeInTheDocument()

    // Click toggle button to collapse
    const toggleButton = screen.getByRole("button", { name: /Thu gọn Quản lý danh mục/i })
    expect(toggleButton).toHaveAttribute("aria-expanded", "true")
    await user.click(toggleButton)

    // Now closed: child items are not rendered
    expect(screen.queryByRole("link", { name: "Khoa" })).not.toBeInTheDocument()
    expect(toggleButton).toHaveAttribute("aria-expanded", "false")

    // Click toggle button again to expand
    await user.click(toggleButton)
    expect(screen.getByRole("link", { name: "Khoa" })).toBeInTheDocument()
    expect(toggleButton).toHaveAttribute("aria-expanded", "true")
  })

  it("toggles the 5 child catalogs when clicking the Quản lý danh mục text directly", async () => {
    const user = (await import("@testing-library/user-event")).default.setup()
    currentSession = {
      ...staffSession,
      roleAssignments: [{ roleId: "local-test", roleCode: "TEST", permissions: [
        ...Object.values(CATALOG_PERMISSIONS),
      ] }],
    }
    render(<AppSidebar />)

    const parentLink = screen.getByRole("button", { name: "Quản lý danh mục" })
    expect(parentLink).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: "Khoa" })).toBeInTheDocument()

    // Clicking the heading directly collapses it.
    await user.click(parentLink)
    expect(screen.queryByRole("link", { name: "Khoa" })).not.toBeInTheDocument()
    expect(parentLink).toHaveAttribute("aria-expanded", "false")

    // Clicking again expands it
    await user.click(parentLink)
    expect(screen.getByRole("link", { name: "Khoa" })).toBeInTheDocument()
    expect(parentLink).toHaveAttribute("aria-expanded", "true")
  })
})
