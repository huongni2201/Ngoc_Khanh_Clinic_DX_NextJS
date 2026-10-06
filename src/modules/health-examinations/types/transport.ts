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

export interface BatchParticipantResponseDto {
  batchParticipantId: string
  participantId: string
  participantCode: string | null
  departmentName: string | null
  jobTitle: string | null
  occupation: string | null
  fullName: string
  dateOfBirth: string
  sex: string
  identificationNumber: string
  identificationNumberIssueDate: string | null
  identificationNumberIssuePlace: string | null
  ethnicity: string | null
  subjectType: string | null
  payerSource: string | null
  bloodGroup: string | null
  phone: string | null
  province: string | null
  ward: string | null
  addressDetail: string | null
  administrativeOccupation: string | null
  workplaceOrSchool: string | null
  healthExaminationReason: string | null
  status: string
  createdAt: string
}
