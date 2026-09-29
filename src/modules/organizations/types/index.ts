export interface Organization {
  id: string
  name: string
  taxCode?: string
  address?: string
  contactName: string
  contactPhone: string
  contactJobTitle?: string
  note?: string
  status: string
}

export type OrganizationDetail = Organization

export interface OrganizationFilterParams {
  search?: string
  page?: number
  pageSize?: number
  status?: "ACTIVE" | "INACTIVE"
  sortKey?: string
  sortBy?: "ASC" | "DESC"
}

export interface OrganizationListResponse {
  data: Organization[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateOrganizationDto {
  name: string
  taxCode?: string
  address?: string
  contactName: string
  contactPhone: string
  contactJobTitle?: string
  note?: string
}

export type UpdateOrganizationDto = CreateOrganizationDto
