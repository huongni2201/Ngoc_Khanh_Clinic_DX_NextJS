import { unavailableApi } from "@/shared/api/api-unavailable"
import { apiClient } from "@/shared/api/api-client"
import type { CreateHealthExaminationBatchRequest, DeleteHealthExaminationBatchRequest, ExaminationProgressFilterParams, ExaminationProgressResponse, HealthExaminationBatch, HealthExaminationBatchFilterParams, HealthExaminationBatchListResponse, HealthExaminationBatchSummary, HealthExaminationBatchReportSummary, UpdateHealthExaminationBatchRequest } from "../types"
import { healthExaminationBatchDetailResponseSchema, healthExaminationBatchPageResponseSchema, type HealthExaminationBatchCreateRequestDto, type HealthExaminationBatchDetailResponseDto, type HealthExaminationBatchSummaryResponseDto, type HealthExaminationBatchUpdateRequestDto } from "../types/transport"
import { normalizeBatchFilterParams } from "../utils/batch-list-params"

const ORGANIZATIONS_ENDPOINT = "/api/v1/organizations"

function batchEndpoint(organizationId: string) {
  return `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(organizationId)}/health-examination-batches`
}

function batchItemEndpoint(organizationId: string, batchId: string) {
  return `${batchEndpoint(organizationId)}/${encodeURIComponent(batchId)}`
}

function mapBatchSummary(
  batch: HealthExaminationBatchSummaryResponseDto,
  organizationId: string
): HealthExaminationBatchSummary {
  return {
    id: batch.id,
    organizationId,
    code: batch.batchCode,
    name: batch.batchName,
    startDate: batch.startDate,
    endDate: batch.endDate,
    status: batch.status,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    rowVersion: batch.rowVersion,
  }
}

function mapBatch(
  batch: HealthExaminationBatchDetailResponseDto
): HealthExaminationBatch {
  return {
    ...mapBatchSummary(batch, batch.organizationId),
    examinationDates: batch.days.map((day) => day.examinationDate).sort(),
    examinationDays: batch.days
      .map((day) => ({ id: day.id, examinationDate: day.examinationDate }))
      .sort((left, right) => left.examinationDate.localeCompare(right.examinationDate)),
    examinationSiteType: batch.examinationSiteType,
    examinationSiteName: batch.examinationSiteName,
    examinationSiteAddress: batch.examinationSiteAddress,
    createdBy: batch.createdBy,
    services: [...batch.services]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((service) => ({
        id: service.id,
        serviceId: service.serviceId,
        code: service.serviceCode ?? null,
        name: service.serviceName ?? null,
        referencePrice: service.referencePriceSnapshot,
        negotiatedPrice: service.negotiatedPrice,
        displayOrder: service.displayOrder,
      })),
  }
}

function toConfigurationBody(
  request: CreateHealthExaminationBatchRequest
): HealthExaminationBatchCreateRequestDto {
  return {
    batchName: request.batchName,
    examinationDates: [...request.examinationDates].sort(),
    examinationSiteType: request.examinationSiteType,
    examinationSiteName: request.examinationSiteName,
    examinationSiteAddress: request.examinationSiteAddress,
    services: request.services.map((service) => ({
      serviceId: service.serviceId,
      negotiatedPrice: service.negotiatedPrice,
    })),
  }
}

export async function fetchHealthExaminationBatchesByOrganization(
  organizationId: string,
  params?: HealthExaminationBatchFilterParams,
  signal?: AbortSignal
): Promise<HealthExaminationBatchListResponse> {
  const normalized = normalizeBatchFilterParams(params)
  const query = new URLSearchParams({
    page: String(normalized.page),
    size: String(normalized.pageSize),
    sortKey: normalized.sortKey,
    sortBy: normalized.sortBy,
    ...(normalized.search ? { searchKey: normalized.search } : {}),
  })
  const response = await apiClient.get<unknown>(
    `${batchEndpoint(organizationId)}?${query}`,
    { signal }
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh sách đợt khám không có dữ liệu.")
  }

  const page = healthExaminationBatchPageResponseSchema.parse(response.data)
  return {
    data: page.items.map((batch) => mapBatchSummary(batch, organizationId)),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export async function fetchHealthExaminationBatchById(
  organizationId: string,
  batchId: string,
  signal?: AbortSignal
): Promise<HealthExaminationBatch> {
  const response = await apiClient.get<unknown>(
    batchItemEndpoint(organizationId, batchId),
    { signal }
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi chi tiết đợt khám không có dữ liệu.")
  }

  return mapBatch(healthExaminationBatchDetailResponseSchema.parse(response.data))
}

export async function createHealthExaminationBatch(
  request: CreateHealthExaminationBatchRequest
): Promise<HealthExaminationBatch> {
  const response = await apiClient.post<HealthExaminationBatchCreateRequestDto, unknown>(
    batchEndpoint(request.organizationId),
    toConfigurationBody(request)
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi tạo đợt khám không có dữ liệu.")
  }

  return mapBatch(healthExaminationBatchDetailResponseSchema.parse(response.data))
}

export async function updateHealthExaminationBatch(
  request: UpdateHealthExaminationBatchRequest
): Promise<HealthExaminationBatch> {
  const body: HealthExaminationBatchUpdateRequestDto = {
    ...toConfigurationBody(request),
    rowVersion: request.rowVersion,
  }
  const response = await apiClient.put<HealthExaminationBatchUpdateRequestDto, unknown>(
    batchItemEndpoint(request.organizationId, request.batchId),
    body
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi cập nhật đợt khám không có dữ liệu.")
  }

  return mapBatch(healthExaminationBatchDetailResponseSchema.parse(response.data))
}

export async function deleteHealthExaminationBatch(
  request: DeleteHealthExaminationBatchRequest
): Promise<void> {
  await apiClient.delete<void>(
    `${batchItemEndpoint(request.organizationId, request.batchId)}?rowVersion=${encodeURIComponent(
      String(request.rowVersion)
    )}`
  )
}

export function fetchHealthExaminationBatchMatrix(
  batchId: string,
  params?: ExaminationProgressFilterParams
): Promise<ExaminationProgressResponse> {
  void batchId
  void params
  return unavailableApi("tiến độ khám")
}

export function fetchHealthExaminationBatchReport(
  batchId: string
): Promise<HealthExaminationBatchReportSummary> {
  void batchId
  return unavailableApi("báo cáo đợt khám")
}

export function fetchExaminationDetailExportData(batchId: string): Promise<unknown> {
  void batchId
  return unavailableApi("xuất tiến độ khám")
}

export function fetchExaminationSummaryExportData(batchId: string): Promise<unknown> {
  void batchId
  return unavailableApi("xuất báo cáo đợt khám")
}

export * from "./participants"
export * from "./examination-details"
export * from "./reports"
