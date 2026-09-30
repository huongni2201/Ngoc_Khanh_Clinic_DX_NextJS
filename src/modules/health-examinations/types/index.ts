import type {
  ExaminationSiteType,
  HealthExaminationBatchStatus,
} from "./transport"

export type * from "./transport"
export { HEALTH_EXAMINATION_BATCH_STATUSES } from "./transport"

export interface ClinicalService {
  id: string
  code: string
  name: string
  description?: string
}

export interface HealthExaminationBatchService {
  serviceId: string
  name: string
  unitPrice: number
}

export interface HealthExaminationBatchSummary {
  id: string
  organizationId: string
  code: string
  name: string
  status: HealthExaminationBatchStatus
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export interface HealthExaminationBatch extends HealthExaminationBatchSummary {
  reason?: string | null
  payerType?: string | null
  examinationSiteType?: ExaminationSiteType
  examinationSiteName?: string
  examinationSiteAddress?: string | null
  masterTemplateVersionId?: string
  finalizedAt?: string | null
  closedAt?: string | null
  createdBy?: string
  services?: HealthExaminationBatchService[]
}

export interface CreateHealthExaminationBatchServiceInput {
  serviceId: string
  negotiatedUnitPrice: number
}

export interface CreateHealthExaminationBatchRequest {
  organizationId: string
  batchCode: string
  batchName: string
  startDate: string
  endDate: string
  reason?: string
  payerType?: string
  examinationSiteType: ExaminationSiteType
  examinationSiteName: string
  examinationSiteAddress?: string
  services: CreateHealthExaminationBatchServiceInput[]
}

export interface HealthExaminationBatchFilterParams {
  search?: string
  page?: number
  pageSize?: number
  sortKey?: "id" | "batchCode" | "batchName" | "startDate" | "status" | "createdAt"
  sortBy?: "ASC" | "DESC"
}

export interface HealthExaminationBatchListResponse {
  data: HealthExaminationBatchSummary[]
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
  participantType?: string
  fullName: string
  dateOfBirth?: string
  gender?: "Nam" | "Nữ" | "OTHER"
  identificationNumber?: string
  phoneNumber?: string
  organizationUnit?: string
  jobTitle?: string
  address?: string
  /** Server-owned status of the participant inside the examination batch. */
  batchParticipantStatus?: string
  /** Legacy import-preview status; not populated by committed BE participants. */
  profileStatus?: ParticipantProfileStatus
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
  page?: number
  pageSize?: number
  sortKey?: string
  sortBy?: "ASC" | "DESC"
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
