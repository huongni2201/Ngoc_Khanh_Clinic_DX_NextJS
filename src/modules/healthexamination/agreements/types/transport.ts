import { z } from "zod"

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const HEALTH_EXAMINATION_AGREEMENT_STATUSES = ["DRAFT", "ACTIVE", "ENDED"] as const

export type HealthExaminationAgreementStatus =
  (typeof HEALTH_EXAMINATION_AGREEMENT_STATUSES)[number]

export type ExaminationSiteType = "CLINIC" | "ORGANIZATION_SITE"

export const SESSION_ACTIVITIES = ["ALL", "SAMPLING", "EXAMINATION"] as const
export type SessionActivity = (typeof SESSION_ACTIVITIES)[number]

export const SESSION_STATUSES = ["OPEN", "CANCELLED"] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const ASSIGNMENT_STATUSES = ["ASSIGNED", "ATTENDED", "NO_SHOW", "MOVED", "CANCELLED"] as const
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number]

const agreementStatusSchema = z.enum(HEALTH_EXAMINATION_AGREEMENT_STATUSES)
const optionalDateSchema = z.iso.date().nullable()
const rowVersionSchema = z.number().int().nonnegative()

export const healthExaminationAgreementSummaryResponseSchema = z.object({
  id: z.string().min(1),
  agreementCode: z.string(),
  agreementName: z.string(),
  validFrom: optionalDateSchema,
  validTo: optionalDateSchema,
  status: agreementStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  rowVersion: rowVersionSchema,
})

export type HealthExaminationAgreementSummaryResponseDto = z.infer<
  typeof healthExaminationAgreementSummaryResponseSchema
>

const agreementServiceResponseSchema = z.object({
  id: z.string().min(1),
  serviceId: z.string().min(1),
  // Names come from the catalog and are null when the catalog row can no longer be resolved.
  serviceCode: z.string().nullable().optional(),
  serviceName: z.string().nullable().optional(),
  referencePriceSnapshot: z.number().nonnegative(),
  negotiatedPrice: z.number().nonnegative(),
  displayOrder: z.number().int(),
  active: z.boolean(),
  rowVersion: rowVersionSchema,
})

export const healthExaminationAgreementDetailResponseSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  agreementCode: z.string(),
  agreementName: z.string(),
  validFrom: optionalDateSchema,
  validTo: optionalDateSchema,
  status: agreementStatusSchema,
  createdBy: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  rowVersion: rowVersionSchema,
  services: z.array(agreementServiceResponseSchema),
})

export type HealthExaminationAgreementDetailResponseDto = z.infer<
  typeof healthExaminationAgreementDetailResponseSchema
>

export interface HealthExaminationAgreementServiceRequestDto {
  serviceId: string
  negotiatedPrice: number
}

export interface HealthExaminationAgreementCreateRequestDto {
  agreementName: string
  validFrom: string | null
  validTo: string | null
  services: HealthExaminationAgreementServiceRequestDto[]
}

export interface HealthExaminationAgreementUpdateRequestDto
  extends HealthExaminationAgreementCreateRequestDto {
  rowVersion: number
}

/** Body of `POST …/agreements/{agreementId}/activate` and `…/end`. */
export interface HealthExaminationAgreementVersionRequestDto {
  rowVersion: number
}

export const healthExaminationAgreementPageResponseSchema = z.object({
  items: z.array(healthExaminationAgreementSummaryResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

// --- Sessions and assignments ---

const sessionActivitySchema = z.enum(SESSION_ACTIVITIES)
const sessionStatusSchema = z.enum(SESSION_STATUSES)
const assignmentStatusSchema = z.enum(ASSIGNMENT_STATUSES)
const siteTypeSchema = z.enum(["CLINIC", "ORGANIZATION_SITE"])

/** One session (Lịch khám) of an Organization; `agreementId` is null when it is shared. */
export const sessionResponseSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  agreementId: z.string().nullish(),
  sessionDate: z.iso.date(),
  activity: sessionActivitySchema,
  siteType: siteTypeSchema,
  siteAddress: z.string().nullish(),
  status: sessionStatusSchema,
  assignedCount: z.number().int().nonnegative(),
  attendedCount: z.number().int().nonnegative(),
  noShowCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  rowVersion: rowVersionSchema,
})

export type SessionResponseDto = z.infer<typeof sessionResponseSchema>

export const sessionPageResponseSchema = z.object({
  items: z.array(sessionResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export interface SessionWriteRequestDto {
  sessionDate: string
  activity: SessionActivity
  siteType: ExaminationSiteType
  siteAddress: string
}

export interface SessionCreateRequestDto extends SessionWriteRequestDto {
  agreementId?: string
}

export interface SessionUpdateRequestDto extends SessionWriteRequestDto {
  rowVersion: number
}

/** One Participant of a session with the state of its assignment. */
export const assignmentRowResponseSchema = z.object({
  assignmentId: z.string().min(1),
  status: assignmentStatusSchema,
  attendedAt: z.string().nullish(),
  note: z.string().nullish(),
  assignmentRowVersion: rowVersionSchema,
  participantId: z.string().min(1),
  agreementId: z.string().min(1),
  participantCode: z.string().nullish(),
  fullName: z.string(),
  dateOfBirth: z.iso.date(),
  sex: z.string(),
  identificationNumberMasked: z.string(),
  departmentName: z.string(),
  positionName: z.string(),
  rosterStatus: z.enum(["ACTIVE", "CANCELLED"]),
})

export type AssignmentRowResponseDto = z.infer<typeof assignmentRowResponseSchema>

export const assignmentPageResponseSchema = z.object({
  items: z.array(assignmentRowResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

/** The assignment after a move, a cancellation or an attendance record. */
export const assignmentResponseSchema = z.object({
  id: z.string().min(1),
  participantId: z.string().min(1),
  sessionId: z.string().min(1),
  status: assignmentStatusSchema,
  replacedByAssignmentId: z.string().nullish(),
  attendedAt: z.string().nullish(),
  note: z.string().nullish(),
  rowVersion: rowVersionSchema,
})

export type AssignmentResponseDto = z.infer<typeof assignmentResponseSchema>

export const assignParticipantsResponseSchema = z.object({
  sessionId: z.string().min(1),
  assigned: z.array(z.object({ participantId: z.string().min(1), assignmentId: z.string().min(1) })),
  skippedParticipantIds: z.array(z.string().min(1)),
})

export type AssignParticipantsResponseDto = z.infer<typeof assignParticipantsResponseSchema>

export const moveSessionAssignmentsResponseSchema = z.object({
  sourceSessionId: z.string().min(1),
  targetSessionId: z.string().min(1),
  movedCount: z.number().int().nonnegative(),
  skippedParticipantIds: z.array(z.string().min(1)),
})

export type MoveSessionAssignmentsResponseDto = z.infer<typeof moveSessionAssignmentsResponseSchema>

// --- Participants ---

export const PARTICIPANT_SEX_VALUES = ["MALE", "FEMALE", "OTHER", "UNKNOWN"] as const
const PARTICIPANT_ROSTER_STATUSES = ["ACTIVE", "CANCELLED"] as const
/** Derived by the backend from the session assignments; never written. */
const PARTICIPANT_ATTENDANCE_STATUSES = ["UNCONFIRMED", "ATTENDED", "NO_SHOW"] as const
const PARTICIPANT_RECONCILIATION_STATUSES = ["PENDING", "RECONCILED"] as const

/**
 * One row of `GET .../participants`. The identification number is masked by the backend; the
 * complete value is never sent to the list. Unknown enum values fail parsing instead of being
 * guessed. A Participant has no examination day: `nextSessionDate` and `lastAttendedDate` come from
 * its assignments.
 */
export const participantSummaryResponseSchema = z.object({
  id: z.string().min(1),
  agreementId: z.string().min(1),
  participantCode: z.string().nullish(),
  fullName: z.string(),
  dateOfBirth: z.iso.date(),
  sex: z.enum(PARTICIPANT_SEX_VALUES),
  identificationNumberMasked: z.string(),
  departmentName: z.string(),
  positionName: z.string(),
  rosterStatus: z.enum(PARTICIPANT_ROSTER_STATUSES),
  attendanceStatus: z.enum(PARTICIPANT_ATTENDANCE_STATUSES),
  reconciliationStatus: z.enum(PARTICIPANT_RECONCILIATION_STATUSES),
  liveAssignmentCount: z.number().int().nonnegative(),
  nextSessionDate: z.iso.date().nullish(),
  lastAttendedDate: z.iso.date().nullish(),
  preparedAt: z.string().nullish(),
  rowVersion: rowVersionSchema,
})

export type ParticipantSummaryResponseDto = z.infer<typeof participantSummaryResponseSchema>

export const participantPageResponseSchema = z.object({
  items: z.array(participantSummaryResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

/** Every assignment of one Participant with its session, newest session first. */
export const participantAssignmentResponseSchema = z.object({
  assignmentId: z.string().min(1),
  sessionId: z.string().min(1),
  sessionDate: z.iso.date(),
  activity: sessionActivitySchema,
  siteType: siteTypeSchema,
  siteAddress: z.string().nullish(),
  sessionStatus: sessionStatusSchema,
  status: assignmentStatusSchema,
  replacedByAssignmentId: z.string().nullish(),
  attendedAt: z.string().nullish(),
  note: z.string().nullish(),
  rowVersion: rowVersionSchema,
})

export type ParticipantAssignmentResponseDto = z.infer<typeof participantAssignmentResponseSchema>

/**
 * `GET/POST/PUT .../participants[/{id}]`: one Participant in full for the edit form. Unlike the
 * list row it carries the complete CCCD, phone and email, so it is only requested by accounts that
 * may manage Participants. It never carries the Patient identifier or the attendance note.
 */
export const participantDetailResponseSchema = participantSummaryResponseSchema
  .omit({ liveAssignmentCount: true, nextSessionDate: true, lastAttendedDate: true })
  .extend({
    identificationNumber: z.string().min(1),
    identificationIssueDate: z.string().nullish(),
    identificationIssuePlace: z.string().nullish(),
    ethnicity: z.string().nullish(),
    phone: z.string().nullish(),
    email: z.string().nullish(),
    address: z.string().nullish(),
    workplace: z.string().nullish(),
    note: z.string().nullish(),
    /** True once the Participant was prepared for a visit: the CCCD is then locked. */
    patientLinked: z.boolean(),
    source: z.enum(["IMPORT", "MANUAL"]),
    assignments: z.array(participantAssignmentResponseSchema),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })

export type ParticipantDetailResponseDto = z.infer<typeof participantDetailResponseSchema>

/** Body of `POST .../participants` (and, with `rowVersion`, of `PUT .../participants/{id}`). */
export interface ParticipantWriteRequestDto {
  fullName: string
  dateOfBirth: string
  sex: (typeof PARTICIPANT_SEX_VALUES)[number]
  identificationNumber: string
  identificationIssueDate: string | null
  identificationIssuePlace: string | null
  ethnicity: string | null
  phone: string | null
  email: string | null
  address: string | null
  workplace: string | null
  departmentName: string
  positionName: string
  note: string | null
}

export interface ParticipantUpdateRequestDto extends ParticipantWriteRequestDto {
  rowVersion: number
}

/** Body of `POST .../participants/{id}/reactivate`. */
export interface ParticipantReactivateRequestDto {
  rowVersion: number
}

/** Result of `POST .../participants/imports`: identifiers and counts only, never row content. */
export const participantImportResponseSchema = z.object({
  importJobId: z.string().min(1),
  agreementId: z.string().min(1),
  totalRows: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  completedAt: z.string().min(1),
  // Present only when the import also scheduled the new Participants into a session.
  sessionId: z.string().nullish(),
  assignedCount: z.number().int().nonnegative().nullish(),
})

export type ParticipantImportResponseDto = z.infer<typeof participantImportResponseSchema>

/**
 * One row of `GET .../examination-details`: a Participant of the active roster and the agreement
 * services recorded as performed. The identification number is masked; unknown enum values fail
 * parsing instead of being guessed.
 */
export const examinationDetailRowResponseSchema = z.object({
  id: z.string().min(1),
  participantCode: z.string().nullish(),
  fullName: z.string(),
  identificationNumberMasked: z.string(),
  departmentName: z.string(),
  positionName: z.string(),
  nextSessionDate: z.iso.date().nullish(),
  attendanceStatus: z.enum(PARTICIPANT_ATTENDANCE_STATUSES),
  lastAttendedDate: z.iso.date().nullish(),
  reconciliationStatus: z.enum(PARTICIPANT_RECONCILIATION_STATUSES),
  performedAgreementServiceIds: z.array(z.string().min(1)),
  rowVersion: rowVersionSchema,
})

export type ExaminationDetailRowResponseDto = z.infer<typeof examinationDetailRowResponseSchema>

export const examinationDetailPageResponseSchema = z.object({
  items: z.array(examinationDetailRowResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

/** `GET .../examination-details/summary`: counters of the active roster. */
export const examinationSummaryResponseSchema = z.object({
  registered: z.number().int().nonnegative(),
  unconfirmed: z.number().int().nonnegative(),
  attended: z.number().int().nonnegative(),
  noShow: z.number().int().nonnegative(),
  unscheduled: z.number().int().nonnegative(),
  reconciled: z.number().int().nonnegative(),
  pendingReconciliation: z.number().int().nonnegative(),
})

export type ExaminationSummaryResponseDto = z.infer<typeof examinationSummaryResponseSchema>

/** Body of `PUT .../examination-details/{participantId}`: the services performed, no attendance. */
export interface RecordExaminationDetailRequestDto {
  performedAgreementServiceIds: string[]
  rowVersion: number
}

/** Result of `POST .../examination-details/imports`: identifiers and counts only. */
export const examinationDetailImportResponseSchema = z.object({
  importJobId: z.string().min(1),
  agreementId: z.string().min(1),
  totalRows: z.number().int().nonnegative(),
  updatedParticipants: z.number().int().nonnegative(),
  unchangedParticipants: z.number().int().nonnegative(),
  performedItems: z.number().int().nonnegative(),
  completedAt: z.string().min(1),
})

export type ExaminationDetailImportResponseDto = z.infer<
  typeof examinationDetailImportResponseSchema
>

/**
 * `GET .../reports/payment-summary`. A line is one agreement service at one price snapshot, so a
 * service whose price changed appears on two lines. Money is a plain number.
 */
export const paymentSummaryReportResponseSchema = z.object({
  agreementId: z.string().min(1),
  agreementCode: z.string(),
  agreementName: z.string(),
  agreementStatus: agreementStatusSchema,
  validFrom: optionalDateSchema.optional(),
  validTo: optionalDateSchema.optional(),
  rangeFrom: optionalDateSchema.optional(),
  rangeTo: optionalDateSchema.optional(),
  provisional: z.boolean(),
  registeredCount: z.number().int().nonnegative(),
  attendedCount: z.number().int().nonnegative(),
  reconciledCount: z.number().int().nonnegative(),
  sessionCount: z.number().int().nonnegative(),
  visitCount: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      agreementServiceId: z.string().min(1),
      serviceCode: z.string().nullish(),
      serviceName: z.string().nullish(),
      displayOrder: z.number().int(),
      unitPrice: z.number().nonnegative(),
      examinedCount: z.number().int().nonnegative(),
      amount: z.number().nonnegative(),
    })
  ),
  totalAmount: z.number().nonnegative(),
  generatedAt: z.string().min(1),
})

export type PaymentSummaryReportResponseDto = z.infer<typeof paymentSummaryReportResponseSchema>

/** Body of `POST .../participants/examination-form-print-jobs`. */
export type ExaminationFormPrintJobRequestDto =
  | { participantIds: string[]; sessionId?: string }
  | {
      scope: "SESSION"
      sessionId: string
      includeAttended: boolean
      sort: "DEPARTMENT" | "CODE" | "IMPORT_ORDER"
    }

export const examinationFormPrintJobResponseSchema = z.object({
  jobId: z.string().min(1),
})

export type ExaminationFormPrintJobResponseDto = z.infer<
  typeof examinationFormPrintJobResponseSchema
>
