import { vi } from "vitest"
import type {
  PermissionCatalogItemDto,
  RolePermissionsResponseDto,
  RoleSummaryResponseDto,
} from "../types/role-transport"
import { jsonResponse, sessionWith } from "./staff-member-fixtures"

export const roleAdministratorSession = sessionWith([
  "ROLE_MANAGE",
  "ROLE_CREATE",
  "ROLE_UPDATE",
  "PERMISSION_VIEW",
  "ROLE_PERMISSION_VIEW",
  "ROLE_PERMISSION_ASSIGN",
])

export const receptionistRole: RoleSummaryResponseDto = {
  id: "role-receptionist",
  code: "RECEPTIONIST",
  name: "Receptionist",
  description: "Registers patients, collects payments",
  active: true,
  permissionCount: 2,
  userCount: 2,
  rowVersion: 3,
}

export const patientRole: RoleSummaryResponseDto = {
  id: "role-patient",
  code: "PATIENT",
  name: "Patient",
  description: null,
  active: true,
  permissionCount: 5,
  userCount: 1,
  rowVersion: 0,
}

export const nurseRole: RoleSummaryResponseDto = {
  id: "role-nurse",
  code: "NURSE",
  name: "Nurse",
  description: null,
  active: false,
  permissionCount: 0,
  userCount: 0,
  rowVersion: 0,
}

export const administratorRole: RoleSummaryResponseDto = {
  id: "role-administrator",
  code: "ADMINISTRATOR",
  name: "Administrator",
  description: "Manages accounts, roles and permissions",
  active: true,
  permissionCount: 1,
  userCount: 1,
  rowVersion: 0,
}

export const catalogFixture: PermissionCatalogItemDto[] = [
  { code: "PAYMENT_REFUND", name: "Refund payment", module: "Invoice and Payment", useCases: ["UC-046"], sensitive: true },
  { code: "PAYMENT_VIEW", name: "View encounter charges and payment history", module: "Invoice and Payment", useCases: ["UC-041", "UC-042"], sensitive: false },
  { code: "PATIENT_CREATE", name: "Create a patient profile", module: "Patient", useCases: ["UC-013"], sensitive: false },
  { code: "PATIENT_VIEW", name: "Find patient and view demographic summary", module: "Patient", useCases: ["UC-011", "UC-012"], sensitive: false },
  { code: "ROLE_PERMISSION_ASSIGN", name: "Assign or remove role permissions", module: "Roles and Permissions", useCases: ["UC-009"], sensitive: true },
]

export const grantsFixture: Record<string, RolePermissionsResponseDto> = {
  [receptionistRole.id]: {
    roleId: receptionistRole.id,
    roleCode: "RECEPTIONIST",
    active: true,
    rowVersion: 3,
    permissionCodes: ["PATIENT_VIEW", "PAYMENT_REFUND"],
  },
  [nurseRole.id]: {
    roleId: nurseRole.id,
    roleCode: "NURSE",
    active: false,
    rowVersion: 0,
    permissionCodes: [],
  },
  [administratorRole.id]: {
    roleId: administratorRole.id,
    roleCode: "ADMINISTRATOR",
    active: true,
    rowVersion: 0,
    permissionCodes: ["ROLE_PERMISSION_ASSIGN"],
  },
}

interface RoleFetchOptions {
  roles?: RoleSummaryResponseDto[]
  createResponse?: () => Response
  updateResponse?: () => Response
  /** May resolve later, to keep a save in flight. */
  savePermissionsResponse?: () => Response | Promise<Response>
}

/** Answers the role administration routes of docs/api/roles-and-permissions.md. */
export function mockRoleFetch(options: RoleFetchOptions = {}) {
  const roles = options.roles ?? [administratorRole, nurseRole, receptionistRole]
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const method = init?.method ?? "GET"
    const path = url.pathname

    if (path === "/api/v1/admin/permissions") {
      return jsonResponse({ result: "OK", code: 200, data: catalogFixture })
    }
    const permissions = path.match(/^\/api\/v1\/admin\/roles\/([^/]+)\/permissions$/)
    if (permissions && method === "PUT") {
      return (
        options.savePermissionsResponse?.() ??
        jsonResponse({
          result: "OK",
          code: 200,
          data: { ...grantsFixture[permissions[1]], rowVersion: 4, permissionCodes: ["PATIENT_VIEW"] },
        })
      )
    }
    if (permissions) {
      return jsonResponse({ result: "OK", code: 200, data: grantsFixture[permissions[1]] })
    }
    if (path === "/api/v1/admin/roles" && method === "POST") {
      return (
        options.createResponse?.() ??
        jsonResponse({ result: "OK", code: 201, data: { ...receptionistRole, id: "role-new", code: "LAB_TECH", name: "Lab technician" } }, 201)
      )
    }
    if (path.startsWith("/api/v1/admin/roles/") && method === "PUT") {
      return options.updateResponse?.() ?? jsonResponse({ result: "OK", code: 200, data: receptionistRole })
    }
    const status = url.searchParams.get("status")
    const matching = roles.filter(
      (role) => !status || (status === "ACTIVE" ? role.active : !role.active)
    )
    const page = Number(url.searchParams.get("page") ?? "1")
    const size = Number(url.searchParams.get("size") ?? "10")
    return jsonResponse({
      result: "OK",
      code: 200,
      data: {
        items: matching.slice((page - 1) * size, page * size),
        page,
        size,
        totalElements: matching.length,
        totalPages: Math.ceil(matching.length / size),
      },
    })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}
