import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { buildParticipantListUrl } from "../api/participants"
import {
  buildExaminationFormPrintJobsUrl,
  buildExaminationFormUrl,
  createExaminationFormPrintJob,
  EXAMINATION_FORM_RENDER_TIMEOUT_MS,
  fetchExaminationForm,
  fetchPrintableParticipants,
} from "../api/examination-forms"

const PARTICIPANTS = "/api/v1/organizations/org-1/health-examination-batches/batch-1/participants"

function item(index: number) {
  return {
    id: `p-${index}`,
    batchId: "batch-1",
    batchDayId: "day-1",
    examinationDate: "2026-10-20",
    participantCode: `KSK-2026-001-${String(index).padStart(4, "0")}`,
    fullName: `Người khám ${index}`,
    dateOfBirth: "1990-03-14",
    sex: "MALE",
    identificationNumberMasked: "********8901",
    departmentName: "Kho vận",
    positionName: "Nhân viên",
    rosterStatus: "ACTIVE",
    attendanceStatus: "UNCONFIRMED",
    reconciliationStatus: "PENDING",
    actualExaminationDate: null,
    preparedAt: null,
    rowVersion: 0,
  }
}

function page(items: unknown[], pageNumber: number, totalElements: number) {
  return {
    result: "OK" as const,
    code: 200,
    data: {
      items,
      page: pageNumber,
      size: 100,
      totalElements,
      totalPages: Math.max(1, Math.ceil(totalElements / 100)),
    },
  }
}

afterEach(() => vi.restoreAllMocks())

describe("examination form API", () => {
  it("builds the single form and the print job URLs as the backend maps them", () => {
    expect(buildExaminationFormUrl("org-1", "batch-1", "p-1")).toBe(
      `${PARTICIPANTS}/p-1/examination-form`
    )
    expect(buildExaminationFormPrintJobsUrl("org-1", "batch-1")).toBe(
      `${PARTICIPANTS}/examination-form-print-jobs`
    )
    expect(buildExaminationFormUrl("a/b", "batch-1", "p 1")).toContain("organizations/a%2Fb/")
  })

  it("sends the batch day filter of the Participant list", () => {
    expect(buildParticipantListUrl("org-1", "batch-1", { batchDayId: "day-2" })).toContain(
      "batchDayId=day-2"
    )
    expect(buildParticipantListUrl("org-1", "batch-1", {})).not.toContain("batchDayId")
  })

  it("requests one form as a PDF with the render timeout and keeps the backend file name", async () => {
    const blob = new Blob(["%PDF"], { type: "application/pdf" })
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob, filename: "phieu-kham-KSK-2026-001-0001.pdf" })

    const file = await fetchExaminationForm("org-1", "batch-1", "p-1")

    expect(getBlob).toHaveBeenCalledWith(`${PARTICIPANTS}/p-1/examination-form`, {
      signal: undefined,
      timeoutMs: EXAMINATION_FORM_RENDER_TIMEOUT_MS,
    })
    expect(file.fileName).toBe("phieu-kham-KSK-2026-001-0001.pdf")
  })

  it("queues a print job with the Idempotency-Key header and the ids in print order", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 202, data: { jobId: "job-1" } })

    const job = await createExaminationFormPrintJob({
      organizationId: "org-1",
      batchId: "batch-1",
      participantIds: ["p-2", "p-1"],
      idempotencyKey: "key-1",
    })

    expect(post).toHaveBeenCalledWith(
      `${PARTICIPANTS}/examination-form-print-jobs`,
      { participantIds: ["p-2", "p-1"] },
      { headers: { "Idempotency-Key": "key-1" } }
    )
    expect(job).toEqual({ jobId: "job-1" })
  })

  it("asks the backend to print a whole examination day without sending any Participant", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 202, data: { jobId: "job-2" } })

    const job = await createExaminationFormPrintJob({
      scope: "BATCH_DAY",
      organizationId: "org-1",
      batchId: "batch-1",
      batchDayId: "day-1",
      includeAttended: true,
      sort: "IMPORT_ORDER",
      idempotencyKey: "key-2",
    })

    expect(post).toHaveBeenCalledWith(
      `${PARTICIPANTS}/examination-form-print-jobs`,
      { scope: "BATCH_DAY", batchDayId: "day-1", includeAttended: true, sort: "IMPORT_ORDER" },
      { headers: { "Idempotency-Key": "key-2" } }
    )
    expect(job).toEqual({ jobId: "job-2" })
  })

  it("collects every active Participant matching the filter, page by page", async () => {
    const first = Array.from({ length: 100 }, (_, index) => item(index + 1))
    const get = vi
      .spyOn(apiClient, "get")
      .mockResolvedValueOnce(page(first, 1, 150))
      .mockResolvedValueOnce(page([item(101), item(1)], 2, 150))

    const result = await fetchPrintableParticipants("org-1", "batch-1", {
      search: "Kho",
      batchDayId: "day-1",
      sortKey: "participantCode",
      sortBy: "ASC",
    })

    expect(get).toHaveBeenCalledTimes(2)
    const firstUrl = new URL(get.mock.calls[0][0], "http://local")
    expect(firstUrl.searchParams.get("rosterStatus")).toBe("ACTIVE")
    expect(firstUrl.searchParams.get("size")).toBe("100")
    expect(firstUrl.searchParams.get("batchDayId")).toBe("day-1")
    expect(firstUrl.searchParams.get("searchKey")).toBe("Kho")
    expect(new URL(get.mock.calls[1][0], "http://local").searchParams.get("page")).toBe("2")
    // A row repeated across pages is kept once.
    expect(result.entries).toHaveLength(101)
    expect(result.entries[0]).toEqual({
      id: "p-1",
      participantCode: "KSK-2026-001-0001",
      fullName: "Người khám 1",
      departmentName: "Kho vận",
    })
    expect(result.tooMany).toBe(false)
  })

  it("stops after the first page when more Participants match than one job may hold", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)], 1, 1001))

    const result = await fetchPrintableParticipants("org-1", "batch-1", {})

    expect(get).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ entries: [], total: 1001, tooMany: true })
  })
})
