export interface Organization {
  id: string
  name: string
  taxCode?: string
  phone?: string
  email: string
  address: string
  contactName: string
  contactPhone: string
  contactEmail: string
  status: "ACTIVE" | "INACTIVE"
  rowVersion: number
}

export type OrganizationDetail = Organization

export interface OrganizationFilterParams {
  search?: string
  page?: number
  pageSize?: number
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
  phone?: string
  email: string
  address: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export interface UpdateOrganizationDto extends CreateOrganizationDto {
  rowVersion: number
}
