import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import {
  changeAccountRole,
  createStaffMember,
  fetchAssignableRoles,
  fetchStaffMembers,
} from "../api/staff-members-api"
import { mockStaffMemberFetch, rolesFixture, staffMemberFixture } from "./staff-member-fixtures"

describe("staff members API", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("requests a normalized page and maps the staff member with its account", async () => {
    const fetchMock = mockStaffMemberFetch()

    const page = await fetchStaffMembers({ search: "  annv ", page: 2, pageSize: 500, sortKey: "fullName" })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/staff-members?page=2&size=100&searchKey=annv&sortKey=fullName&sortBy=DESC"),
      expect.objectContaining({ method: "GET" })
    )
    expect(page.data[0]).toEqual({
      id: "staff-1",
      staffCode: "NV-0001",
      fullName: "Nguyễn Văn An",
      dateOfBirth: "1990-05-12",
      sex: "MALE",
      phone: "0900000001",
      email: "an@example.invalid",
      status: "ACTIVE",
      rowVersion: 0,
      account: { id: "account-1", username: "annv1", status: "ACTIVE", roleCode: "GENERAL_PRACTITIONER", rowVersion: 3 },
    })
    expect(page).toMatchObject({ total: 1, page: 1, pageSize: 10, totalPages: 1 })
  })

  it("keeps a staff member without account and rejects unknown enum values", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      result: "OK",
      code: 200,
      data: {
        items: [{ ...staffMemberFixture, dateOfBirth: null, sex: null, phone: null, email: null, account: null }],
        page: 1, size: 10, totalElements: 1, totalPages: 1,
      },
    })
    const page = await fetchStaffMembers()
    expect(page.data[0]).toMatchObject({ dateOfBirth: undefined, sex: undefined, account: null })

    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      result: "OK",
      code: 200,
      data: { items: [{ ...staffMemberFixture, status: "RETIRED" }], page: 1, size: 10, totalElements: 1, totalPages: 1 },
    })
    await expect(fetchStaffMembers()).rejects.toThrow()
  })

  it("sends the exact create body without blank optional fields or a trimmed password", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 201, data: staffMemberFixture })

    const created = await createStaffMember({
      fullName: "  Nguyễn Văn An ",
      dateOfBirth: "",
      phone: " ",
      email: "an@example.invalid",
      initialPassword: " Tam@1234 ",
      roleCode: "GENERAL_PRACTITIONER",
    })

    expect(post).toHaveBeenCalledWith("/api/v1/staff-members", {
      fullName: "Nguyễn Văn An",
      dateOfBirth: undefined,
      sex: undefined,
      phone: undefined,
      email: "an@example.invalid",
      initialPassword: " Tam@1234 ",
      roleCode: "GENERAL_PRACTITIONER",
    })
    expect(created.account?.username).toBe("annv1")
  })

  it("lists assignable roles with their permission counts", async () => {
    mockStaffMemberFetch()
    const roles = await fetchAssignableRoles()
    expect(roles).toEqual(rolesFixture)
    expect(roles.map((role) => role.permissionCount)).toEqual([21, 24])
  })

  it("changes the role of an account with the version it was read at", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue({
      result: "OK",
      code: 200,
      data: { accountId: "account-1", roleCode: "RECEPTIONIST", rowVersion: 4 },
    })

    const changed = await changeAccountRole("account-1", { roleCode: "RECEPTIONIST", rowVersion: 3 })

    expect(put).toHaveBeenCalledWith("/api/v1/accounts/account-1/role", {
      roleCode: "RECEPTIONIST",
      rowVersion: 3,
    })
    expect(changed).toEqual({ accountId: "account-1", roleCode: "RECEPTIONIST", rowVersion: 4 })
  })
})
