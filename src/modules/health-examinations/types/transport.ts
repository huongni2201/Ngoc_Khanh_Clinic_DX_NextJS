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
  "IN_PROGRESS",
  "RESULT_PROCESSING",
  "FINALIZED",
  "CLOSED",
  "CANCELED",
  "DELETED",
] as const

export type HealthExaminationBatchStatus =
  (typeof HEALTH_EXAMINATION_BATCH_STATUSES)[number]

export type ExaminationSiteType = "CLINIC" | "COMPANY"

const batchStatusSchema = z.enum(HEALTH_EXAMINATION_BATCH_STATUSES)
const optionalDateSchema = z.iso.date().nullable()
const optionalTextSchema = z.string().nullable()

export const healthExaminationBatchSummaryResponseSchema = z.object({
  id: z.string().min(1),
  batchCode: z.string(),
  batchName: z.string(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  status: batchStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type HealthExaminationBatchSummaryResponseDto = z.infer<
  typeof healthExaminationBatchSummaryResponseSchema
>

const batchServiceResponseSchema = z.object({
  id: z.string().min(1),
  serviceId: z.string().min(1),
  serviceCode: z.string(),
  serviceName: z.string(),
  negotiatedUnitPrice: z.number().nonnegative(),
  currency: z.string(),
  displayOrder: z.number().int(),
  status: z.string(),
  documentTemplateVersionId: optionalTextSchema,
})

export const healthExaminationBatchDetailResponseSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  batchCode: z.string(),
  batchName: z.string(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  reason: optionalTextSchema,
  payerType: optionalTextSchema,
  examinationSiteType: z.enum(["CLINIC", "COMPANY"]),
  examinationSiteName: z.string(),
  examinationSiteAddress: optionalTextSchema,
  masterTemplateVersionId: z.string().min(1),
  status: batchStatusSchema,
  finalizedAt: optionalTextSchema,
  closedAt: optionalTextSchema,
  createdBy: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  services: z.array(batchServiceResponseSchema),
})

export type HealthExaminationBatchDetailResponseDto = z.infer<
  typeof healthExaminationBatchDetailResponseSchema
>

export interface HealthExaminationBatchConfigurationRequestDto {
  batchCode: string
  batchName: string
  startDate: string | null
  endDate: string | null
  reason: string | null
  payerType: string | null
  examinationSiteType: ExaminationSiteType
  examinationSiteName: string
  examinationSiteAddress: string | null
  services: { serviceId: string; negotiatedUnitPrice: number }[]
}

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
