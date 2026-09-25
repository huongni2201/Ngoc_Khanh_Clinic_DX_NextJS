export type HealthExaminationBatchStatus = "IN_PROGRESS" | "COMPLETED"

export interface ClinicalService {
  id: string
  code: string
  name: string
  defaultPrice: number
  description?: string
}

export interface HealthExaminationBatchService {
  serviceId: string
  name: string
  unitPrice: number
}

export interface HealthExaminationBatch {
  id: string
  code: string
  organizationId: string
  name: string
  examDate: string
  location: string
  participantCount: number
  status: HealthExaminationBatchStatus
  note?: string
  services: HealthExaminationBatchService[]
  createdAt: string
  updatedAt: string
}

export interface CreateHealthExaminationBatchServiceInput {
  serviceId: string
  unitPrice: number
}

export interface CreateHealthExaminationBatchRequest {
  organizationId: string
  name: string
  examDate: string
  location: string
  note?: string
  services: CreateHealthExaminationBatchServiceInput[]
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

export type HealthExaminationParticipantType =
  | "EMPLOYEE"
  | "STUDENT"
  | "STAFF"
  | "MEMBER"
  | "OTHER"

export type ParticipantProfileStatus =
  | "VALID"
  | "MISSING_IDENTIFICATION_NUMBER"
  | "MISSING_SIGNATURE"

export interface HealthExaminationParticipant {
  id: string
  batchId: string
  participantCode?: string
  participantType: HealthExaminationParticipantType
  fullName: string
  dateOfBirth?: string
  gender?: "Nam" | "Nữ" | "OTHER"
  identificationNumber?: string
  phoneNumber?: string
  organizationUnit?: string
  jobTitle?: string
  address?: string
  profileStatus: ParticipantProfileStatus
  note?: string
}

/** Legacy employee-only columns accepted at the import boundary. */
export interface LegacyEmployeeImportRow {
  id: string
  employeeCode?: string
  fullName: string
  dob?: string
  gender?: "Nam" | "Nữ"
  cccd?: string
  phone?: string
  department?: string
  jobTitle?: string
  address?: string
  joinDate?: string
  contractType?: string
  profileStatus?: ParticipantProfileStatus
  note?: string
}

export interface ParticipantListFilterParams {
  search?: string
  organizationUnit?: string
  profileStatus?: string
  page?: number
  pageSize?: number
}

export interface ParticipantListResponse {
  data: HealthExaminationParticipant[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ServiceCompletionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"

export interface ParticipantExaminationProgress {
  id: string
  participantCode?: string
  fullName: string
  organizationUnit?: string
  identificationNumber?: string
  examinations: Record<string, ServiceCompletionStatus>
  completedServiceIds: string[]
  examStatus: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED"
  note?: string
  noteType?: "success" | "warning" | "default"
}

export interface ExaminationProgressFilterParams {
  search?: string
  organizationUnit?: string
  examStatus?: string
  page?: number
  pageSize?: number
}

export interface ClinicalServiceColumn {
  id: string
  name: string
  code?: string
}

export interface ExaminationProgressResponse {
  services: ClinicalServiceColumn[]
  data: ParticipantExaminationProgress[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface HealthExaminationServiceSummary {
  serviceId: string
  name: string
  examinedCount: number
  unitPrice: number
  totalAmount: number
}

export interface HealthExaminationBatchReportSummary {
  batchId: string
  items: HealthExaminationServiceSummary[]
  totalAmount: number
}
