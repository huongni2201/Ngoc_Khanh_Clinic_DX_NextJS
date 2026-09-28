import type {
  HealthExaminationParticipant,
  ParticipantListFilterParams,
  ParticipantListResponse,
} from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

export interface EmployeeSnapshotResponse {
  fullName: string
  dateOfBirth: string
  sex: string
  identificationNumber: string | { value: string }
  phone?: string | null
  province?: string | null
  ward?: string | null
  addressDetail?: string | null
}

export interface EmployeeListItemResponse {
  batchEmployeeId: string
  employeeId: string
  employeeCode?: string | null
  departmentName?: string | null
  jobTitle?: string | null
  occupation?: string | null
  snapshot: EmployeeSnapshotResponse
  status: string
  createdAt: string
}

export interface EmployeePageResponse {
  result: string
  code: number
  message?: string
  data: {
    items: EmployeeListItemResponse[]
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

function formatDate(value?: string | null) {
  if (!value) return undefined
  const [year, month, day] = value.slice(0, 10).split("-")
  return year && month && day ? `${day}/${month}/${year}` : value
}

function formatGender(value?: string | null): HealthExaminationParticipant["gender"] {
  switch (value?.trim().toUpperCase()) {
    case "MALE":
    case "M":
    case "NAM":
      return "Nam"
    case "FEMALE":
    case "F":
    case "NỮ":
    case "NU":
      return "Nữ"
    default:
      return "OTHER"
  }
}

function identificationNumberValue(value: EmployeeSnapshotResponse["identificationNumber"]) {
  return typeof value === "string" ? value : value.value
}

function formatAddress(snapshot: EmployeeSnapshotResponse) {
  return [snapshot.addressDetail, snapshot.ward, snapshot.province]
    .filter(Boolean)
    .join(", ")
}

export function buildEmployeeListUrl(
  organizationId: string,
  batchId: string,
  params: Pick<ParticipantListFilterParams, "search" | "page" | "pageSize"> = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 10),
    ...(params.search?.trim() ? { searchKey: params.search.trim() } : {}),
    sortBy: "ASC",
    sortKey: "id",
  })

  return `${API_BASE_URL.replace(/\/$/, "")}/api/v1/organizations/${organizationId}/health-examination-batches/${batchId}/employees?${query.toString()}`
}

export function mapEmployeePageResponse(
  response: EmployeePageResponse,
  batchId: string
): ParticipantListResponse {
  return {
    data: response.data.items.map((employee) => ({
      id: employee.batchEmployeeId,
      batchId,
      participantCode: employee.employeeCode ?? undefined,
      participantType: "EMPLOYEE",
      fullName: employee.snapshot.fullName,
      dateOfBirth: formatDate(employee.snapshot.dateOfBirth),
      gender: formatGender(employee.snapshot.sex),
      identificationNumber: identificationNumberValue(employee.snapshot.identificationNumber),
      phoneNumber: employee.snapshot.phone ?? undefined,
      organizationUnit: employee.departmentName ?? undefined,
      jobTitle: employee.jobTitle ?? undefined,
      address: formatAddress(employee.snapshot) || undefined,
      profileStatus: "VALID",
    })),
    total: response.data.totalElements,
    page: response.data.page,
    pageSize: response.data.size,
    totalPages: response.data.totalPages,
  }
}

export async function fetchHealthExaminationBatchEmployees(
  organizationId: string,
  batchId: string,
  params?: ParticipantListFilterParams
): Promise<ParticipantListResponse> {
  const result = await fetch(buildEmployeeListUrl(organizationId, batchId, params), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  const response = (await result.json()) as EmployeePageResponse
  if (!result.ok || response.result !== "OK" || !response.data) {
    throw new Error(response.message || "Không thể tải danh sách nhân viên")
  }

  return mapEmployeePageResponse(response, batchId)
}
