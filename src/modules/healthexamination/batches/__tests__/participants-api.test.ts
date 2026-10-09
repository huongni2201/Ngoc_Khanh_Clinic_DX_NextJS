import { afterEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import {
  buildParticipantImportUrl,
  buildParticipantListUrl,
  buildParticipantTemplateUrl,
  fetchHealthExaminationBatchParticipants,
  fetchParticipantImportTemplate,
  importHealthExaminationBatchParticipants,
} from "../api/participants"

const BASE = "/api/v1/organizations/org-1/health-examination-batches/batch-1/participants"

const backendItem = {
  id: "p-1",
  batchId: "batch-1",
  batchDayId: "day-1",
  examinationDate: "2026-10-20",
  participantCode: "NV001",
  fullName: "Nguyễn Văn A",
  dateOfBirth: "1990-03-14",
  sex: "MALE",
  identificationNumberMasked: "********8901",
  departmentName: "Khối Công nghệ",
  positionName: "Kỹ sư",
  rosterStatus: "ACTIVE",
  attendanceStatus: "UNCONFIRMED",
  reconciliationStatus: "PENDING",
  actualExaminationDate: null,
  preparedAt: null,
  rowVersion: 0,
}

afterEach(() => vi.restoreAllMocks())

describe("participant URLs", () => {
  it("builds the list URL with 1-based paging, search, filters and sorting", () => {
    expect(
      buildParticipantListUrl("org-1", "batch-1", {
        search: "  Nguyễn ",
        rosterStatus: "ACTIVE",
        attendanceStatus: "ABSENT",
        page: 2,
        pageSize: 10,
        sortKey: "fullName",
        sortBy: "DESC",
      })
    ).toBe(
      `${BASE}?page=2&size=10&sortKey=fullName&sortBy=DESC&searchKey=Nguy%E1%BB%85n&rosterStatus=ACTIVE&attendanceStatus=ABSENT`
    )
  })

  it("defaults to the first page sorted by id and omits an empty search", () => {
    expect(buildParticipantListUrl("org-1", "batch-1", { search: "   " })).toBe(
      `${BASE}?page=1&size=10&sortKey=id&sortBy=ASC`
    )
  })

  it("builds the template and import URLs and encodes identifiers", () => {
    expect(buildParticipantTemplateUrl("org-1", "batch-1")).toBe(`${BASE}/import-template`)
    expect(buildParticipantImportUrl("org-1", "batch-1")).toBe(`${BASE}/imports`)
    expect(buildParticipantImportUrl("a/b", "c d")).toContain("organizations/a%2Fb/")
  })
})

describe("fetchHealthExaminationBatchParticipants", () => {
  it("parses the backend page and maps nulls to undefined, keeping the CCCD masked", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: { items: [backendItem], page: 1, size: 10, totalElements: 11, totalPages: 2 },
    })

    const result = await fetchHealthExaminationBatchParticipants("org-1", "batch-1", { page: 1 })

    expect(get).toHaveBeenCalledWith(expect.stringContaining(BASE), { signal: undefined })
    expect(result).toMatchObject({ total: 11, page: 1, pageSize: 10, totalPages: 2 })
    expect(result.data[0]).toMatchObject({
      id: "p-1",
      participantCode: "NV001",
      identificationNumberMasked: "********8901",
      actualExaminationDate: undefined,
      preparedAt: undefined,
    })
    expect(result.data[0]).not.toHaveProperty("identificationNumber")
  })

  it("rejects a response with an unknown enum value instead of rendering it", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: {
        items: [{ ...backendItem, rosterStatus: "DELETED" }],
        page: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    })

    await expect(fetchHealthExaminationBatchParticipants("org-1", "batch-1")).rejects.toBeInstanceOf(
      ZodError
    )
  })

  it("fails when the envelope has no data", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200, message: "", data: null })
    await expect(fetchHealthExaminationBatchParticipants("org-1", "batch-1")).rejects.toThrow()
  })
})

describe("fetchParticipantImportTemplate", () => {
  it("downloads the workbook as a blob with a default file name", async () => {
    const blob = new Blob(["xlsx"])
    const getBlob = vi.spyOn(apiClient, "getBlob").mockResolvedValue({ blob, filename: "x.xlsx" })

    const template = await fetchParticipantImportTemplate("org-1", "batch-1")

    expect(getBlob).toHaveBeenCalledWith(`${BASE}/import-template`, { signal: undefined })
    expect(template.blob).toBe(blob)
    expect(template.fileName).toBe("mau-nhap-nguoi-kham.xlsx")
  })
})

describe("importHealthExaminationBatchParticipants", () => {
  const file = new File(["data"], "nguoi-kham.xlsx")
  const result = {
    importJobId: "job-1",
    batchId: "batch-1",
    totalRows: 3,
    createdCount: 3,
    completedAt: "2026-10-06T10:00:00Z",
  }

  it("sends multipart file + rowVersion with the Idempotency-Key header and parses the result", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 201, message: "ok", data: result })

    const imported = await importHealthExaminationBatchParticipants({
      organizationId: "org-1",
      batchId: "batch-1",
      file,
      rowVersion: 4,
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
    })

    expect(imported).toEqual(result)
    const [url, body, options] = post.mock.calls[0]
    expect(url).toBe(`${BASE}/imports`)
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get("rowVersion")).toBe("4")
    expect((body as FormData).get("file")).toBeInstanceOf(File)
    expect(options).toEqual({
      headers: { "Idempotency-Key": "11111111-1111-4111-8111-111111111111" },
    })
  })

  it("propagates a backend rejection unchanged", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 400, 400, "Row 2: full_name is required")
    )
    await expect(
      importHealthExaminationBatchParticipants({
        organizationId: "org-1",
        batchId: "batch-1",
        file,
        rowVersion: 0,
        idempotencyKey: "k",
      })
    ).rejects.toMatchObject({ status: 400 })
  })
})
