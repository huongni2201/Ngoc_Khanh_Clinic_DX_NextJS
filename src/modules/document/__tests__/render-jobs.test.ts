import { afterEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { apiClient } from "@/shared/api/api-client"
import {
  buildRenderJobPartUrl,
  buildRenderJobUrl,
  downloadRenderJobPart,
  fetchRenderJob,
  RENDER_JOB_PART_DOWNLOAD_TIMEOUT_MS,
} from "../api/render-jobs"
import {
  describeRenderJobError,
  describeRenderJobSkipReason,
  isRenderJobActive,
  renderJobPartRanges,
} from "../utils/render-job-labels"

const job = {
  id: "job-1",
  documentType: "HEALTH_EXAM_PERIODIC_FORM_BLANK",
  status: "SUCCEEDED",
  totalCount: 402,
  processedCount: 402,
  errorCode: null,
  skipped: [{ id: "p-9", reason: "TOO_LONG" }],
  parts: [
    { partNo: 2, recordCount: 200, sizeBytes: 9_000_000 },
    { partNo: 1, recordCount: 200, sizeBytes: 9_100_000 },
    { partNo: 3, recordCount: 1, sizeBytes: 45_000 },
  ],
  createdAt: "2026-10-13T01:00:00Z",
  finishedAt: "2026-10-13T01:20:00Z",
  expiresAt: "2026-10-14T01:20:00Z",
}

afterEach(() => vi.restoreAllMocks())

describe("render job API", () => {
  it("builds the job and part URLs", () => {
    expect(buildRenderJobUrl("job-1")).toBe("/api/v1/document-render-jobs/job-1")
    expect(buildRenderJobPartUrl("job-1", 2)).toBe("/api/v1/document-render-jobs/job-1/parts/2")
    expect(buildRenderJobUrl("a/b")).toBe("/api/v1/document-render-jobs/a%2Fb")
  })

  it("parses a job, keeps the backend status and returns the parts in part order", async () => {
    const get = vi
      .spyOn(apiClient, "get")
      .mockResolvedValue({ result: "OK", code: 200, data: job })

    const result = await fetchRenderJob("job-1")

    expect(get).toHaveBeenCalledWith("/api/v1/document-render-jobs/job-1", { signal: undefined })
    expect(result.status).toBe("SUCCEEDED")
    expect(result.errorCode).toBeUndefined()
    expect(result.parts.map((part) => part.partNo)).toEqual([1, 2, 3])
    expect(result.skipped).toEqual([{ id: "p-9", reason: "TOO_LONG" }])
  })

  it("rejects a status the backend does not define", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      data: { ...job, status: "DONE" },
    })
    await expect(fetchRenderJob("job-1")).rejects.toMatchObject({
      message: "Dữ liệu phản hồi từ máy chủ không hợp lệ. Vui lòng tải lại hoặc liên hệ quản trị viên.",
      cause: expect.any(ZodError),
    })
  })

  it("downloads a part with the longer timeout and keeps the backend file name", async () => {
    const blob = new Blob(["%PDF"], { type: "application/pdf" })
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob, filename: "phieu-kham-KSK-2026-001-phan-1.pdf" })

    const file = await downloadRenderJobPart("job-1", 1)

    expect(getBlob).toHaveBeenCalledWith("/api/v1/document-render-jobs/job-1/parts/1", {
      signal: undefined,
      timeoutMs: RENDER_JOB_PART_DOWNLOAD_TIMEOUT_MS,
    })
    expect(file).toEqual({ blob, fileName: "phieu-kham-KSK-2026-001-phan-1.pdf" })
  })

  it("names a part when the backend sends no file name", async () => {
    vi.spyOn(apiClient, "getBlob").mockResolvedValue({ blob: new Blob(["%PDF"]) })
    expect((await downloadRenderJobPart("job-1", 3)).fileName).toBe("lenh-in-phan-3.pdf")
  })
})

describe("render job labels", () => {
  it("polls only queued and running jobs", () => {
    expect(isRenderJobActive("QUEUED")).toBe(true)
    expect(isRenderJobActive("RUNNING")).toBe(true)
    expect(isRenderJobActive("SUCCEEDED")).toBe(false)
    expect(isRenderJobActive("FAILED")).toBe(false)
    expect(isRenderJobActive("EXPIRED")).toBe(false)
    expect(isRenderJobActive(undefined)).toBe(false)
  })

  it("describes skip reasons and failures in Vietnamese, with a fallback for new codes", () => {
    expect(describeRenderJobSkipReason("CANCELLED")).toBe("Đã bị hủy khỏi danh sách")
    expect(describeRenderJobSkipReason("TOO_LONG")).toContain("quá dài")
    expect(describeRenderJobSkipReason("SOMETHING_NEW")).toBe("Không in được")
    expect(describeRenderJobError("NO_TEMPLATE")).toContain("Chưa có mẫu phiếu")
    expect(describeRenderJobError("SOMETHING_NEW")).toBe("Lệnh in thất bại.")
    expect(describeRenderJobError(undefined)).toBe("Lệnh in thất bại.")
  })

  it("numbers the printed records of each part in print order", () => {
    expect(
      renderJobPartRanges([
        { partNo: 1, recordCount: 200, sizeBytes: 1 },
        { partNo: 2, recordCount: 87, sizeBytes: 1 },
      ]).map(({ partNo, from, to }) => ({ partNo, from, to }))
    ).toEqual([
      { partNo: 1, from: 1, to: 200 },
      { partNo: 2, from: 201, to: 287 },
    ])
  })
})
