import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"
import { apiClient } from "@/shared/api/api-client"
import type {
  CreateHealthExaminationBatchRequest,
  ExaminationProgressFilterParams,
  ExaminationProgressResponse,
  HealthExaminationBatch,
  HealthExaminationBatchFilterParams,
  HealthExaminationBatchListResponse,
  HealthExaminationBatchSummary,
  HealthExaminationBatchReportSummary,
  ClinicalService,
} from "../types"
import type {
  ExportDetailMatrixData,
  ExportSummaryData,
} from "../utils/export-excel"
import {
  healthExaminationBatchDetailResponseSchema,
  healthExaminationBatchPageResponseSchema,
  type HealthExaminationBatchConfigurationRequestDto,
  type HealthExaminationBatchDetailResponseDto,
  type HealthExaminationBatchSummaryResponseDto,
  type PageResponse,
} from "../types/transport"

const ORGANIZATIONS_ENDPOINT = "/api/v1/organizations"

function batchEndpoint(organizationId: string) {
  return `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(organizationId)}/health-examination-batches`
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
  }
}

function mapBatch(
  batch: HealthExaminationBatchDetailResponseDto
): HealthExaminationBatch {
  return {
    ...mapBatchSummary(batch, batch.organizationId),
    reason: batch.reason,
    payerType: batch.payerType,
    examinationSiteType: batch.examinationSiteType,
    examinationSiteName: batch.examinationSiteName,
    examinationSiteAddress: batch.examinationSiteAddress,
    masterTemplateVersionId: batch.masterTemplateVersionId,
    finalizedAt: batch.finalizedAt,
    closedAt: batch.closedAt,
    createdBy: batch.createdBy,
    services: batch.services.map((service) => ({
      serviceId: service.serviceId,
      name: service.serviceName,
      unitPrice: service.negotiatedUnitPrice,
    })),
  }
}

export async function fetchHealthExaminationBatchesByOrganization(
  organizationId: string,
  params?: HealthExaminationBatchFilterParams
): Promise<HealthExaminationBatchListResponse> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 1),
    size: String(params?.pageSize ?? 10),
    sortKey: params?.sortKey ?? "id",
    sortBy: params?.sortBy ?? "ASC",
    ...(params?.search?.trim() ? { searchKey: params.search.trim() } : {}),
  })
  const response = await apiClient.get<PageResponse<HealthExaminationBatchSummaryResponseDto>>(
    `${batchEndpoint(organizationId)}?${query}`
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
  batchId: string
): Promise<HealthExaminationBatch> {
  const response = await apiClient.get<HealthExaminationBatchDetailResponseDto>(
    `${batchEndpoint(organizationId)}/${encodeURIComponent(batchId)}`
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi chi tiết đợt khám không có dữ liệu.")
  }

  return mapBatch(healthExaminationBatchDetailResponseSchema.parse(response.data))
}

export async function createHealthExaminationBatch(
  request: CreateHealthExaminationBatchRequest
): Promise<HealthExaminationBatch> {
  const { organizationId, services, ...values } = request
  const body: HealthExaminationBatchConfigurationRequestDto = {
    batchCode: values.batchCode,
    batchName: values.batchName,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
    reason: values.reason?.trim() || null,
    payerType: values.payerType?.trim() || null,
    examinationSiteType: values.examinationSiteType,
    examinationSiteName: values.examinationSiteName,
    examinationSiteAddress: values.examinationSiteAddress?.trim() || null,
    services,
  }
  const response = await apiClient.post<
    HealthExaminationBatchConfigurationRequestDto,
    HealthExaminationBatchDetailResponseDto
  >(`${batchEndpoint(organizationId)}`, body)
  if (!response.data) {
    throw new Error(response.message || "Phản hồi tạo đợt khám không có dữ liệu.")
  }

  return mapBatch(healthExaminationBatchDetailResponseSchema.parse(response.data))
}

export function fetchClinicalServiceCatalog(): Promise<ClinicalService[]> {
  return unavailableDevelopmentApi("danh mục dịch vụ khám")
}

export function fetchHealthExaminationBatchMatrix(
  batchId: string,
  params?: ExaminationProgressFilterParams
): Promise<ExaminationProgressResponse> {
  void batchId
  void params
  return unavailableDevelopmentApi("tiến độ khám")
}

export function fetchHealthExaminationBatchReport(
  batchId: string
): Promise<HealthExaminationBatchReportSummary> {
  void batchId
  return unavailableDevelopmentApi("báo cáo đợt khám")
}

export function fetchExaminationDetailExportData(
  batchId: string
): Promise<ExportDetailMatrixData> {
  void batchId
  return unavailableDevelopmentApi("xuất tiến độ khám")
}

export function fetchExaminationSummaryExportData(
  batchId: string
): Promise<ExportSummaryData> {
  void batchId
  return unavailableDevelopmentApi("xuất báo cáo đợt khám")
}

export * from "./participants"
