import { vi } from "vitest"
import type { UserSession } from "../../types"

export const GP_ROLE_ID = "0199aaaa-0000-7000-8000-000000000101"
export const NURSE_ROLE_ID = "0199aaaa-0000-7000-8000-000000000102"
export const STAFF_OWNER_ID = "0199bbbb-0000-7000-8000-000000000201"
export const PATIENT_OWNER_ID = "0199bbbb-0000-7000-8000-000000000202"
export const NO_MOBILE_OWNER_ID = "0199bbbb-0000-7000-8000-000000000203"
export const ACCOUNT_ID = "0199cccc-0000-7000-8000-000000000301"

export const ROLES = [
  { roleId: GP_ROLE_ID, code: "GENERAL_PRACTITIONER", name: "General Practitioner", description: "x" },
  { roleId: NURSE_ROLE_ID, code: "NURSE", name: "Nurse", description: null },
]

export const STAFF_CANDIDATES = [
  {
    ownerId: STAFF_OWNER_ID,
    ownerCode: "NV-0071",
    fullName: "Nguyễn Văn A",
    departmentName: "Khoa Khám bệnh",
    dateOfBirth: null,
    phone: "0912 345 678",
    email: "a.nguyen@example.invalid",
    smsPhoneNumber: "0912345678",
  },
  {
    ownerId: NO_MOBILE_OWNER_ID,
    ownerCode: "NV-0102",
    fullName: "Nguyễn Văn An",
    departmentName: null,
    dateOfBirth: null,
    phone: "024 3333 4444",
    email: null,
    smsPhoneNumber: null,
  },
]

export const PATIENT_CANDIDATES = [
  {
    ownerId: PATIENT_OWNER_ID,
    ownerCode: "BN-000123",
    fullName: "Lê Thị Hoa",
    departmentName: null,
    dateOfBirth: "1990-03-14",
    phone: "0987111222",
    email: null,
    smsPhoneNumber: "0987111222",
  },
]

export function sessionWith(permissions: string[]): UserSession {
  return {
    userId: "11111111-1111-4111-8111-111111111111",
    staffId: "22222222-2222-4222-8222-222222222222",
    patientId: null,
    username: "admin.test",
    principalType: "STAFF",
    roleAssignments: [
      { roleId: "33333333-3333-4333-8333-333333333333", roleCode: "ADMINISTRATOR", permissions },
    ],
    idleExpiresAt: "2026-10-13T12:30:00Z",
    absoluteExpiresAt: "2026-10-13T20:00:00Z",
  }
}

export const ADMIN_PERMISSIONS = [
  "USER_ACCOUNT_CREATE",
  "USER_ACCOUNT_OWNER_SEARCH",
  "USER_ACCOUNT_USERNAME_CHECK",
  "USER_ACCOUNT_ASSIGNABLE_ROLE_VIEW",
]

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export interface UserAccountFetchOptions {
  takenUsernames?: string[]
  /** Status and English message of a failed create. */
  createFailure?: { status: number; message: string }
  smsDelivered?: boolean
}

/** Stubs `fetch` with the UC-005 backend contract and returns the mock for assertions. */
export function mockUserAccountFetch(options: UserAccountFetchOptions = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const method = init?.method ?? "GET"
    const path = url.pathname

    if (path === "/api/v1/user-accounts/assignable-roles") {
      return json({ result: "OK", code: 200, data: ROLES })
    }
    if (path === "/api/v1/user-accounts/owner-candidates") {
      const items =
        url.searchParams.get("accountType") === "PATIENT" ? PATIENT_CANDIDATES : STAFF_CANDIDATES
      return json({ result: "OK", code: 200, data: { items, limited: false } })
    }
    if (path === "/api/v1/user-accounts/username-availability") {
      const username = url.searchParams.get("username") ?? ""
      return json({
        result: "OK",
        code: 200,
        data: { available: !(options.takenUsernames ?? []).includes(username) },
      })
    }
    if (path === "/api/v1/user-accounts" && method === "POST") {
      if (options.createFailure) {
        return json(
          { result: "NG", code: options.createFailure.status, message: options.createFailure.message },
          options.createFailure.status
        )
      }
      const body = JSON.parse(String(init?.body)) as {
        accountType: string
        ownerId: string
        username: string
        roleIds: string[]
      }
      const roleCodes =
        body.accountType === "PATIENT"
          ? ["PATIENT"]
          : ROLES.filter((role) => body.roleIds.includes(role.roleId)).map((role) => role.code)
      return json(
        {
          result: "OK",
          code: 201,
          message: "User account created",
          data: {
            accountId: ACCOUNT_ID,
            accountType: body.accountType,
            username: body.username,
            status: "ACTIVE",
            ownerId: body.ownerId,
            roleCodes,
            smsDelivered: options.smsDelivered ?? false,
          },
        },
        201
      )
    }
    return json({ result: "NG", code: 404, message: "Unexpected request" }, 404)
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

/** Body of the create request sent through the mock. */
export function createRequestBody(fetchMock: ReturnType<typeof mockUserAccountFetch>) {
  const call = fetchMock.mock.calls.find(
    ([input, init]) => String(input).endsWith("/api/v1/user-accounts") && init?.method === "POST"
  )
  return call ? (JSON.parse(String(call[1]?.body)) as Record<string, unknown>) : undefined
}
