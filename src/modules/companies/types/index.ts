export type EnterpriseStatus = "IN_PROGRESS" | "COMPLETED"

export interface Enterprise {
  id: string
  code: string
  name: string
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
  contactPerson: string
  contactPhone: string
  batchesCount: number
  status: EnterpriseStatus
  updatedAt: string
  taxCode?: string
  address?: string
  examDate?: string
}

export type EnterpriseDetailStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PARTNERING"
  | "IN_PROGRESS"
  | "COMPLETED"

export interface EnterpriseDetail {
  id: string
  code: string
  name: string
  taxCode?: string
  contactName: string
  contactPerson?: string
  phone: string
  contactPhone?: string
  email?: string
  address?: string
  shortAddress?: string
  note?: string
  status: EnterpriseDetailStatus
  batchesCount?: number
  updatedAt?: string
}

export interface EnterpriseFilterParams {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface EnterpriseListResponse {
  data: Enterprise[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface EnterpriseCounters {
  total: number
  inProgress: number
  completed: number
  totalBatches: number
  estimatedEmployees: number
}

export interface CreateEnterpriseDto {
  name: string
  taxCode?: string
  contactPerson: string
  contactPhone: string
  address?: string
}

export interface UpdateEnterpriseDto {
  name: string
  taxCode?: string
  contactName: string
  phone: string
  email?: string
  address?: string
  note?: string
}
