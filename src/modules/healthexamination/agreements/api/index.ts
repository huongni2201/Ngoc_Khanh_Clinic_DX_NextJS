import { parseApiData } from "@/shared/api/parse-api-data"
import { unavailableApi } from "@/shared/api/api-unavailable"
import { apiClient } from "@/shared/api/api-client"
import type {
  ActivateHealthExaminationAgreementRequest,
  CreateHealthExaminationAgreementRequest,
  DeleteHealthExaminationAgreementRequest,
  EndHealthExaminationAgreementRequest,
  ExaminationProgressFilterParams,
  ExaminationProgressResponse,
  HealthExaminationAgreement,
  HealthExaminationAgreementFilterParams,
  HealthExaminationAgreementListResponse,
  HealthExaminationAgreementReportSummary,
  HealthExaminationAgreementSummary,
  UpdateHealthExaminationAgreementRequest,
} from "../types"
import {
  healthExaminationAgreementDetailResponseSchema,
  healthExaminationAgreementPageResponseSchema,
  type HealthExaminationAgreementCreateRequestDto,
  type HealthExaminationAgreementDetailResponseDto,
  type HealthExaminationAgreementSummaryResponseDto,
  type HealthExaminationAgreementUpdateRequestDto,
  type HealthExaminationAgreementVersionRequestDto,
} from "../types/transport"
import { normalizeAgreementFilterParams } from "../utils/agreement-list-params"

const ORGANIZATIONS_ENDPOINT = "/api/v1/organizations"

function agreementEndpoint(organizationId: string) {
  return `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(organizationId)}/agreements`
}

function agreementItemEndpoint(organizationId: string, agreementId: string) {
  return `${agreementEndpoint(organizationId)}/${encodeURIComponent(agreementId)}`
}

function mapAgreementSummary(
  agreement: HealthExaminationAgreementSummaryResponseDto,
  organizationId: string
): HealthExaminationAgreementSummary {
  return {
    id: agreement.id,
    organizationId,
    code: agreement.agreementCode,
    name: agreement.agreementName,
    validFrom: agreement.validFrom,
    validTo: agreement.validTo,
    status: agreement.status,
    createdAt: agreement.createdAt,
    updatedAt: agreement.updatedAt,
    rowVersion: agreement.rowVersion,
  }
}

function mapAgreement(
  agreement: HealthExaminationAgreementDetailResponseDto
): HealthExaminationAgreement {
  return {
    ...mapAgreementSummary(agreement, agreement.organizationId),
    createdBy: agreement.createdBy,
    services: [...agreement.services]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((service) => ({
        id: service.id,
        serviceId: service.serviceId,
        code: service.serviceCode ?? null,
        name: service.serviceName ?? null,
        referencePrice: service.referencePriceSnapshot,
        negotiatedPrice: service.negotiatedPrice,
        displayOrder: service.displayOrder,
        active: service.active,
        rowVersion: service.rowVersion,
      })),
  }
}

function toServicesBody(request: { services: { serviceId: string; negotiatedPrice: number }[] }) {
  return request.services.map((service) => ({
    serviceId: service.serviceId,
    negotiatedPrice: service.negotiatedPrice,
  }))
}

function toConfigurationBody(
  request: CreateHealthExaminationAgreementRequest
): HealthExaminationAgreementCreateRequestDto {
  return {
    agreementName: request.agreementName,
    validFrom: request.validFrom,
    validTo: request.validTo,
    services: toServicesBody(request),
  }
}

function parseAgreement(data: unknown, emptyMessage: string): HealthExaminationAgreement {
  if (!data) throw new Error(emptyMessage)
  return mapAgreement(parseApiData(healthExaminationAgreementDetailResponseSchema, data))
}

export async function fetchHealthExaminationAgreementsByOrganization(
  organizationId: string,
  params?: HealthExaminationAgreementFilterParams,
  signal?: AbortSignal
): Promise<HealthExaminationAgreementListResponse> {
  const normalized = normalizeAgreementFilterParams(params)
  const query = new URLSearchParams({
    page: String(normalized.page),
    size: String(normalized.pageSize),
    sortKey: normalized.sortKey,
    sortBy: normalized.sortBy,
    ...(normalized.search ? { searchKey: normalized.search } : {}),
  })
  const response = await apiClient.get<unknown>(
    `${agreementEndpoint(organizationId)}?${query}`,
    { signal }
  )
  if (!response.data) {
    throw new Error("Phản hồi danh sách thỏa thuận không có dữ liệu.")
  }

  const page = parseApiData(healthExaminationAgreementPageResponseSchema, response.data)
  return {
    data: page.items.map((agreement) => mapAgreementSummary(agreement, organizationId)),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export async function fetchHealthExaminationAgreementById(
  organizationId: string,
  agreementId: string,
  signal?: AbortSignal
): Promise<HealthExaminationAgreement> {
  const response = await apiClient.get<unknown>(
    agreementItemEndpoint(organizationId, agreementId),
    { signal }
  )
  return parseAgreement(response.data, "Phản hồi chi tiết thỏa thuận không có dữ liệu.")
}

export async function createHealthExaminationAgreement(
  request: CreateHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  const response = await apiClient.post<HealthExaminationAgreementCreateRequestDto, unknown>(
    agreementEndpoint(request.organizationId),
    toConfigurationBody(request)
  )
  return parseAgreement(response.data, "Phản hồi tạo thỏa thuận không có dữ liệu.")
}

export async function updateHealthExaminationAgreement(
  request: UpdateHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  const body: HealthExaminationAgreementUpdateRequestDto = {
    ...toConfigurationBody(request),
    rowVersion: request.rowVersion,
  }
  const response = await apiClient.put<HealthExaminationAgreementUpdateRequestDto, unknown>(
    agreementItemEndpoint(request.organizationId, request.agreementId),
    body
  )
  return parseAgreement(
    response.data,
    "Phản hồi cập nhật thỏa thuận không có dữ liệu."
  )
}

export async function deleteHealthExaminationAgreement(
  request: DeleteHealthExaminationAgreementRequest
): Promise<void> {
  await apiClient.delete<void>(
    `${agreementItemEndpoint(request.organizationId, request.agreementId)}?rowVersion=${encodeURIComponent(
      String(request.rowVersion)
    )}`
  )
}

export function buildHealthExaminationAgreementActivateUrl(
  organizationId: string,
  agreementId: string
) {
  return `${agreementItemEndpoint(organizationId, agreementId)}/activate`
}

export function buildHealthExaminationAgreementEndUrl(organizationId: string, agreementId: string) {
  return `${agreementItemEndpoint(organizationId, agreementId)}/end`
}

/**
 * Activates a draft agreement: DRAFT becomes ACTIVE. From then on its name, validity and service
 * lines are fixed and it cannot be deleted; Participants can still be changed and examination forms
 * can be printed. A stale `rowVersion` or an agreement that is no longer a draft is a 409.
 */
export async function activateHealthExaminationAgreement(
  request: ActivateHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  const response = await apiClient.post<HealthExaminationAgreementVersionRequestDto, unknown>(
    buildHealthExaminationAgreementActivateUrl(request.organizationId, request.agreementId),
    { rowVersion: request.rowVersion }
  )
  return parseAgreement(
    response.data,
    "Phản hồi kích hoạt thỏa thuận không có dữ liệu."
  )
}

/** Ends an active agreement: ACTIVE becomes ENDED and the agreement is read-only history. */
export async function endHealthExaminationAgreement(
  request: EndHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  const response = await apiClient.post<HealthExaminationAgreementVersionRequestDto, unknown>(
    buildHealthExaminationAgreementEndUrl(request.organizationId, request.agreementId),
    { rowVersion: request.rowVersion }
  )
  return parseAgreement(
    response.data,
    "Phản hồi kết thúc thỏa thuận không có dữ liệu."
  )
}

export function fetchHealthExaminationAgreementMatrix(
  agreementId: string,
  params?: ExaminationProgressFilterParams
): Promise<ExaminationProgressResponse> {
  void agreementId
  void params
  return unavailableApi("tiến độ khám")
}

export function fetchHealthExaminationAgreementReport(
  agreementId: string
): Promise<HealthExaminationAgreementReportSummary> {
  void agreementId
  return unavailableApi("báo cáo thỏa thuận")
}

export function fetchExaminationDetailExportData(agreementId: string): Promise<unknown> {
  void agreementId
  return unavailableApi("xuất tiến độ khám")
}

export function fetchExaminationSummaryExportData(agreementId: string): Promise<unknown> {
  void agreementId
  return unavailableApi("xuất báo cáo thỏa thuận")
}

export * from "./participants"
export * from "./examination-details"
export * from "./reports"
export * from "./examination-forms"
export * from "./sessions"
