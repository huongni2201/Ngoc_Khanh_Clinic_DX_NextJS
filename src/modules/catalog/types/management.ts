// ─── Shared ────────────────────────────────────────────────────────────────

export interface CatalogPageResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface CatalogListParams {
  q?: string
  page?: number
  size?: number
  active?: boolean | null
  sortKey?: string
  sortBy?: "ASC" | "DESC"
}

// ─── Department ─────────────────────────────────────────────────────────────

export type DepartmentType = "CLINICAL" | "DIAGNOSTIC" | "ADMINISTRATIVE"

export interface Department {
  id: string
  code: string
  name: string
  departmentType: DepartmentType
  active: boolean
  rowVersion: number
  createdAt: string | null
  updatedAt: string | null
}

export interface DepartmentListParams extends CatalogListParams {
  departmentType?: DepartmentType | null
}

export interface CreateDepartmentDto {
  code: string
  name: string
  departmentType: DepartmentType
}

export interface UpdateDepartmentDto {
  name: string
  departmentType: DepartmentType
  rowVersion: number
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string
  code: string
  name: string
  departmentId: string
  departmentName: string
  roomType: string
  active: boolean
  rowVersion: number
  createdAt: string | null
  updatedAt: string | null
}

export interface RoomListParams extends CatalogListParams {
  departmentId?: string | null
  roomType?: string | null
}

export interface CreateRoomDto {
  code: string
  name: string
  departmentId: string
  roomType: string
}

export interface UpdateRoomDto {
  name: string
  roomType: string
  rowVersion: number
}

// ─── Specialty ───────────────────────────────────────────────────────────────

export interface Specialty {
  id: string
  code: string
  name: string
  active: boolean
  rowVersion: number
  createdAt: string | null
  updatedAt: string | null
}

export type SpecialtyListParams = CatalogListParams

export interface CreateSpecialtyDto {
  code: string
  name: string
}

export interface UpdateSpecialtyDto {
  name: string
  rowVersion: number
}

// ─── Service ─────────────────────────────────────────────────────────────────

export type ServiceType =
  | "CONSULTATION"
  | "LAB"
  | "ULTRASOUND"
  | "XRAY"
  | "ECG"
  | "OTHER"

export interface ManagedService {
  id: string
  code: string
  name: string
  serviceType: ServiceType
  performingDepartmentId: string
  performingDepartmentName: string
  specialtyId: string | null
  specialtyName: string | null
  unitPrice: string
  preparationInstruction: string | null
  active: boolean
  rowVersion: number
  createdAt: string | null
  updatedAt: string | null
}

/** List responses omit preparation instructions; load detail before editing. */
export type ManagedServiceListItem = Omit<ManagedService, "preparationInstruction">

export interface ServiceListParams extends CatalogListParams {
  serviceType?: ServiceType | null
  departmentId?: string | null
  specialtyId?: string | null
}

export interface CreateServiceDto {
  code: string
  name: string
  serviceType: ServiceType
  performingDepartmentId: string
  specialtyId?: string | null
  unitPrice: string
  preparationInstruction?: string | null
}

export interface UpdateServiceDto {
  name: string
  serviceType: ServiceType
  specialtyId?: string | null
  unitPrice: string
  preparationInstruction?: string | null
  rowVersion: number
}

// ─── Medicine ────────────────────────────────────────────────────────────────

export interface Medicine {
  id: string
  code: string
  genericName: string
  brandName: string | null
  strength: string
  dosageForm: string
  unit: string
  active: boolean
  rowVersion: number
  createdAt: string | null
  updatedAt: string | null
}

export interface MedicineListParams extends CatalogListParams {
  dosageForm?: string | null
}

export interface CreateMedicineDto {
  code: string
  genericName: string
  brandName?: string | null
  strength: string
  dosageForm: string
  unit: string
}

export interface UpdateMedicineDto {
  genericName: string
  brandName?: string | null
  strength: string
  dosageForm: string
  unit: string
  rowVersion: number
}
