export type OrganizationType =
  | "COMPANY"
  | "SCHOOL"
  | "GOVERNMENT_AGENCY"
  | "HEALTHCARE_ORGANIZATION"
  | "NON_PROFIT"
  | "OTHER"

export type OrganizationStatus = "ACTIVE" | "INACTIVE"
export type OrganizationHealthExaminationStatus = "IN_PROGRESS" | "COMPLETED"

export interface Organization {
  id: string
  code: string
  name: string
  type: OrganizationType
  logoType?:
    | "samsung"
    | "fpt"
    | "canon"
    | "vietcombank"
    | "vng"
    | "hoaphat"
    | "unilever"
    | "vinamilk"
    | "default"
  contactPerson?: string
  contactPhone?: string
  batchesCount?: number
  status: OrganizationStatus
  healthExaminationStatus?: OrganizationHealthExaminationStatus
  updatedAt: string
  taxCode?: string
  address?: string
  examDate?: string
}

export type OrganizationDetailStatus = OrganizationStatus
export type OrganizationPartnershipStatus = "PROSPECT" | "PARTNERING"

export interface OrganizationDetail {
  id: string
  code: string
  name: string
  type: OrganizationType
  taxCode?: string
  contactName: string
  contactPerson?: string
  phone: string
  contactPhone?: string
  email?: string
  address?: string
  shortAddress?: string
  note?: string
  status: OrganizationDetailStatus
  partnershipStatus?: OrganizationPartnershipStatus
  batchesCount?: number
  updatedAt?: string
}

export interface OrganizationFilterParams {
  search?: string
  status?: OrganizationHealthExaminationStatus | "ALL"
  page?: number
  pageSize?: number
}

export interface OrganizationListResponse {
  data: Organization[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OrganizationCounters {
  total: number
  inProgress: number
  completed: number
  totalBatches: number
  estimatedEmployees: number
}

export interface CreateOrganizationDto {
  name: string
  taxCode?: string
  contactPerson: string
  contactPhone: string
  address?: string
}

export interface UpdateOrganizationDto {
  name: string
  taxCode?: string
  contactName: string
  phone: string
  email?: string
  address?: string
  note?: string
}

