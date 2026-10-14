import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { Toaster } from "@/shared/ui/toaster"
import { findDialog } from "./support/app-dialog"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"

const download = vi.hoisted(() => ({ saveBlobAs: vi.fn() }))
vi.mock("../utils/download-blob", () => download)

const KEY_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const KEY_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
const PARTICIPANTS = "/api/v1/organizations/org-1/health-examination-batches/batch-1/participants"
const A3_PDF = "%PDF-1.7\n1 0 obj << /Type /Page /MediaBox [0 0 1190.55 841.89] >> endobj"

function item(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `p-${index}`,
    batchId: "batch-1",
    batchDayId: "day-1",
    examinationDate: "2026-10-20",
    participantCode: `KSK-2026-001-${String(index).padStart(4, "0")}`,
    fullName: `Người khám ${index}`,
    dateOfBirth: "1990-03-14",
    sex: "FEMALE",
    identificationNumberMasked: "********8901",
    departmentName: index % 2 === 0 ? "Kế toán" : "Kho vận",
    positionName: "Nhân viên",
    rosterStatus: "ACTIVE",
    attendanceStatus: "UNCONFIRMED",
    reconciliationStatus: "PENDING",
    actualExaminationDate: null,
    preparedAt: null,
    rowVersion: 0,
    ...overrides,
  }
}

function page(items: unknown[], totalElements = items.length) {
  return {
    result: "OK" as const,
    code: 200,
    data: {
      items,
      page: 1,
      size: 100,
      totalElements,
      totalPages: Math.max(1, Math.ceil(totalElements / 100)),
    },
  }
}

function job(overrides: Record<string, unknown> = {}) {
  return {
    result: "OK" as const,
    code: 200,
    data: {
      id: "job-1",
      documentType: "HEALTH_EXAM_PERIODIC_FORM_BLANK",
      status: "SUCCEEDED",
      totalCount: 3,
      processedCount: 3,
      errorCode: null,
      skipped: [{ id: "p-3", reason: "TOO_LONG" }],
      parts: [{ partNo: 1, recordCount: 2, sizeBytes: 2_400_000 }],
      createdAt: "2026-10-13T01:00:00Z",
      finishedAt: "2026-10-13T01:02:00Z",
      expiresAt: "2026-10-14T01:02:00Z",
      ...overrides,
    },
  }
}

const ROWS = [item(1), item(2), item(3), item(4, { rosterStatus: "CANCELLED" })]

function mockGet(handlers: { jobs?: unknown[]; list?: unknown } = {}) {
  const jobs = [...(handlers.jobs ?? [])]
  return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
    if (path.startsWith("/api/v1/document-render-jobs/")) {
      const next = jobs.length > 1 ? jobs.shift() : jobs[0]
      if (next instanceof Error) throw next
      return next as never
    }
    return (handlers.list ?? page(ROWS)) as never
  })
}

function renderTab(props: Partial<React.ComponentProps<typeof ParticipantsTab>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ParticipantsTab
        organizationId="org-1"
        batchId="batch-1"
        batch={{
          code: "KSK-2026-001",
          status: "READY",
          rowVersion: 4,
          days: [
            { id: "day-1", examinationDate: "2026-10-20" },
            { id: "day-2", examinationDate: "2026-10-21" },
          ],
        }}
        canPrintForm
        canBulkPrintForms
        {...props}
      />
      <Toaster />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  const uuids = [KEY_A, KEY_B]
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    () => uuids.shift() as ReturnType<typeof crypto.randomUUID>
  )
  Object.assign(URL, {
    createObjectURL: vi.fn(() => "blob:examination-form"),
    revokeObjectURL: vi.fn(),
  })
})
afterEach(() => vi.restoreAllMocks())

describe("ParticipantsTab examination form printing", () => {
  it("offers no printing for a draft batch and says why", async () => {
    mockGet()
    renderTab({ batch: { code: "KSK", status: "DRAFT", rowVersion: 1 } })

    await screen.findByText("Người khám 1")
    expect(screen.queryByRole("button", { name: /in phiếu khám của/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    expect(screen.getByText(/chỉ in được phiếu khám khi đợt khám/i)).toBeInTheDocument()
  })

  it("hides printing from an account without the permissions", async () => {
    mockGet()
    renderTab({ canPrintForm: false, canBulkPrintForms: false })

    await screen.findByText("Người khám 1")
    expect(screen.queryByRole("button", { name: /in phiếu/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/chỉ in được phiếu khám/i)).not.toBeInTheDocument()
  })

  it("shows the PDF of one Participant with the paper of the template", async () => {
    mockGet()
    const getBlob = vi.spyOn(apiClient, "getBlob").mockResolvedValue({
      blob: new Blob([A3_PDF], { type: "application/pdf" }),
      filename: "phieu-kham-KSK-2026-001-0001.pdf",
    })
    renderTab()
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "In phiếu khám của Người khám 1" }))
    const dialog = await findDialog()

    expect(await within(dialog).findByTitle("Phiếu khám của Người khám 1")).toHaveAttribute(
      "src",
      "blob:examination-form"
    )
    expect(within(dialog).getByText("A3 ngang")).toBeInTheDocument()
    expect(getBlob).toHaveBeenCalledWith(`${PARTICIPANTS}/p-1/examination-form`, {
      signal: expect.any(AbortSignal),
      timeoutMs: 45_000,
    })
    // A cancelled Participant has no print action.
    expect(
      screen.queryByRole("button", { name: "In phiếu khám của Người khám 4" })
    ).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Tải về" }))
    expect(download.saveBlobAs).toHaveBeenCalledWith(
      expect.any(Blob),
      "phieu-kham-KSK-2026-001-0001.pdf"
    )
  })

  it("explains a form that overflows the template in Vietnamese", async () => {
    mockGet()
    vi.spyOn(apiClient, "getBlob").mockRejectedValue(
      new ApiClientError("Dữ liệu đã thay đổi", 409, 409, "Form has 3 pages")
    )
    renderTab()
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "In phiếu khám của Người khám 2" }))
    const dialog = await findDialog()

    expect(await within(dialog).findByText(/tràn sang trang khác/)).toBeInTheDocument()
    expect(within(dialog).queryByText(/pages/)).not.toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Thử lại" })).toBeInTheDocument()
  })

  it("queues a bulk job in department order, then lists the parts and the skipped people", async () => {
    mockGet({ jobs: [job()] })
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 202, data: { jobId: "job-1" } })
    const getBlob = vi.spyOn(apiClient, "getBlob").mockResolvedValue({
      blob: new Blob(["%PDF"]),
      filename: "phieu-kham-KSK-2026-001-phan-1.pdf",
    })
    renderTab()
    const user = userEvent.setup()

    await screen.findByText("Người khám 1")
    expect(screen.getByRole("checkbox", { name: "Chọn Người khám 4" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
    await user.click(screen.getByRole("checkbox", { name: "Chọn Người khám 1" }))
    await user.click(screen.getByRole("checkbox", { name: "Chọn Người khám 2" }))
    await user.click(screen.getByRole("checkbox", { name: "Chọn Người khám 3" }))
    expect(screen.getByText("Đã chọn 3 người khám")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "In phiếu khám (3)" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Tạo lệnh in" }))

    // "Kế toán" sorts before "Kho vận".
    expect(post).toHaveBeenCalledWith(
      `${PARTICIPANTS}/examination-form-print-jobs`,
      { participantIds: ["p-2", "p-1", "p-3"] },
      { headers: { "Idempotency-Key": KEY_A } }
    )
    expect(await within(dialog).findByText("Phần 1/1")).toBeInTheDocument()
    expect(within(dialog).getByText("Đã xong")).toBeInTheDocument()
    expect(within(dialog).getByText("KSK-2026-001-0003 · Người khám 3")).toBeInTheDocument()
    expect(within(dialog).getByText(/thông tin quá dài/i)).toBeInTheDocument()
    expect(screen.queryByText("Đã chọn 3 người khám")).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Tải Phần 1/1" }))
    await waitFor(() =>
      expect(download.saveBlobAs).toHaveBeenCalledWith(
        expect.any(Blob),
        "phieu-kham-KSK-2026-001-phan-1.pdf"
      )
    )
    expect(getBlob).toHaveBeenCalledWith("/api/v1/document-render-jobs/job-1/parts/1", {
      signal: undefined,
      timeoutMs: 180_000,
    })
  })

  it("keeps the job after the dialog closes and reopens it from the tab", async () => {
    mockGet({ jobs: [job({ status: "RUNNING", processedCount: 1, parts: [], skipped: [] })] })
    vi.spyOn(apiClient, "post").mockResolvedValue({
      result: "OK",
      code: 202,
      data: { jobId: "job-1" },
    })
    renderTab()
    const user = userEvent.setup()

    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("checkbox", { name: "Chọn Người khám 1" }))
    await user.click(screen.getByRole("button", { name: "In phiếu khám (1)" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Tạo lệnh in" }))
    expect(await within(dialog).findByText("Đang tạo file")).toBeInTheDocument()
    expect(within(dialog).getByRole("progressbar", { name: "Tiến độ lệnh in" })).toHaveAttribute(
      "aria-valuenow",
      "1"
    )

    await user.click(within(dialog).getByRole("button", { name: "Đóng, tiếp tục chạy nền" }))
    await user.click(await screen.findByRole("button", { name: /lệnh in gần nhất · 1\/3/i }))
    expect(await within(await findDialog()).findByText("Đang tạo file")).toBeInTheDocument()
  })

  it("reuses the Idempotency-Key when a rejected job is sent again", async () => {
    mockGet()
    const post = vi
      .spyOn(apiClient, "post")
      .mockRejectedValueOnce(new ApiClientError("x", 409, 409, "Too many print jobs"))
      .mockResolvedValueOnce({ result: "OK", code: 202, data: { jobId: "job-1" } })
    renderTab()
    const user = userEvent.setup()

    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("checkbox", { name: "Chọn Người khám 1" }))
    await user.click(screen.getByRole("button", { name: "In phiếu khám (1)" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Tạo lệnh in" }))

    expect(await within(dialog).findByText(/3 lệnh in chưa xong/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Tạo lệnh in" }))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    expect(post.mock.calls[1][2]).toEqual({ headers: { "Idempotency-Key": KEY_A } })
  })

  it("selects every active Participant matching the filter across pages", async () => {
    const get = mockGet({
      list: page([item(1), item(2), item(3)], 3),
    })
    renderTab()
    const user = userEvent.setup()

    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("button", { name: "Chọn tất cả người khớp bộ lọc" }))

    expect(await screen.findByText("Đã chọn 3 người khám")).toBeInTheDocument()
    const selectAllCall = get.mock.calls
      .map(([path]) => new URL(path, "http://local"))
      .find((url) => url.searchParams.get("size") === "100")
    expect(selectAllCall?.searchParams.get("rosterStatus")).toBe("ACTIVE")
  })

  it("clears the selection when the day filter changes and sends the day to the list", async () => {
    const get = mockGet()
    renderTab()
    const user = userEvent.setup()

    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("checkbox", { name: "Chọn Người khám 1" }))
    expect(screen.getByText("Đã chọn 1 người khám")).toBeInTheDocument()

    await user.click(screen.getByRole("combobox", { name: "Lọc theo ngày khám" }))
    await user.click(await screen.findByRole("option", { name: "21/10/2026" }))

    await waitFor(() =>
      expect(get.mock.calls.some(([path]) => path.includes("batchDayId=day-2"))).toBe(true)
    )
    expect(screen.getByText("Chọn người khám để in phiếu hàng loạt")).toBeInTheDocument()
  })

  describe("printing a whole examination day", () => {
    /** Answers the day totals (one row per page) apart from the tab list and the name lookup. */
    function mockDayGet(totals: { pending: number; attended: number }) {
      return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
        if (path.startsWith("/api/v1/document-render-jobs/")) return job() as never
        const url = new URL(path, "http://local")
        if (url.searchParams.get("size") === "1") {
          const attendance = url.searchParams.get("attendanceStatus")
          return page([], attendance === "ATTENDED" ? totals.attended : totals.pending) as never
        }
        return page(ROWS) as never
      })
    }

    it("lets the backend choose the people of the day and names the skipped ones afterwards", async () => {
      const get = mockDayGet({ pending: 3, attended: 2 })
      const post = vi
        .spyOn(apiClient, "post")
        .mockResolvedValue({ result: "OK", code: 202, data: { jobId: "job-1" } })
      renderTab()
      const user = userEvent.setup()

      await screen.findByText("Người khám 1")
      await user.click(screen.getByRole("button", { name: "In theo ngày khám" }))
      const dialog = await findDialog()

      // Today is before both days, so the first day is preselected.
      expect(within(dialog).getByRole("combobox", { name: "Ngày khám" })).toHaveTextContent(
        "20/10/2026"
      )
      expect(await within(dialog).findByText("Sẽ in")).toBeInTheDocument()
      await waitFor(() =>
        expect(within(dialog).getByText("Sẽ in").nextElementSibling).toHaveTextContent("3")
      )
      expect(within(dialog).getByText("File PDF").nextElementSibling).toHaveTextContent("1")
      expect(
        get.mock.calls.some(([path]) => {
          const url = new URL(path, "http://local")
          return (
            url.searchParams.get("size") === "1" &&
            url.searchParams.get("batchDayId") === "day-1" &&
            url.searchParams.get("rosterStatus") === "ACTIVE"
          )
        })
      ).toBe(true)

      await user.click(within(dialog).getByRole("button", { name: "Tạo lệnh in" }))

      expect(post).toHaveBeenCalledWith(
        `${PARTICIPANTS}/examination-form-print-jobs`,
        { scope: "BATCH_DAY", batchDayId: "day-1", includeAttended: false, sort: "DEPARTMENT" },
        { headers: { "Idempotency-Key": KEY_A } }
      )
      expect(
        await within(dialog).findByText("Lệnh in phiếu khám ngày 20/10/2026")
      ).toBeInTheDocument()
      expect(await within(dialog).findByText("Phần 1/1")).toBeInTheDocument()
      // The names come from the day's list, because the job only holds identifiers.
      expect(
        await within(dialog).findByText("KSK-2026-001-0003 · Người khám 3")
      ).toBeInTheDocument()
    })

    it("also prints the people who already attended when asked, with a new Idempotency-Key", async () => {
      mockDayGet({ pending: 3, attended: 2 })
      const post = vi
        .spyOn(apiClient, "post")
        .mockResolvedValue({ result: "OK", code: 202, data: { jobId: "job-1" } })
      renderTab()
      const user = userEvent.setup()

      await screen.findByText("Người khám 1")
      await user.click(screen.getByRole("button", { name: "In theo ngày khám" }))
      const dialog = await findDialog()
      await waitFor(() =>
        expect(within(dialog).getByText("Sẽ in").nextElementSibling).toHaveTextContent("3")
      )
      await user.click(
        within(dialog).getByRole("checkbox", { name: "Gồm cả người đã khám (in lại phiếu)" })
      )
      await waitFor(() =>
        expect(within(dialog).getByText("Sẽ in").nextElementSibling).toHaveTextContent("5")
      )
      await user.click(within(dialog).getByRole("button", { name: "Tạo lệnh in" }))

      expect(post.mock.calls[0][1]).toEqual({
        scope: "BATCH_DAY",
        batchDayId: "day-1",
        includeAttended: true,
        sort: "DEPARTMENT",
      })
      expect(post.mock.calls[0][2]).toEqual({ headers: { "Idempotency-Key": KEY_B } })
    })

    it("does not queue an empty day and points to the reprint option", async () => {
      mockDayGet({ pending: 0, attended: 4 })
      const post = vi.spyOn(apiClient, "post")
      renderTab()
      const user = userEvent.setup()

      await screen.findByText("Người khám 1")
      await user.click(screen.getByRole("button", { name: "In theo ngày khám" }))
      const dialog = await findDialog()

      expect(await within(dialog).findByText(/Ngày này không còn ai chưa khám/)).toBeInTheDocument()
      expect(within(dialog).getByRole("button", { name: "Tạo lệnh in" })).toBeDisabled()
      expect(post).not.toHaveBeenCalled()
    })

    it("preselects the day the list is filtered to", async () => {
      mockDayGet({ pending: 1, attended: 0 })
      renderTab()
      const user = userEvent.setup()

      await screen.findByText("Người khám 1")
      await user.click(screen.getByRole("combobox", { name: "Lọc theo ngày khám" }))
      await user.click(await screen.findByRole("option", { name: "21/10/2026" }))
      await user.click(screen.getByRole("button", { name: "In theo ngày khám" }))
      const dialog = await findDialog()

      expect(within(dialog).getByRole("combobox", { name: "Ngày khám" })).toHaveTextContent(
        "21/10/2026"
      )
    })
  })
})
