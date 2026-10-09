import { z } from "zod"

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const HEALTH_EXAMINATION_BATCH_STATUSES = [
  "DRAFT",
  "READY",
  "FINALIZED",
  "CLOSED",
] as const

export type HealthExaminationBatchStatus =
  (typeof HEALTH_EXAMINATION_BATCH_STATUSES)[number]

export type ExaminationSiteType = "CLINIC" | "ORGANIZATION_SITE"

const batchStatusSchema = z.enum(HEALTH_EXAMINATION_BATCH_STATUSES)
const optionalDateSchema = z.iso.date().nullable()
const rowVersionSchema = z.number().int().nonnegative()

export const healthExaminationBatchSummaryResponseSchema = z.object({
  id: z.string().min(1),
  batchCode: z.string(),
  batchName: z.string(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  status: batchStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  rowVersion: rowVersionSchema,
})

export type HealthExaminationBatchSummaryResponseDto = z.infer<
  typeof healthExaminationBatchSummaryResponseSchema
>

const batchDayResponseSchema = z.object({
  id: z.string().min(1),
  examinationDate: z.iso.date(),
})

const batchServiceResponseSchema = z.object({
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

export const healthExaminationBatchDetailResponseSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  batchCode: z.string(),
  batchName: z.string(),
  days: z.array(batchDayResponseSchema),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  examinationSiteType: z.enum(["CLINIC", "ORGANIZATION_SITE"]),
  examinationSiteName: z.string(),
  examinationSiteAddress: z.string().nullable(),
  status: batchStatusSchema,
  createdBy: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  rowVersion: rowVersionSchema,
  services: z.array(batchServiceResponseSchema),
})

export type HealthExaminationBatchDetailResponseDto = z.infer<
  typeof healthExaminationBatchDetailResponseSchema
>

export interface HealthExaminationBatchServiceRequestDto {
  serviceId: string
  negotiatedPrice: number
}

export interface HealthExaminationBatchCreateRequestDto {
  batchName: string
  examinationDates: string[]
  examinationSiteType: ExaminationSiteType
  examinationSiteName: string
  examinationSiteAddress: string
  services: HealthExaminationBatchServiceRequestDto[]
}

export interface HealthExaminationBatchUpdateRequestDto
  extends HealthExaminationBatchCreateRequestDto {
  rowVersion: number
}

export const healthExaminationBatchPageResponseSchema = z.object({
  items: z.array(healthExaminationBatchSummaryResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const PARTICIPANT_SEX_VALUES = ["MALE", "FEMALE", "OTHER", "UNKNOWN"] as const
const PARTICIPANT_ROSTER_STATUSES = ["ACTIVE", "CANCELLED"] as const
const PARTICIPANT_ATTENDANCE_STATUSES = ["UNCONFIRMED", "ATTENDED", "ABSENT"] as const
const PARTICIPANT_RECONCILIATION_STATUSES = ["PENDING", "RECONCILED"] as const

/**
 * One row of `GET .../participants`. The identification number is masked by the backend; the
 * complete value is never sent to the list. Unknown enum values fail parsing instead of being
 * guessed.
 */
export const participantSummaryResponseSchema = z.object({
  id: z.string().min(1),
  batchId: z.string().min(1),
  batchDayId: z.string().min(1),
  examinationDate: z.iso.date(),
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
  actualExaminationDate: z.iso.date().nullish(),
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

/**
 * `GET/POST/PUT .../participants[/{id}]`: one Participant in full for the edit form. Unlike the
 * list row it carries the complete CCCD, phone and email, so it is only requested by accounts that
 * may manage Participants. It never carries the Patient identifier or the attendance note.
 */
export const participantDetailResponseSchema = participantSummaryResponseSchema.extend({
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
  batchDayId: string
}

export interface ParticipantUpdateRequestDto extends ParticipantWriteRequestDto {
  rowVersion: number
}

/** Body of `POST .../participants/{id}/reactivate`; a missing `batchDayId` keeps the old day. */
export interface ParticipantReactivateRequestDto {
  rowVersion: number
  batchDayId?: string
}

/** Result of `POST .../participants/imports`: identifiers and counts only, never row content. */
export const participantImportResponseSchema = z.object({
  importJobId: z.string().min(1),
  batchId: z.string().min(1),
  totalRows: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  completedAt: z.string().min(1),
})

export type ParticipantImportResponseDto = z.infer<typeof participantImportResponseSchema>

/**
 * One row of `GET .../examination-details`: a Participant of the active roster and the batch
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
  examinationDate: z.iso.date(),
  attendanceStatus: z.enum(PARTICIPANT_ATTENDANCE_STATUSES),
  actualExaminationDate: z.iso.date().nullish(),
  reconciliationStatus: z.enum(PARTICIPANT_RECONCILIATION_STATUSES),
  performedBatchServiceIds: z.array(z.string().min(1)),
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
  absent: z.number().int().nonnegative(),
  reconciled: z.number().int().nonnegative(),
  pendingReconciliation: z.number().int().nonnegative(),
})

export type ExaminationSummaryResponseDto = z.infer<typeof examinationSummaryResponseSchema>

/** Result of `POST .../examination-details/imports`: identifiers and counts only. */
export const examinationDetailImportResponseSchema = z.object({
  importJobId: z.string().min(1),
  batchId: z.string().min(1),
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
 * `GET .../reports/payment-summary`. A line is one batch service at one price snapshot, so a
 * service whose price changed during the batch appears on two lines. Money is a plain number.
 */
export const paymentSummaryReportResponseSchema = z.object({
  batchId: z.string().min(1),
  batchCode: z.string(),
  batchName: z.string(),
  batchStatus: batchStatusSchema,
  provisional: z.boolean(),
  registeredCount: z.number().int().nonnegative(),
  attendedCount: z.number().int().nonnegative(),
  reconciledCount: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      batchServiceId: z.string().min(1),
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
