import * as React from "react"
import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as accesscontrol from "@/modules/accesscontrol"
import { staffSession } from "@/modules/accesscontrol/__tests__/fixtures"
import type { UserSession } from "@/modules/accesscontrol"
import AdminCatalogIndexPage from "@/app/admin/catalog/page"
import { CatalogAccessBoundary } from "../components/management/catalog-access-boundary"
import { CATALOG_PERMISSIONS } from "../utils/management/catalog-management-utils"

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))

function useTestSession(permissions: string[]): UserSession {
  const session: UserSession = {
    ...staffSession,
    username: "test",
    roleAssignments: [{ roleId: "local-test", roleCode: "TEST", permissions }],
  }
  vi.spyOn(accesscontrol, "useCachedUserSession").mockReturnValue(session)
  return session
}

afterEach(() => { vi.restoreAllMocks(); replace.mockClear() })

describe("local TEST account catalog access", () => {
  it.each([
    CATALOG_PERMISSIONS.DEPARTMENT_VIEW,
    CATALOG_PERMISSIONS.ROOM_VIEW,
    CATALOG_PERMISSIONS.SPECIALTY_VIEW,
    CATALOG_PERMISSIONS.SERVICE_VIEW,
    CATALOG_PERMISSIONS.MEDICINE_VIEW,
  ])("opens the catalog when the session grants %s", (permission) => {
    useTestSession([permission])
    render(<CatalogAccessBoundary permission={permission}>Nội dung danh mục</CatalogAccessBoundary>)
    expect(screen.getByText("Nội dung danh mục")).toBeVisible()
  })

  it("does not invent missing permissions for a TEST session", () => {
    useTestSession([])
    render(<CatalogAccessBoundary permission={CATALOG_PERMISSIONS.ROOM_VIEW}>Nội dung danh mục</CatalogAccessBoundary>)
    expect(screen.queryByText("Nội dung danh mục")).not.toBeInTheDocument()
    expect(screen.getByText("Bạn không có quyền xem danh mục này")).toBeVisible()
  })

  it("keeps patient accounts out even if a snapshot carries the TEST role", () => {
    const session = useTestSession([CATALOG_PERMISSIONS.ROOM_VIEW])
    vi.mocked(accesscontrol.useCachedUserSession).mockReturnValue({
      ...session, principalType: "PATIENT", staffId: null, patientId: "test-patient",
    })
    render(<CatalogAccessBoundary permission={CATALOG_PERMISSIONS.ROOM_VIEW}>Nội dung danh mục</CatalogAccessBoundary>)
    expect(screen.getByText("Bạn không có quyền truy cập mục này")).toBeVisible()
    expect(screen.queryByText("Nội dung danh mục")).not.toBeInTheDocument()
  })

  it("redirects the catalog index to the first granted catalog for TEST", () => {
    useTestSession([CATALOG_PERMISSIONS.MEDICINE_VIEW])
    render(<AdminCatalogIndexPage />)
    expect(replace).toHaveBeenCalledWith("/admin/catalog/medicines")
  })

  it("does not redirect a TEST session without any catalog VIEW permission", () => {
    useTestSession([])
    render(<AdminCatalogIndexPage />)
    expect(replace).not.toHaveBeenCalled()
    expect(screen.getByText("Bạn không có quyền xem danh mục này")).toBeVisible()
  })
})
