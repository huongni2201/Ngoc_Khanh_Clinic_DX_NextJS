import { parseApiData } from "@/shared/api/parse-api-data"
import { apiClient } from "@/shared/api/api-client"
import type {
  DownloadedFile,
  ExaminationDetailImportResult,
  ExaminationDetailListFilterParams,
  ExaminationDetailListResponse,
  ExaminationDetailRow,
  ExaminationStatusFilter,
  ExaminationSummary,
  ImportExaminationDetailsRequest,
  RecordExaminationDetailRequest,
} from "../types"
import {
  examinationDetailImportResponseSchema,
  examinationDetailRowResponseSchema,
  examinationDetailPageResponseSchema,
  examinationSummaryResponseSchema,
  type ExaminationDetailRowResponseDto,
} from "../types/transport"

export const EXAMINATION_DETAIL_IMPORT_MAX_BYTES = 5 * 1024 * 1024
export const EXAMINATION_DETAIL_EXPORT_FALLBACK_FILE_NAME = "chi-tiet-kham.xlsx"
export const EXAMINATION_DETAIL_TEMPLATE_FALLBACK_FILE_NAME = "mau-nhap-chi-tiet-kham.xlsx"

/**
 * A screen status is two backend filters: the backend has no combined status and the frontend must
 * not invent one. "Chưa đến" and "Không đến" are attendance values derived from the session
 * assignments; "Đã đến - chờ đối soát" needs both.
 */
export const EXAMINATION_STATUS_FILTERS: Record<
  ExaminationStatusFilter,
  { attendanceStatus?: string; reconciliationStatus?: string }
> = {
  UNCONFIRMED: { attendanceStatus: "UNCONFIRMED" },
  NO_SHOW: { attendanceStatus: "NO_SHOW" },
  ATTENDED_PENDING: { attendanceStatus: "ATTENDED", reconciliationStatus: "PENDING" },
  RECONCILED: { reconciliationStatus: "RECONCILED" },
}

function agreementEndpoint(organizationId: string, agreementId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/agreements/${encodeURIComponent(agreementId)}`
}

function detailsEndpoint(organizationId: string, agreementId: string) {
  return `${agreementEndpoint(organizationId, agreementId)}/examination-details`
}

export function buildExaminationDetailListUrl(
  organizationId: string,
  agreementId: string,
  params: ExaminationDetailListFilterParams = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 10),
    sortKey: params.sortKey ?? "id",
    sortBy: params.sortBy ?? "ASC",
  })
  const search = params.search?.trim()
  if (search) query.set("searchKey", search)
  if (params.statusFilter) {
    const filter = EXAMINATION_STATUS_FILTERS[params.statusFilter]
    if (filter.attendanceStatus) query.set("attendanceStatus", filter.attendanceStatus)
    if (filter.reconciliationStatus) query.set("reconciliationStatus", filter.reconciliationStatus)
  }

  return `${detailsEndpoint(organizationId, agreementId)}?${query.toString()}`
}

export function buildExaminationSummaryUrl(organizationId: string, agreementId: string) {
  return `${detailsEndpoint(organizationId, agreementId)}/summary`
}

export function buildExaminationDetailExportUrl(organizationId: string, agreementId: string) {
  return `${detailsEndpoint(organizationId, agreementId)}/export`
}

export function buildExaminationDetailTemplateUrl(organizationId: string, agreementId: string) {
  return `${detailsEndpoint(organizationId, agreementId)}/import-template`
}

export function buildExaminationDetailRecordUrl(
  organizationId: string,
  agreementId: string,
  participantId: string
) {
  return `${detailsEndpoint(organizationId, agreementId)}/${encodeURIComponent(participantId)}`
}

export function buildExaminationDetailImportUrl(organizationId: string, agreementId: string) {
  return `${detailsEndpoint(organizationId, agreementId)}/imports`
}

function mapRow(row: ExaminationDetailRowResponseDto): ExaminationDetailRow {
  return {
    id: row.id,
    participantCode: row.participantCode ?? undefined,
    fullName: row.fullName,
    identificationNumberMasked: row.identificationNumberMasked,
    departmentName: row.departmentName,
    positionName: row.positionName,
    nextSessionDate: row.nextSessionDate ?? undefined,
    attendanceStatus: row.attendanceStatus,
    lastAttendedDate: row.lastAttendedDate ?? undefined,
    reconciliationStatus: row.reconciliationStatus,
    performedAgreementServiceIds: row.performedAgreementServiceIds,
    rowVersion: row.rowVersion,
  }
}

export async function fetchExaminationDetails(
  organizationId: string,
  agreementId: string,
  params?: ExaminationDetailListFilterParams,
  signal?: AbortSignal
): Promise<ExaminationDetailListResponse> {
  const response = await apiClient.get<unknown>(
    buildExaminationDetailListUrl(organizationId, agreementId, params),
    { signal }
  )
  if (!response.data) {
    throw new Error("Phản hồi chi tiết khám không có dữ liệu.")
  }

  const page = parseApiData(examinationDetailPageResponseSchema, response.data)
  return {
    data: page.items.map(mapRow),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export async function fetchExaminationSummary(
  organizationId: string,
  agreementId: string,
  signal?: AbortSignal
): Promise<ExaminationSummary> {
  const response = await apiClient.get<unknown>(buildExaminationSummaryUrl(organizationId, agreementId), {
    signal,
  })
  if (!response.data) {
    throw new Error("Phản hồi số liệu chi tiết khám không có dữ liệu.")
  }

  return parseApiData(examinationSummaryResponseSchema, response.data)
}

/**
 * The workbook of the whole active roster. It is also the import template: its hidden columns hold
 * the Participant ids and versions the import matches on.
 */
export async function downloadExaminationDetailExport(
  organizationId: string,
  agreementId: string,
  signal?: AbortSignal
): Promise<DownloadedFile> {
  const { blob, filename } = await apiClient.getBlob(
    buildExaminationDetailExportUrl(organizationId, agreementId),
    { signal }
  )
  return { blob, fileName: filename?.trim() || EXAMINATION_DETAIL_EXPORT_FALLBACK_FILE_NAME }
}

/**
 * The import template: the same workbook as the export, pre-filled with the roster and the
 * services already recorded (a blank cell means "not examined", so an empty file would erase
 * data). It has its own permission so a role that may import can fetch it.
 */
export async function downloadExaminationDetailTemplate(
  organizationId: string,
  agreementId: string,
  signal?: AbortSignal
): Promise<DownloadedFile> {
  const { blob, filename } = await apiClient.getBlob(
    buildExaminationDetailTemplateUrl(organizationId, agreementId),
    { signal }
  )
  return { blob, fileName: filename?.trim() || EXAMINATION_DETAIL_TEMPLATE_FALLBACK_FILE_NAME }
}

/**
 * Records the performed services of one Participant (attendance is recorded on the session
 * assignments). The backend answers with the row as stored afterwards, so the screen can replace it
 * without refetching the page.
 */
export async function recordExaminationDetail(
  request: RecordExaminationDetailRequest
): Promise<ExaminationDetailRow> {
  const response = await apiClient.put<unknown, unknown>(
    buildExaminationDetailRecordUrl(request.organizationId, request.agreementId, request.participantId),
    {
      performedAgreementServiceIds: request.performedAgreementServiceIds,
      rowVersion: request.rowVersion,
    }
  )
  if (!response.data) {
    throw new Error("Phản hồi cập nhật chi tiết khám không có dữ liệu.")
  }

  return mapRow(parseApiData(examinationDetailRowResponseSchema, response.data))
}

/**
 * Uploads the exported workbook as multipart form data. The import is all-or-nothing and
 * idempotent: a retry with the same `idempotencyKey` returns the stored result instead of writing
 * twice.
 */
export async function importExaminationDetails(
  request: ImportExaminationDetailsRequest
): Promise<ExaminationDetailImportResult> {
  const body = new FormData()
  body.append("file", request.file, request.file.name)

  const response = await apiClient.post<FormData, unknown>(
    buildExaminationDetailImportUrl(request.organizationId, request.agreementId),
    body,
    { headers: { "Idempotency-Key": request.idempotencyKey } }
  )
  if (!response.data) {
    throw new Error("Phản hồi nhập chi tiết khám không có dữ liệu.")
  }

  return parseApiData(examinationDetailImportResponseSchema, response.data)
}
