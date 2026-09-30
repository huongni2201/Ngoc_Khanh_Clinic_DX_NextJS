import { apiClient, type ApiResponse } from "@/shared/api/api-client"

export type ParticipantImportField =
  | "FULL_NAME"
  | "SEX"
  | "DATE_OF_BIRTH"
  | "IDENTIFICATION_NUMBER"
  | "PHONE"
  | "IDENTIFICATION_NUMBER_ISSUE_DATE"
  | "IDENTIFICATION_NUMBER_ISSUE_PLACE"
  | "ETHNICITY"
  | "SUBJECT_TYPE"
  | "BLOOD_GROUP"
  | "OCCUPATION"
  | "WORKPLACE_OR_SCHOOL"
  | "ADDRESS_DETAIL"
  | "PAYER_SOURCE"
  | "ROSTER_NOTE"

export type ParticipantImportMapping = Partial<Record<ParticipantImportField, number>>

export interface ParticipantImportUploadResponse {
  importId: string
  status: string
  headerRowNumber: number
  headers: string[]
  suggestedMapping: ParticipantImportMapping
}

export interface ParticipantImportSummary {
  importId: string
  status: string
  totalRows: number
  validRows: number
  warningRows: number
  errorRows: number
  confirmAllowed: boolean
  columnMapping: ParticipantImportMapping
  headers: string[]
}

export interface ParticipantImportRowError {
  field: string
  code: string
  message: string
}

export interface ParticipantImportRow {
  rowNumber: number
  fullName: string | null
  dateOfBirth: string | null
  sex: string | null
  maskedIdentificationNumber: string | null
  phone: string | null
  rosterNote: string | null
  action: "CREATE" | "UPDATE" | "UNCHANGED" | null
  errors: ParticipantImportRowError[]
  warnings: string[]
}

export interface ParticipantImportRowsPage {
  importId: string
  page: number
  size: number
  totalRows: number
  rows: ParticipantImportRow[]
}

export interface ParticipantImportConfirmResponse {
  importId: string
  status: "CONFIRMED"
  importedRows: number
  createdRows: number
  updatedRows: number
  unchangedRows: number
}

function batchPath(organizationId: string, batchId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/health-examination-batches/${encodeURIComponent(batchId)}`
}

function importPath(organizationId: string, batchId: string, importId: string) {
  return `${batchPath(organizationId, batchId)}/employee-imports/${encodeURIComponent(importId)}`
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.data) throw new Error(response.message || "Phản hồi import không có dữ liệu.")
  return response.data
}

export function buildParticipantImportTemplateUrl(organizationId: string, batchId: string) {
  return `${batchPath(organizationId, batchId)}/employees/import-template`
}

export async function downloadParticipantImportTemplate(organizationId: string, batchId: string) {
  const { blob, filename } = await apiClient.getBlob(
    buildParticipantImportTemplateUrl(organizationId, batchId)
  )
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename || "employee-import-template.xlsx"
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function uploadParticipantImport(
  organizationId: string,
  batchId: string,
  file: File
) {
  const body = new FormData()
  body.append("file", file)
  const response = await apiClient.post<FormData, ParticipantImportUploadResponse>(
    `${batchPath(organizationId, batchId)}/employee-imports`,
    body
  )
  return unwrap(response)
}

export async function validateParticipantImport(
  organizationId: string,
  batchId: string,
  importId: string,
  columns: ParticipantImportMapping
) {
  const response = await apiClient.put<{ columns: ParticipantImportMapping }, ParticipantImportSummary>(
    `${importPath(organizationId, batchId, importId)}/mapping`,
    { columns }
  )
  return unwrap(response)
}

export async function fetchParticipantImport(
  organizationId: string,
  batchId: string,
  importId: string
) {
  const response = await apiClient.get<ParticipantImportSummary>(
    importPath(organizationId, batchId, importId)
  )
  return unwrap(response)
}

export async function fetchParticipantImportRows(
  organizationId: string,
  batchId: string,
  importId: string,
  params: { page?: number; size?: number; status?: string } = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.size ?? 50),
    status: params.status ?? "ALL",
  })
  const response = await apiClient.get<ParticipantImportRowsPage>(
    `${importPath(organizationId, batchId, importId)}/rows?${query.toString()}`
  )
  return unwrap(response)
}

export async function confirmParticipantImport(
  organizationId: string,
  batchId: string,
  importId: string
) {
  const response = await apiClient.post<undefined, ParticipantImportConfirmResponse>(
    `${importPath(organizationId, batchId, importId)}/confirm`,
    undefined
  )
  return unwrap(response)
}

export async function cancelParticipantImport(
  organizationId: string,
  batchId: string,
  importId: string
) {
  const response = await apiClient.delete<ParticipantImportSummary>(
    importPath(organizationId, batchId, importId)
  )
  return unwrap(response)
}
