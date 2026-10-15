import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import {
  createRole,
  fetchAllRoles,
  fetchPermissionCatalog,
  fetchRoles,
  updateRole,
  updateRolePermissions,
} from "../api/roles-api"
import { isRoleVersionConflict, roleFieldErrors } from "../utils/role-errors"
import { mockRoleFetch, nurseRole, receptionistRole } from "./role-fixtures"
import { jsonResponse } from "./staff-member-fixtures"

describe("roles API", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("requests a normalized page and maps a role without description", async () => {
    const fetchMock = mockRoleFetch({ roles: [nurseRole] })

    const page = await fetchRoles({ search: "  nur ", status: "INACTIVE", page: 1, pageSize: 500 })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/v1/admin/roles?page=1&size=100&searchKey=nur&status=INACTIVE&sortKey=code&sortBy=ASC"
      ),
      expect.objectContaining({ method: "GET" })
    )
    expect(page.data[0]).toEqual({
      id: "role-nurse",
      code: "NURSE",
      name: "Nurse",
      description: undefined,
      active: false,
      permissionCount: 0,
      userCount: 0,
      rowVersion: 0,
    })
  })

  it("loads every page of roles and keeps their order", async () => {
    const roles = Array.from({ length: 250 }, (_, index) => ({
      ...nurseRole,
      id: `role-${index}`,
      code: `ROLE_${String(index).padStart(3, "0")}`,
    }))
    const fetchMock = mockRoleFetch({ roles })

    const all = await fetchAllRoles()

    expect(all.map((role) => role.id)).toEqual(roles.map((role) => role.id))
    const pages = fetchMock.mock.calls.map(([input]) => new URL(String(input)).searchParams)
    expect(pages.map((params) => params.get("page"))).toEqual(["1", "2", "3"])
    expect(pages.every((params) => params.get("size") === "100")).toBe(true)
  })

  it("sends trimmed bodies without blank optional fields", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 201, data: receptionistRole })
    const put = vi
      .spyOn(apiClient, "put")
      .mockResolvedValue({ result: "OK", code: 200, data: receptionistRole })

    await createRole({ code: " LAB_TECH ", name: " Lab ", description: "  ", copyFromRoleId: "", active: true })
    await updateRole("role-1", { name: "Lab", description: " Runs tests ", active: false, rowVersion: 2 })

    expect(post).toHaveBeenCalledWith("/api/v1/admin/roles", {
      code: "LAB_TECH",
      name: "Lab",
      description: undefined,
      copyFromRoleId: undefined,
      active: true,
    })
    expect(put).toHaveBeenCalledWith("/api/v1/admin/roles/role-1", {
      name: "Lab",
      description: "Runs tests",
      active: false,
      rowVersion: 2,
    })
  })

  it("sends only the pending permission changes with the role version", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue({
      result: "OK",
      code: 200,
      data: { roleId: "role-1", roleCode: "NURSE", active: true, rowVersion: 5, permissionCodes: ["PATIENT_VIEW"] },
    })

    const saved = await updateRolePermissions("role-1", {
      rowVersion: 4,
      grant: ["PATIENT_VIEW"],
      revoke: ["PAYMENT_REFUND"],
    })

    expect(put).toHaveBeenCalledWith("/api/v1/admin/roles/role-1/permissions", {
      rowVersion: 4,
      grant: ["PATIENT_VIEW"],
      revoke: ["PAYMENT_REFUND"],
    })
    expect(saved.rowVersion).toBe(5)
  })

  it("parses the catalogue and rejects an item without module", async () => {
    mockRoleFetch()
    expect((await fetchPermissionCatalog()).map((item) => item.code)).toContain("PAYMENT_REFUND")

    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      result: "OK",
      code: 200,
      data: [{ code: "X", name: "X", module: "", useCases: [], sensitive: false }],
    })
    await expect(fetchPermissionCatalog()).rejects.toThrow()
  })

  it("tells a duplicated field apart from a stale version", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          {
            result: "NG",
            code: 409,
            message: "Duplicate value: code",
            data: [{ field: "code", code: "Duplicate", message: "Role code already exists" }],
          },
          409
        )
      )
    )
    const duplicate = await createRole({ code: "NURSE", name: "Nurse", active: true }).catch((e) => e)
    expect(duplicate).toBeInstanceOf(ApiClientError)
    expect(roleFieldErrors(duplicate)).toEqual([{ field: "code", message: "Mã vai trò đã tồn tại" }])
    expect(isRoleVersionConflict(duplicate)).toBe(false)

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ result: "NG", code: 409, message: "Record was changed by another request" }, 409)
      )
    )
    const stale = await updateRole("role-1", { name: "Nurse", active: true, rowVersion: 0 }).catch(
      (e) => e
    )
    expect(roleFieldErrors(stale)).toEqual([])
    expect(isRoleVersionConflict(stale)).toBe(true)
  })
})
