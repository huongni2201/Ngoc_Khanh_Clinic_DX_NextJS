import type {
  AssignmentStatus,
  ExaminationSiteType,
  HealthExaminationAgreementStatus,
  SessionActivity,
  SessionStatus,
} from "./transport"

export type * from "./transport"
export { HEALTH_EXAMINATION_AGREEMENT_STATUSES } from "./transport"

export interface HealthExaminationAgreementService {
  id: string
  serviceId: string
  /** Null when the catalog row can no longer be resolved. */
  code: string | null
  name: string | null
  referencePrice: number
  negotiatedPrice: number
  displayOrder: number
  /** False once the service is retired: it cannot be newly marked as performed. */
  active?: boolean
  rowVersion?: number
}

export interface HealthExaminationAgreementSummary {
  id: string
  organizationId: string
  code: string
  name: string
  status: HealthExaminationAgreementStatus
  /** First day the agreement applies (`yyyy-MM-dd`), or null. */
  validFrom: string | null
  /** Last day the agreement applies (`yyyy-MM-dd`), or null. */
  validTo: string | null
  createdAt: string
  updatedAt: string
  rowVersion: number
}

export interface HealthExaminationAgreement extends HealthExaminationAgreementSummary {
  createdBy: string
  /** Every service line in display order; a retired line has `active = false`. */
  services: HealthExaminationAgreementService[]
}

export interface HealthExaminationAgreementServiceInput {
  serviceId: string
  negotiatedPrice: number
}

/**
 * The agreement code is not part of the request: the backend generates it on create and never changes
 * it afterwards.
 */
export interface CreateHealthExaminationAgreementRequest {
  organizationId: string
  agreementName: string
  /** `yyyy-MM-dd` or null. */
  validFrom: string | null
  validTo: string | null
  services: HealthExaminationAgreementServiceInput[]
}

export interface UpdateHealthExaminationAgreementRequest
  extends CreateHealthExaminationAgreementRequest {
  agreementId: string
  rowVersion: number
}

export interface DeleteHealthExaminationAgreementRequest {
  organizationId: string
  agreementId: string
  rowVersion: number
}

/** Activates a draft agreement (DRAFT to ACTIVE); its basic information is fixed from then on. */
export interface ActivateHealthExaminationAgreementRequest {
  organizationId: string
  agreementId: string
  rowVersion: number
}

/** Ends an active agreement (ACTIVE to ENDED); it becomes read-only history. */
export interface EndHealthExaminationAgreementRequest {
  organizationId: string
  agreementId: string
  rowVersion: number
}

export interface HealthExaminationAgreementFilterParams {
  search?: string
  page?: number
  pageSize?: number
  sortKey?: "id" | "agreementCode" | "agreementName" | "validFrom" | "status" | "createdAt"
  sortBy?: "ASC" | "DESC"
}

export interface HealthExaminationAgreementListResponse {
  data: HealthExaminationAgreementSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ParticipantSex = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
export type ParticipantRosterStatus = "ACTIVE" | "CANCELLED"
/** Derived from the session assignments; never written. */
export type ParticipantAttendanceStatus = "UNCONFIRMED" | "ATTENDED" | "NO_SHOW"
export type ParticipantReconciliationStatus = "PENDING" | "RECONCILED"

/** A Participant of one agreement roster as the list endpoint returns it (dates stay ISO strings). */
export interface HealthExaminationParticipant {
  id: string
  agreementId: string
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
  /** Sessions the Participant is expected at or attended; 0 means not scheduled. */
  liveAssignmentCount: number
  /** Date of the earliest session the Participant is still expected at. */
  nextSessionDate?: string
  /** Date of the latest session the Participant attended. */
  lastAttendedDate?: string
  preparedAt?: string
  rowVersion: number
}

export type ParticipantSortKey =
  | "id"
  | "fullName"
  | "participantCode"
  | "nextSessionDate"
  | "createdAt"

export interface ParticipantListFilterParams {
  search?: string
  /** Exact CCCD match; used to find the cancelled Participant that holds a CCCD. */
  identificationNumber?: string
  rosterStatus?: ParticipantRosterStatus
  attendanceStatus?: ParticipantAttendanceStatus
  reconciliationStatus?: ParticipantReconciliationStatus
  /** Only Participants with a live assignment in this session. */
  sessionId?: string
  /** Only Participants with no live assignment that covers this activity. */
  unscheduledFor?: "ANY" | SessionActivity
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

/** One assignment of a Participant with its session (`yyyy-MM-dd` dates). */
export interface ParticipantAssignment {
  assignmentId: string
  sessionId: string
  sessionDate: string
  activity: SessionActivity
  siteType: ExaminationSiteType
  siteAddress?: string
  sessionStatus: SessionStatus
  status: AssignmentStatus
  replacedByAssignmentId?: string
  attendedAt?: string
  note?: string
  rowVersion: number
}

/** A Participant in full, as the detail endpoint returns it. Only for accounts that manage Participants. */
export interface ParticipantDetail
  extends Omit<HealthExaminationParticipant, "liveAssignmentCount" | "nextSessionDate" | "lastAttendedDate"> {
  /** Every assignment of the Participant, history included, newest session first. */
  assignments: ParticipantAssignment[]
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
}

export interface CreateParticipantRequest extends ParticipantInput {
  organizationId: string
  agreementId: string
}

export interface UpdateParticipantRequest extends ParticipantInput {
  organizationId: string
  agreementId: string
  participantId: string
  /** Version of the Participant the form was filled from. */
  rowVersion: number
}

export interface CancelParticipantRequest {
  organizationId: string
  agreementId: string
  participantId: string
  rowVersion: number
}

export interface ReactivateParticipantRequest {
  organizationId: string
  agreementId: string
  participantId: string
  rowVersion: number
}

export interface ImportParticipantsRequest {
  organizationId: string
  agreementId: string
  file: File
  /** Agreement `rowVersion` the template was prepared for; a different version is rejected. */
  rowVersion: number
  /** Client-generated UUID; resending the same request with the same key is safe. */
  idempotencyKey: string
  /**
   * Open session to put every imported Participant into, in the same commit. Part of the request
   * identity: a retry with the same key must send the same session.
   */
  sessionId?: string
}

export interface ParticipantImportResult {
  importJobId: string
  agreementId: string
  totalRows: number
  createdCount: number
  completedAt: string
  /** Only when the import also scheduled; then `assignedCount` equals `createdCount`. */
  sessionId?: string
  assignedCount?: number
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

export interface HealthExaminationAgreementReportSummary {
  agreementId: string
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
  nextSessionDate?: string
  attendanceStatus: ParticipantAttendanceStatus
  lastAttendedDate?: string
  reconciliationStatus: ParticipantReconciliationStatus
  /** Agreement service ids recorded as performed; the matrix columns are the agreement services. */
  performedAgreementServiceIds: string[]
  rowVersion: number
}

export type ExaminationDetailSortKey = "id" | "participantCode" | "fullName" | "nextSessionDate"

/**
 * The status choices of the screen. The backend has no screen status: each choice is a pair of
 * attendance and reconciliation filters.
 */
export type ExaminationStatusFilter =
  | "UNCONFIRMED"
  | "NO_SHOW"
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
  noShow: number
  /** Participants in no session at all. */
  unscheduled: number
  reconciled: number
  pendingReconciliation: number
}

export interface ImportExaminationDetailsRequest {
  organizationId: string
  agreementId: string
  file: File
  /** One key per chosen file, reused while the same file is resent. */
  idempotencyKey: string
}

/** The services performed for one Participant; attendance is recorded on the assignments. */
export interface RecordExaminationDetailRequest {
  organizationId: string
  agreementId: string
  participantId: string
  /** Empty clears every tick. */
  performedAgreementServiceIds: string[]
  /** The row version the form was opened with. */
  rowVersion: number
}

export interface ExaminationDetailImportResult {
  importJobId: string
  agreementId: string
  totalRows: number
  updatedParticipants: number
  unchangedParticipants: number
  performedItems: number
  completedAt: string
}

export interface PaymentSummaryItem {
  agreementServiceId: string
  serviceCode?: string
  serviceName?: string
  displayOrder: number
  unitPrice: number
  examinedCount: number
  amount: number
}

/** Limits the payment report to the sessions of a date range (`yyyy-MM-dd`, inclusive). */
export interface PaymentSummaryReportRange {
  from?: string
  to?: string
}

export interface PaymentSummaryReport {
  agreementId: string
  agreementCode: string
  agreementName: string
  agreementStatus: HealthExaminationAgreementStatus
  validFrom?: string
  validTo?: string
  /** The session date range the figures were limited to, when one was asked for. */
  rangeFrom?: string
  rangeTo?: string
  /** True until the agreement has ended: the figures may still change. */
  provisional: boolean
  registeredCount: number
  attendedCount: number
  reconciledCount: number
  /** Distinct sessions the counted Participants are in. */
  sessionCount: number
  /** Attended assignments: a Participant who came twice counts twice. */
  visitCount: number
  items: PaymentSummaryItem[]
  totalAmount: number
  generatedAt: string
}

/** A file the backend generated, ready to be saved. */
export interface DownloadedFile {
  blob: Blob
  fileName: string
}

/** A Participant chosen for printing, with what the print dialogs show about them. */
export interface ExaminationFormPrintEntry {
  id: string
  participantCode?: string
  fullName: string
  departmentName: string
}

/**
 * A ticked Participant: what a bulk print needs, plus what a cancellation needs. The same ticks
 * feed both actions, so the version is read when the row is ticked.
 */
export interface ParticipantSelectionEntry extends ExaminationFormPrintEntry {
  /** Version the cancellation is based on. */
  rowVersion: number
  /** Why the Participant cannot be cancelled (prepared, attended, reconciled), else `null`. */
  cancelBlockReason: string | null
}

/** Order of the forms in a bulk print job. The backend prints in the order it receives. */
export type ExaminationFormPrintOrder = "CODE" | "DEPARTMENT"

/**
 * Order of the forms when the backend chooses the Participants of a session:
 * `IMPORT_ORDER` follows the row order of the import file.
 */
export type ExaminationFormSessionPrintOrder = ExaminationFormPrintOrder | "IMPORT_ORDER"

interface ExaminationFormPrintJobRequestBase {
  organizationId: string
  agreementId: string
  /** Reused when the same body is resent after a failure, so a retry never queues twice. */
  idempotencyKey: string
}

/** Prints the Participants the caller names. */
export interface CreateExaminationFormPrintJobByIdsRequest
  extends ExaminationFormPrintJobRequestBase {
  scope?: "IDS"
  /** In print order, without duplicates; at most 1000. */
  participantIds: string[]
  /** The session whose date is printed on the forms; omitted prints each Participant's own next date. */
  sessionId?: string
}

/**
 * Prints the Participants of one session. The backend chooses them when the job is created: active
 * people still expected at the session, plus the examined ones when `includeAttended`.
 */
export interface CreateExaminationFormPrintJobBySessionRequest
  extends ExaminationFormPrintJobRequestBase {
  scope: "SESSION"
  sessionId: string
  includeAttended: boolean
  sort: ExaminationFormSessionPrintOrder
}

export type CreateExaminationFormPrintJobRequest =
  | CreateExaminationFormPrintJobByIdsRequest
  | CreateExaminationFormPrintJobBySessionRequest

/** The print job the backend queued; follow it with the document render job endpoints. */
export interface ExaminationFormPrintJob {
  jobId: string
}

// --- Sessions and assignments ---

/** One session (Lịch khám) as the screens use it; `agreementId` is empty when it is shared. */
export interface ExaminationSession {
  id: string
  organizationId: string
  agreementId?: string
  /** `yyyy-MM-dd`. */
  sessionDate: string
  activity: SessionActivity
  siteType: ExaminationSiteType
  siteAddress?: string
  status: SessionStatus
  /** Participants expected or attended; shown for reference, there is no capacity. */
  assignedCount: number
  attendedCount: number
  noShowCount: number
  createdAt: string
  updatedAt: string
  rowVersion: number
}

export type ExaminationSessionSortKey = "id" | "sessionDate" | "activity" | "status" | "createdAt"

export interface ExaminationSessionFilterParams {
  page?: number
  pageSize?: number
  search?: string
  agreementId?: string
  /** `yyyy-MM-dd`, inclusive. */
  from?: string
  to?: string
  activity?: SessionActivity
  status?: SessionStatus
  sortKey?: ExaminationSessionSortKey
  sortBy?: "ASC" | "DESC"
}

export interface ExaminationSessionListResponse {
  data: ExaminationSession[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ExaminationSessionInput {
  sessionDate: string
  activity: SessionActivity
  siteType: ExaminationSiteType
  /** Required for an organization site; ignored for the clinic. */
  siteAddress: string
}

export interface CreateExaminationSessionRequest extends ExaminationSessionInput {
  organizationId: string
  /** Reserves the session to one agreement; omitted shares it. */
  agreementId?: string
}

export interface UpdateExaminationSessionRequest extends ExaminationSessionInput {
  organizationId: string
  sessionId: string
  rowVersion: number
}

export interface CancelExaminationSessionRequest {
  organizationId: string
  sessionId: string
  rowVersion: number
}

/** One Participant of a session with the state of its assignment. */
export interface SessionAssignmentRow {
  assignmentId: string
  status: AssignmentStatus
  attendedAt?: string
  note?: string
  assignmentRowVersion: number
  participantId: string
  agreementId: string
  participantCode?: string
  fullName: string
  dateOfBirth: string
  sex: string
  identificationNumberMasked: string
  departmentName: string
  positionName: string
  rosterStatus: ParticipantRosterStatus
}

export interface SessionAssignmentFilterParams {
  page?: number
  pageSize?: number
  search?: string
  status?: AssignmentStatus
  sortKey?: "id" | "fullName" | "participantCode" | "departmentName" | "status"
  sortBy?: "ASC" | "DESC"
}

export interface SessionAssignmentListResponse {
  data: SessionAssignmentRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SessionAssignment {
  id: string
  participantId: string
  sessionId: string
  status: AssignmentStatus
  replacedByAssignmentId?: string
  attendedAt?: string
  note?: string
  rowVersion: number
}

export interface AssignParticipantsRequest {
  organizationId: string
  sessionId: string
  /** 1 to 1000 distinct Participants. */
  participantIds: string[]
}

export interface AssignParticipantsResult {
  sessionId: string
  assignedCount: number
  /** Participants that were already in the session; skipped, not an error. */
  skippedParticipantIds: string[]
}

export interface MoveSessionAssignmentRequest {
  organizationId: string
  sessionId: string
  assignmentId: string
  targetSessionId: string
  rowVersion: number
}

export interface MoveSessionAssignmentsRequest {
  organizationId: string
  sessionId: string
  targetSessionId: string
}

export interface MoveSessionAssignmentsResult {
  sourceSessionId: string
  targetSessionId: string
  movedCount: number
  skippedParticipantIds: string[]
}

export interface CancelSessionAssignmentRequest {
  organizationId: string
  sessionId: string
  assignmentId: string
  rowVersion: number
  note?: string
}

/** `ASSIGNED` undoes a wrongly recorded attendance. */
export type RecordableAssignmentStatus = "ATTENDED" | "NO_SHOW" | "ASSIGNED"

export interface RecordSessionAttendanceRequest {
  organizationId: string
  sessionId: string
  assignmentId: string
  status: RecordableAssignmentStatus
  rowVersion: number
  note?: string
}
