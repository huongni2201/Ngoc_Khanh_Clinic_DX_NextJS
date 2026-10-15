import { vi } from "vitest"
import type { UserSession } from "../types"
import type { RoleResponseDto, StaffMemberResponseDto } from "../types/staff-member-transport"
import { staffSession } from "./fixtures"

// Synthetic data shaped like docs/api/staff-members.md.

export const staffMemberFixture: StaffMemberResponseDto = {
  id: "staff-1",
  staffCode: "NV-0001",
  fullName: "Nguyễn Văn An",
  dateOfBirth: "1990-05-12",
  sex: "MALE",
  phone: "0900000001",
  email: "an@example.invalid",
  status: "ACTIVE",
  rowVersion: 0,
  account: { id: "account-1", username: "annv1", status: "ACTIVE", roleCode: "GENERAL_PRACTITIONER" },
}

export const rolesFixture: RoleResponseDto[] = [
  { id: "role-1", code: "GENERAL_PRACTITIONER", name: "General Practitioner", description: "Examines outpatients." },
  { id: "role-2", code: "RECEPTIONIST", name: "Receptionist", description: "Registers patients." },
]

export function sessionWith(permissions: string[]): UserSession {
  return {
    ...staffSession,
    roleAssignments: [{ ...staffSession.roleAssignments[0], roleCode: "ADMINISTRATOR", permissions }],
  }
}

export const administratorSession = sessionWith([
  "STAFF_MEMBER_VIEW",
  "ROLE_VIEW",
  "USER_ACCOUNT_CREATE",
  "USER_ROLE_ASSIGN",
])

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

interface StaffMemberFetchOptions {
  createResponse?: () => Response
  roles?: RoleResponseDto[][]
}

/** Answers the staff member and role routes; `roles` lists successive role responses. */
export function mockStaffMemberFetch(options: StaffMemberFetchOptions = {}) {
  let roleCall = 0
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const method = init?.method ?? "GET"

    if (url.pathname === "/api/v1/roles") {
      const list = options.roles?.[Math.min(roleCall, (options.roles?.length ?? 1) - 1)] ?? rolesFixture
      roleCall += 1
      return jsonResponse({ result: "OK", code: 200, data: list })
    }

    if (url.pathname === "/api/v1/staff-members" && method === "POST") {
      return (
        options.createResponse?.() ??
        jsonResponse({ result: "OK", code: 201, message: "Staff member created", data: staffMemberFixture }, 201)
      )
    }

    return jsonResponse({
      result: "OK",
      code: 200,
      data: { items: [staffMemberFixture], page: 1, size: 10, totalElements: 1, totalPages: 1 },
    })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}
