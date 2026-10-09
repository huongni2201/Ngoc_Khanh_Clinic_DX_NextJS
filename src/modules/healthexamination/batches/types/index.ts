import type {
  ExaminationSiteType,
  HealthExaminationBatchStatus,
} from "./transport"

export type * from "./transport"
export { HEALTH_EXAMINATION_BATCH_STATUSES } from "./transport"

export interface HealthExaminationBatchService {
  id: string
  serviceId: string
  /** Null when the catalog row can no longer be resolved. */
  code: string | null
  name: string | null
  referencePrice: number
  negotiatedPrice: number
  displayOrder: number
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
  rowVersion: number
}

export interface HealthExaminationBatchDay {
  id: string
  /** `yyyy-MM-dd`. */
  examinationDate: string
}

export interface HealthExaminationBatch extends HealthExaminationBatchSummary {
  /** Examination dates (yyyy-MM-dd), ascending. */
  examinationDates: string[]
  /** The batch days with their identifiers, ascending by date; a Participant is scheduled on one. */
  examinationDays?: HealthExaminationBatchDay[]
  examinationSiteType: ExaminationSiteType
  examinationSiteName: string
  examinationSiteAddress: string | null
  createdBy: string
  services: HealthExaminationBatchService[]
}

export interface HealthExaminationBatchServiceInput {
  serviceId: string
  negotiatedPrice: number
}

/**
 * The batch code is not part of the request: the backend generates it on create and never changes
 * it afterwards.
 */
export interface CreateHealthExaminationBatchRequest {
  organizationId: string
  batchName: string
  examinationDates: string[]
  examinationSiteType: ExaminationSiteType
  examinationSiteName: string
  examinationSiteAddress: string
  services: HealthExaminationBatchServiceInput[]
}

export interface UpdateHealthExaminationBatchRequest
  extends CreateHealthExaminationBatchRequest {
  batchId: string
  rowVersion: number
}

export interface DeleteHealthExaminationBatchRequest {
  organizationId: string
  batchId: string
  rowVersion: number
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

export type ParticipantSex = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
export type ParticipantRosterStatus = "ACTIVE" | "CANCELLED"
export type ParticipantAttendanceStatus = "UNCONFIRMED" | "ATTENDED" | "ABSENT"
export type ParticipantReconciliationStatus = "PENDING" | "RECONCILED"

/** A Participant of one batch roster as the list endpoint returns it (dates stay ISO strings). */
export interface HealthExaminationParticipant {
  id: string
  batchId: string
  batchDayId: string
  /** The batch day the Participant is scheduled for (`yyyy-MM-dd`). */
  examinationDate: string
  participantCode?: string
  fullName: string
  dateOfBirth: string
  sex: ParticipantSex
  /** Masked by the backend: only the last four characters are readable. */
  identificationNumberMasked: string
  departmentName: string
  positionName: string
  rosterStatus: ParticipantRosterStatus
  attendanceStatus: ParticipantAttendanceStatus
  reconciliationStatus: ParticipantReconciliationStatus
  actualExaminationDate?: string
  preparedAt?: string
  rowVersion: number
}

export type ParticipantSortKey =
  | "id"
  | "fullName"
  | "participantCode"
  | "examinationDate"
  | "createdAt"

export interface ParticipantListFilterParams {
  search?: string
  /** Exact CCCD match; used to find the cancelled Participant that holds a CCCD. */
  identificationNumber?: string
  rosterStatus?: ParticipantRosterStatus
  attendanceStatus?: ParticipantAttendanceStatus
  reconciliationStatus?: ParticipantReconciliationStatus
  page?: number
  pageSize?: number
  sortKey?: ParticipantSortKey
  sortBy?: "ASC" | "DESC"
}

export interface ParticipantListResponse {
  data: HealthExaminationParticipant[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** A Participant in full, as the detail endpoint returns it. Only for accounts that manage Participants. */
export interface ParticipantDetail extends HealthExaminationParticipant {
  /** The complete CCCD; the list only carries the masked value. */
  identificationNumber: string
  /** Date the CCCD was issued (`yyyy-MM-dd`). */
  identificationIssueDate?: string
  identificationIssuePlace?: string
  ethnicity?: string
  phone?: string
  email?: string
  /** Residential address. */
  address?: string
  workplace?: string
  note?: string
  /** The Participant was prepared for a visit: the CCCD can no longer change. */
  patientLinked: boolean
  source: "IMPORT" | "MANUAL"
  createdAt: string
  updatedAt: string
}

/** Values of the add/edit Participant form. Every field is a string the user can type. */
export interface ParticipantFormValues {
  fullName: string
  /** `yyyy-MM-dd` or empty. */
  dateOfBirth: string
  sex: ParticipantSex | ""
  identificationNumber: string
  /** `yyyy-MM-dd` or empty. */
  identificationIssueDate: string
  identificationIssuePlace: string
  ethnicity: string
  phone: string
  email: string
  address: string
  workplace: string
  departmentName: string
  positionName: string
  note: string
  batchDayId: string
}

/** Validated fields of a Participant sent to the backend. */
export interface ParticipantInput {
  fullName: string
  dateOfBirth: string
  sex: ParticipantSex
  identificationNumber: string
  identificationIssueDate?: string
  identificationIssuePlace?: string
  ethnicity?: string
  phone?: string
  email?: string
  address?: string
  workplace?: string
  departmentName: string
  positionName: string
  note?: string
  batchDayId: string
}

export interface CreateParticipantRequest extends ParticipantInput {
  organizationId: string
  batchId: string
}

export interface UpdateParticipantRequest extends ParticipantInput {
  organizationId: string
  batchId: string
  participantId: string
  /** Version of the Participant the form was filled from. */
  rowVersion: number
}

export interface CancelParticipantRequest {
  organizationId: string
  batchId: string
  participantId: string
  rowVersion: number
}

export interface ReactivateParticipantRequest {
  organizationId: string
  batchId: string
  participantId: string
  rowVersion: number
  /** Examination day to put the Participant on; omitted keeps the day it had when cancelled. */
  batchDayId?: string
}

export interface ImportParticipantsRequest {
  organizationId: string
  batchId: string
  file: File
  /** Batch `rowVersion` the template was prepared for; a different version is rejected. */
  rowVersion: number
  /** Client-generated UUID; resending the same request with the same key is safe. */
  idempotencyKey: string
}

export interface ParticipantImportResult {
  importJobId: string
  batchId: string
  totalRows: number
  createdCount: number
  completedAt: string
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

/** One Participant row of the examination detail matrix (dates stay ISO strings). */
export interface ExaminationDetailRow {
  id: string
  participantCode?: string
  fullName: string
  identificationNumberMasked: string
  departmentName: string
  positionName: string
  examinationDate: string
  attendanceStatus: ParticipantAttendanceStatus
  actualExaminationDate?: string
  reconciliationStatus: ParticipantReconciliationStatus
  /** Batch service ids recorded as performed; the matrix columns are the batch services. */
  performedBatchServiceIds: string[]
  rowVersion: number
}

export type ExaminationDetailSortKey = "id" | "participantCode" | "fullName" | "examinationDate"

/**
 * The status choices of the screen. The backend has no screen status: each choice is a pair of
 * attendance and reconciliation filters.
 */
export type ExaminationStatusFilter =
  | "UNCONFIRMED"
  | "ABSENT"
  | "ATTENDED_PENDING"
  | "RECONCILED"

export interface ExaminationDetailListFilterParams {
  page?: number
  pageSize?: number
  search?: string
  sortKey?: ExaminationDetailSortKey
  sortBy?: "ASC" | "DESC"
  statusFilter?: ExaminationStatusFilter
}

export interface ExaminationDetailListResponse {
  data: ExaminationDetailRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ExaminationSummary {
  registered: number
  unconfirmed: number
  attended: number
  absent: number
  reconciled: number
  pendingReconciliation: number
}

export interface ImportExaminationDetailsRequest {
  organizationId: string
  batchId: string
  file: File
  /** One key per chosen file, reused while the same file is resent. */
  idempotencyKey: string
}

export interface ExaminationDetailImportResult {
  importJobId: string
  batchId: string
  totalRows: number
  updatedParticipants: number
  unchangedParticipants: number
  performedItems: number
  completedAt: string
}

export interface PaymentSummaryItem {
  batchServiceId: string
  serviceCode?: string
  serviceName?: string
  displayOrder: number
  unitPrice: number
  examinedCount: number
  amount: number
}

export interface PaymentSummaryReport {
  batchId: string
  batchCode: string
  batchName: string
  batchStatus: HealthExaminationBatchStatus
  /** True until the batch is finalized: the figures may still change. */
  provisional: boolean
  registeredCount: number
  attendedCount: number
  reconciledCount: number
  items: PaymentSummaryItem[]
  totalAmount: number
  generatedAt: string
}

/** A file the backend generated, ready to be saved. */
export interface DownloadedFile {
  blob: Blob
  fileName: string
}
