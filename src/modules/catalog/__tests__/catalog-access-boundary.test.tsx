import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CatalogAccessBoundary } from "../components/management/catalog-access-boundary"
import * as accesscontrol from "@/modules/accesscontrol"
import type { UserSession } from "@/modules/accesscontrol"

describe("CatalogAccessBoundary", () => {
  it("renders denial message when session is not an CLINIC_MANAGER", () => {
    const nonAdminSession: UserSession = {
      userId: "u1",
      staffId: "s1",
      patientId: null,
      username: "nurse1",
      principalType: "STAFF",
      roleAssignments: [{ roleId: "r-clinic", roleCode: "ADMINISTRATOR", permissions: ["CATALOG_DEPARTMENT_VIEW"] }],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    vi.spyOn(accesscontrol, "useCachedUserSession").mockReturnValue(nonAdminSession)

    render(
      <CatalogAccessBoundary permission="CATALOG_DEPARTMENT_VIEW">
        <div data-testid="protected-content">Content</div>
      </CatalogAccessBoundary>
    )

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(screen.getByText("Bạn không có quyền truy cập mục này")).toBeInTheDocument()
  })

  it("renders permission denial message when admin lacks the specific permission", () => {
    const adminWithoutPermission: UserSession = {
      userId: "u2",
      staffId: "s2",
      patientId: null,
      username: "admin1",
      principalType: "STAFF",
      roleAssignments: [{ roleId: "r-admin", roleCode: "CLINIC_MANAGER", permissions: ["CATALOG_ROOM_VIEW"] }],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    vi.spyOn(accesscontrol, "useCachedUserSession").mockReturnValue(adminWithoutPermission)

    render(
      <CatalogAccessBoundary permission="CATALOG_DEPARTMENT_VIEW">
        <div data-testid="protected-content">Content</div>
      </CatalogAccessBoundary>
    )

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(screen.getByText("Bạn không có quyền xem danh mục này")).toBeInTheDocument()
  })

  it("renders protected content when admin has the required permission", () => {
    const adminWithPermission: UserSession = {
      userId: "u3",
      staffId: "s3",
      patientId: null,
      username: "admin2",
      principalType: "STAFF",
      roleAssignments: [{ roleId: "r-admin", roleCode: "CLINIC_MANAGER", permissions: ["CATALOG_DEPARTMENT_VIEW"] }],
      idleExpiresAt: "2026-10-15T12:00:00Z",
      absoluteExpiresAt: "2026-10-15T20:00:00Z",
    }
    vi.spyOn(accesscontrol, "useCachedUserSession").mockReturnValue(adminWithPermission)

    render(
      <CatalogAccessBoundary permission="CATALOG_DEPARTMENT_VIEW">
        <div data-testid="protected-content">Content</div>
      </CatalogAccessBoundary>
    )

    expect(screen.getByTestId("protected-content")).toBeInTheDocument()
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})
