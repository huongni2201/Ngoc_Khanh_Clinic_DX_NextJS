import { afterEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import {
  buildExaminationDetailExportUrl,
  buildExaminationDetailImportUrl,
  buildExaminationDetailListUrl,
  buildExaminationSummaryUrl,
  downloadExaminationDetailExport,
  fetchExaminationDetails,
  fetchExaminationSummary,
  importExaminationDetails,
} from "../api/examination-details"

const BASE = "/api/v1/organizations/org-1/health-examination-batches/batch-1/examination-details"

const backendRow = {
  id: "p-1",
  participantCode: "NV001",
  fullName: "Nguyễn Văn A",
  identificationNumberMasked: "********8901",
  departmentName: "Khối Công nghệ",
  positionName: "Kỹ sư",
  examinationDate: "2026-10-20",
  attendanceStatus: "ATTENDED",
  actualExaminationDate: "2026-10-20",
  reconciliationStatus: "RECONCILED",
  performedBatchServiceIds: ["s1", "s2"],
  rowVersion: 3,
}

afterEach(() => vi.restoreAllMocks())

describe("examination detail URLs", () => {
  it("builds the list URL with paging, search and sorting", () => {
    expect(
      buildExaminationDetailListUrl("org-1", "batch-1", {
        search: "  Nguyễn ",
        page: 2,
        pageSize: 10,
        sortKey: "fullName",
        sortBy: "DESC",
      })
    ).toBe(`${BASE}?page=2&size=10&sortKey=fullName&sortBy=DESC&searchKey=Nguy%E1%BB%85n`)
  })

  it("defaults to the first page sorted by id and omits an empty search", () => {
    expect(buildExaminationDetailListUrl("org-1", "batch-1", { search: "  " })).toBe(
      `${BASE}?page=1&size=10&sortKey=id&sortBy=ASC`
    )
  })

  it.each([
    ["UNCONFIRMED", "attendanceStatus=UNCONFIRMED"],
    ["ABSENT", "attendanceStatus=ABSENT"],
    ["ATTENDED_PENDING", "attendanceStatus=ATTENDED&reconciliationStatus=PENDING"],
    ["RECONCILED", "reconciliationStatus=RECONCILED"],
  ] as const)("maps the %s screen status to backend filters", (statusFilter, expected) => {
    expect(buildExaminationDetailListUrl("org-1", "batch-1", { statusFilter })).toBe(
      `${BASE}?page=1&size=10&sortKey=id&sortBy=ASC&${expected}`
    )
  })

  it("builds the summary, export and import URLs and encodes identifiers", () => {
    expect(buildExaminationSummaryUrl("org-1", "batch-1")).toBe(`${BASE}/summary`)
    expect(buildExaminationDetailExportUrl("org-1", "batch-1")).toBe(`${BASE}/export`)
    expect(buildExaminationDetailImportUrl("org-1", "batch-1")).toBe(`${BASE}/imports`)
    expect(buildExaminationDetailImportUrl("a/b", "c d")).toContain("organizations/a%2Fb/")
  })
})

describe("fetchExaminationDetails", () => {
  it("parses the page, maps nulls to undefined and keeps the CCCD masked", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: {
        items: [{ ...backendRow, participantCode: null, actualExaminationDate: null }],
        page: 1,
        size: 10,
        totalElements: 11,
        totalPages: 2,
      },
    })

    const result = await fetchExaminationDetails("org-1", "batch-1", { page: 1 })

    expect(get).toHaveBeenCalledWith(expect.stringContaining(BASE), { signal: undefined })
    expect(result).toMatchObject({ total: 11, page: 1, pageSize: 10, totalPages: 2 })
    expect(result.data[0]).toMatchObject({
      id: "p-1",
      participantCode: undefined,
      actualExaminationDate: undefined,
      identificationNumberMasked: "********8901",
      performedBatchServiceIds: ["s1", "s2"],
    })
    expect(result.data[0]).not.toHaveProperty("identificationNumber")
  })

  it("rejects an unknown status instead of rendering it", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: {
        items: [{ ...backendRow, attendanceStatus: "LATE" }],
        page: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    })

    await expect(fetchExaminationDetails("org-1", "batch-1")).rejects.toBeInstanceOf(ZodError)
  })

  it("fails when the envelope has no data", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200, message: "", data: null })
    await expect(fetchExaminationDetails("org-1", "batch-1")).rejects.toThrow()
  })
})

describe("fetchExaminationSummary", () => {
  it("parses the counters", async () => {
    const summary = {
      registered: 120,
      unconfirmed: 10,
      attended: 105,
      absent: 5,
      reconciled: 100,
      pendingReconciliation: 5,
    }
    vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: summary,
    })

    await expect(fetchExaminationSummary("org-1", "batch-1")).resolves.toEqual(summary)
  })

  it("rejects negative counters", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: { registered: -1, unconfirmed: 0, attended: 0, absent: 0, reconciled: 0, pendingReconciliation: 0 },
    })

    await expect(fetchExaminationSummary("org-1", "batch-1")).rejects.toBeInstanceOf(ZodError)
  })
})

describe("downloadExaminationDetailExport", () => {
  it("uses the file name the backend sent", async () => {
    const blob = new Blob(["xlsx"])
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob, filename: "chi-tiet-kham-DK001.xlsx" })

    const file = await downloadExaminationDetailExport("org-1", "batch-1")

    expect(getBlob).toHaveBeenCalledWith(`${BASE}/export`, { signal: undefined })
    expect(file).toEqual({ blob, fileName: "chi-tiet-kham-DK001.xlsx" })
  })

  it("falls back to a default file name", async () => {
    vi.spyOn(apiClient, "getBlob").mockResolvedValue({ blob: new Blob(["x"]) })
    await expect(downloadExaminationDetailExport("org-1", "batch-1")).resolves.toMatchObject({
      fileName: "chi-tiet-kham.xlsx",
    })
  })
})

describe("importExaminationDetails", () => {
  const file = new File(["data"], "chi-tiet-kham.xlsx")
  const result = {
    importJobId: "job-1",
    batchId: "batch-1",
    totalRows: 3,
    updatedParticipants: 2,
    unchangedParticipants: 1,
    performedItems: 5,
    completedAt: "2026-10-07T03:00:00Z",
  }

  it("sends only the file as multipart with the Idempotency-Key header and parses the result", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 201, message: "ok", data: result })

    const imported = await importExaminationDetails({
      organizationId: "org-1",
      batchId: "batch-1",
      file,
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
    })

    expect(imported).toEqual(result)
    const [url, body, options] = post.mock.calls[0]
    expect(url).toBe(`${BASE}/imports`)
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get("file")).toBeInstanceOf(File)
    expect([...(body as FormData).keys()]).toEqual(["file"])
    expect(options).toEqual({
      headers: { "Idempotency-Key": "11111111-1111-4111-8111-111111111111" },
    })
  })

  it("propagates a backend rejection unchanged", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 409, 409, "Row 5: participant is cancelled")
    )
    await expect(
      importExaminationDetails({ organizationId: "org-1", batchId: "batch-1", file, idempotencyKey: "k" })
    ).rejects.toMatchObject({ status: 409 })
  })
})
