export type HealthExaminationBatchStatus = "IN_PROGRESS" | "COMPLETED"

export interface MasterExaminationItem {
  id: string
  code: string
  name: string
  defaultPrice: number
  description?: string
}

export interface HealthExaminationBatchItem {
  examinationItemId: string
  name: string
  unitPrice: number
}

export interface HealthExaminationBatch {
  id: string
  code: string
  enterpriseId: string
  name: string
  examDate: string
  location: string
  employeeCount: number
  status: HealthExaminationBatchStatus
  note?: string
  items: HealthExaminationBatchItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateHealthExaminationBatchRequestItem {
  examinationItemId: string
  unitPrice: number
}

export interface CreateHealthExaminationBatchRequest {
  enterpriseId: string
  name: string
  examDate: string
  location: string
  note?: string
  items: CreateHealthExaminationBatchRequestItem[]
}

export interface HealthExaminationBatchFilterParams {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface HealthExaminationBatchListResponse {
  data: HealthExaminationBatch[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ----------------------------------------------------
// Screen 04 Domain Types
// ----------------------------------------------------

export type EmployeeProfileStatus = "VALID" | "MISSING_CCCD" | "MISSING_SIGNATURE"

export interface EmployeeInBatch {
  id: string
  batchId: string
  employeeCode: string
  fullName: string
  dob: string
  gender: "Nam" | "Nữ"
  cccd: string
  phone: string
  department: string
  jobTitle: string
  address: string
  joinDate: string
  contractType: string
  profileStatus: EmployeeProfileStatus
  note?: string
}

export interface EmployeeListFilterParams {
  search?: string
  department?: string
  profileStatus?: string
  page?: number
  pageSize?: number
}

export interface EmployeeListResponse {
  data: EmployeeInBatch[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ExamItemCompletionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"

export interface EmployeeMatrixItem {
  id: string
  employeeCode: string
  fullName: string
  department: string
  cccd?: string
  // Map of examinationItemId -> status
  examinations: Record<string, ExamItemCompletionStatus>
  // List of completed item IDs for backward compatibility and fast lookup
  completedItemIds: string[]
  examStatus: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED"
  note?: string
  noteType?: "success" | "warning" | "default"
}

export interface EmployeeMatrixFilterParams {
  search?: string
  department?: string
  examStatus?: string
  page?: number
  pageSize?: number
}

export interface MatrixCategoryItem {
  id: string
  name: string
  code?: string
}

export interface EmployeeMatrixResponse {
  items: MatrixCategoryItem[]
  data: EmployeeMatrixItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface HealthExaminationBatchReportItem {
  examinationItemId: string
  name: string
  examinedCount: number
  unitPrice: number
  totalAmount: number
}

export interface HealthExaminationBatchReportSummary {
  batchId: string
  items: HealthExaminationBatchReportItem[]
  totalAmount: number
}

