import { describe, expect, it } from "vitest"
import {
  OrganizationListPage,
  useOrganization,
  useOrganizations,
  type Organization,
} from "@/modules/organizations"

describe("Organization module contract", () => {
  it("exports organization-owned pages and query hooks", () => {
    expect(OrganizationListPage).toBeTypeOf("function")
    expect(useOrganizations).toBeTypeOf("function")
    expect(useOrganization).toBeTypeOf("function")
  })

  it("models organization type separately from progress status", () => {
    const organization: Organization = {
      id: "org-1",
      code: "ORG001",
      name: "Trường THPT Ngọc Khánh",
      type: "SCHOOL",
      status: "ACTIVE",
      updatedAt: "2026-09-25",
    }

    expect(organization.type).toBe("SCHOOL")
    expect(["ACTIVE", "INACTIVE"]).toContain(organization.status)
  })
})
