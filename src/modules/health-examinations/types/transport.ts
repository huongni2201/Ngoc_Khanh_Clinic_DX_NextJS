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
  batchCode: string
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

export const serviceCatalogItemResponseSchema = z.object({
  id: z.string().min(1),
  code: z.string(),
  name: z.string(),
  serviceType: z.string(),
  unitPrice: z.number().nonnegative(),
  active: z.boolean(),
})

export type ServiceCatalogItemResponseDto = z.infer<typeof serviceCatalogItemResponseSchema>

export const serviceCatalogPageResponseSchema = z.object({
  items: z.array(serviceCatalogItemResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const healthExaminationBatchPageResponseSchema = z.object({
  items: z.array(healthExaminationBatchSummaryResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const PARTICIPANT_SEX_VALUES = ["MALE", "FEMALE", "OTHER", "UNKNOWN"] as const
export const PARTICIPANT_ROSTER_STATUSES = ["ACTIVE", "CANCELLED"] as const
export const PARTICIPANT_ATTENDANCE_STATUSES = ["UNCONFIRMED", "ATTENDED", "ABSENT"] as const
export const PARTICIPANT_RECONCILIATION_STATUSES = ["PENDING", "RECONCILED"] as const

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

/** Result of `POST .../participants/imports`: identifiers and counts only, never row content. */
export const participantImportResponseSchema = z.object({
  importJobId: z.string().min(1),
  batchId: z.string().min(1),
  totalRows: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  completedAt: z.string().min(1),
})

export type ParticipantImportResponseDto = z.infer<typeof participantImportResponseSchema>
