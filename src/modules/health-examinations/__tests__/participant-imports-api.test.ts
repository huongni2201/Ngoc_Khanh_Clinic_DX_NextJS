import { beforeEach, describe, expect, it, vi } from "vitest"

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  getBlob: vi.fn(),
}))

vi.mock("@/shared/api/api-client", () => ({ apiClient: api }))

import {
  buildParticipantImportTemplateUrl,
  cancelParticipantImport,
  confirmParticipantImport,
  fetchParticipantImportRows,
  uploadParticipantImport,
  validateParticipantImport,
} from "../api/participant-imports"

describe("participant roster import API", () => {
  beforeEach(() => vi.clearAllMocks())

  it("uses the batch-scoped template route", () => {
    expect(buildParticipantImportTemplateUrl("org/1", "batch 2")).toBe(
      "/api/v1/organizations/org%2F1/health-examination-batches/batch%202/employees/import-template"
    )
  })

  it("uploads an Excel file as multipart form data", async () => {
    const file = new File(["xlsx"], "roster.xls")
    api.post.mockResolvedValue({ result: "OK", code: 201, data: { importId: "job-1" } })

    await uploadParticipantImport("org-1", "batch-1", file)

    const [path, body] = api.post.mock.calls[0]
    expect(path).toBe("/api/v1/organizations/org-1/health-examination-batches/batch-1/employee-imports")
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get("file")).toBe(file)
  })

  it("sends the selected mapping and requests a bounded row page", async () => {
    const summary = { importId: "job-1", status: "VALIDATED", totalRows: 1 }
    api.put.mockResolvedValue({ result: "OK", code: 200, data: summary })
    api.get.mockResolvedValue({ result: "OK", code: 200, data: { rows: [] } })
    const mapping = {
      FULL_NAME: 1,
      SEX: 2,
      DATE_OF_BIRTH: 3,
      IDENTIFICATION_NUMBER: 5,
    } as const

    await validateParticipantImport("org-1", "batch-1", "job-1", mapping)
    await fetchParticipantImportRows("org-1", "batch-1", "job-1", {
      page: 2,
      size: 50,
      status: "INVALID",
    })

    expect(api.put).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/employee-imports/job-1/mapping",
      { columns: mapping }
    )
    expect(api.get).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/employee-imports/job-1/rows?page=2&size=50&status=INVALID"
    )
  })

  it("confirms and cancels at the import resource", async () => {
    api.post.mockResolvedValue({ result: "OK", code: 200, data: { status: "CONFIRMED" } })
    api.delete.mockResolvedValue({ result: "OK", code: 200, data: { status: "CANCELED" } })

    await confirmParticipantImport("org-1", "batch-1", "job-1")
    await cancelParticipantImport("org-1", "batch-1", "job-1")

    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/employee-imports/job-1/confirm",
      undefined
    )
    expect(api.delete).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/employee-imports/job-1"
    )
  })
})
