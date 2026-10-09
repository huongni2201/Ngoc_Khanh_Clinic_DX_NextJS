import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"

const download = vi.hoisted(() => ({ saveBlobAs: vi.fn() }))
vi.mock("../utils/download-blob", () => download)

const KEY_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const KEY_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

function item(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `p-${index}`,
    batchId: "batch-1",
    batchDayId: "day-1",
    examinationDate: "2026-10-20",
    participantCode: `NV${String(index).padStart(3, "0")}`,
    fullName: `Người khám ${index}`,
    dateOfBirth: "1990-03-14",
    sex: "FEMALE",
    identificationNumberMasked: "********8901",
    departmentName: "Phòng Kế toán",
    positionName: "Kế toán viên",
    rosterStatus: "ACTIVE",
    attendanceStatus: "UNCONFIRMED",
    reconciliationStatus: "PENDING",
    actualExaminationDate: null,
    preparedAt: null,
    rowVersion: 0,
    ...overrides,
  }
}

function page(items: unknown[], totalElements = items.length, pageNumber = 1) {
  return {
    result: "OK" as const,
    code: 200,
    message: "ok",
    data: {
      items,
      page: pageNumber,
      size: 10,
      totalElements,
      totalPages: Math.max(1, Math.ceil(totalElements / 10)),
    },
  }
}

function renderTab(props: Partial<React.ComponentProps<typeof ParticipantsTab>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <ParticipantsTab
        organizationId="org-1"
        batchId="batch-1"
        batch={{ code: "DK 001", status: "DRAFT", rowVersion: 4 }}
        {...props}
      />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

beforeEach(() => {
  vi.clearAllMocks()
  const uuids = [KEY_A, KEY_B]
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    () => uuids.shift() as ReturnType<typeof crypto.randomUUID>
  )
})
afterEach(() => vi.restoreAllMocks())

describe("ParticipantsTab list", () => {
  it("shows the empty state with no action when the user cannot import", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([]))
    renderTab({ canImport: false })

    expect(await screen.findByText("Chưa có người khám trong đợt khám")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /nhập từ excel/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
  })

  it("does not call the backend and says so when the user cannot read Participants", () => {
    const get = vi.spyOn(apiClient, "get")
    renderTab({ canRead: false })

    expect(screen.getByText("Không có quyền xem")).toBeInTheDocument()
    expect(get).not.toHaveBeenCalled()
  })

  it("renders rows with the masked CCCD and Vietnamese labels, never the raw enum", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    renderTab()

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.getByText("********8901")).toBeInTheDocument()
    expect(screen.getByText("Nữ")).toBeInTheDocument()
    expect(screen.getByText("Đang trong danh sách")).toBeInTheDocument()
    expect(screen.getByText("Chưa xác nhận")).toBeInTheDocument()
    expect(screen.queryByText("UNCONFIRMED")).not.toBeInTheDocument()
    expect(screen.queryByText(/nhân viên/i)).not.toBeInTheDocument()
  })

  it("sorts by a header and resets to the first page, then toggles the direction", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)], 25))
    renderTab()
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Sắp xếp theo Họ và tên" }))
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith(
        expect.stringContaining("sortKey=fullName&sortBy=ASC"),
        expect.anything()
      )
    )
    await user.click(screen.getByRole("button", { name: "Sắp xếp theo Họ và tên" }))
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith(
        expect.stringContaining("sortKey=fullName&sortBy=DESC"),
        expect.anything()
      )
    )
  })

  it("sends the search text to the backend and starts again at page 1", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)], 25))
    renderTab()
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: /trang 2|2$/ }))
    await waitFor(() => expect(get).toHaveBeenLastCalledWith(expect.stringContaining("page=2"), expect.anything()))

    await user.type(screen.getByRole("searchbox"), "NV001")
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith(
        expect.stringMatching(/page=1&.*searchKey=NV001/),
        expect.anything()
      )
    )
  })

  it("shows a retry state and a Vietnamese message when the list fails", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue(new Error("Đã xảy ra lỗi kết nối API."))
    renderTab()

    expect(await screen.findByText("Không thể tải danh sách người khám.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument()
  })
})

describe("ParticipantsTab actions", () => {
  it.each(["SCHEDULED", "FINALIZED", "CANCELLED", "IN_PROGRESS"])(
    "hides template and import for a %s batch even with the permission",
    async (status) => {
      vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
      renderTab({ canImport: true, batch: { code: "DK", status, rowVersion: 1 } })

      await screen.findByText("Người khám 1")
      expect(screen.queryByRole("button", { name: /nhập từ excel/i })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
    }
  )

  it("downloads the template with a file name from the batch code", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    const blob = new Blob(["x"])
    const getBlob = vi.spyOn(apiClient, "getBlob").mockResolvedValue({ blob, filename: undefined })
    renderTab({ canImport: true })
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Tải file mẫu" }))

    await waitFor(() => expect(download.saveBlobAs).toHaveBeenCalledTimes(1))
    expect(getBlob).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/participants/import-template",
      expect.anything()
    )
    expect(download.saveBlobAs.mock.calls[0][0]).toBe(blob)
    expect(download.saveBlobAs.mock.calls[0][1]).toMatch(/^mau-nhap-nguoi-kham-.*\.xlsx$/)
  })

  it("tells the user when the template cannot be downloaded", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    vi.spyOn(apiClient, "getBlob").mockRejectedValue(new ApiClientError("x", 500))
    renderTab({ canImport: true })
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Tải file mẫu" }))

    expect(await screen.findByText("Không thể tải file mẫu. Vui lòng thử lại.")).toBeInTheDocument()
  })
})

describe("Participant import dialog", () => {
  const xlsx = () => new File(["data"], "nguoi-kham.xlsx")

  async function openDialog() {
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("button", { name: "Nhập từ Excel" }))
    const dialog = await screen.findByRole("dialog")
    return { user, dialog }
  }

  it("imports once, shows the count and refreshes the list", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      result: "OK",
      code: 201,
      message: "ok",
      data: {
        importJobId: "job-1",
        batchId: "batch-1",
        totalRows: 3,
        createdCount: 3,
        completedAt: "2026-10-06T10:00:00Z",
      },
    })
    renderTab({ canImport: true })
    const { user, dialog } = await openDialog()
    const listCalls = get.mock.calls.length

    await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
    await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))

    expect(await within(dialog).findByText(/Đã thêm 3 người khám/)).toBeInTheDocument()
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][2]).toEqual({ headers: { "Idempotency-Key": KEY_A } })
    expect((post.mock.calls[0][1] as FormData).get("rowVersion")).toBe("4")
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(listCalls))
  })

  it("explains a row error in Vietnamese and says nobody was added", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 400, 400, "Row 3: full_name is required")
    )
    renderTab({ canImport: true })
    const { user, dialog } = await openDialog()

    await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
    await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))

    expect(await within(dialog).findByText(/Dòng 3: thiếu giá trị ở cột Họ và tên/)).toBeInTheDocument()
    expect(within(dialog).getByText("Chưa có người khám nào được thêm vào đợt khám.")).toBeInTheDocument()
    expect(within(dialog).queryByText(/full_name is required/)).not.toBeInTheDocument()
  })

  it("retries a dropped connection with the same Idempotency-Key", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    const post = vi
      .spyOn(apiClient, "post")
      .mockRejectedValueOnce(new ApiClientError("network", 0))
      .mockResolvedValueOnce({
        result: "OK",
        code: 201,
        message: "ok",
        data: {
          importJobId: "job-1",
          batchId: "batch-1",
          totalRows: 1,
          createdCount: 1,
          completedAt: "2026-10-06T10:00:00Z",
        },
      })
    renderTab({ canImport: true })
    const { user, dialog } = await openDialog()

    await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
    await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))
    await user.click(await within(dialog).findByRole("button", { name: "Thử lại" }))

    await within(dialog).findByText(/Đã thêm 1 người khám/)
    expect(post.mock.calls.map((call) => (call[2] as { headers: Record<string, string> }).headers["Idempotency-Key"])).toEqual([KEY_A, KEY_A])
  })

  it("uses a new Idempotency-Key when another file is chosen", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    const post = vi
      .spyOn(apiClient, "post")
      .mockRejectedValue(new ApiClientError("x", 400, 400, "Row 2: sex is required"))
    renderTab({ canImport: true })
    const { user, dialog } = await openDialog()
    const input = within(dialog).getByLabelText(/Tệp Excel/)

    await user.upload(input, xlsx())
    await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))
    await within(dialog).findByText(/Dòng 2/)
    await user.upload(input, new File(["other"], "ban-sua.xlsx"))
    await user.click(within(dialog).getByRole("button", { name: /Nhập danh sách|Thử lại/ }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    expect((post.mock.calls[1][2] as { headers: Record<string, string> }).headers["Idempotency-Key"]).toBe(KEY_B)
  })

  it("rejects a non-xlsx file before any request", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    const post = vi.spyOn(apiClient, "post")
    renderTab({ canImport: true })
    const { dialog } = await openDialog()

    const input = within(dialog).getByLabelText(/Tệp Excel/)
    // userEvent.upload honours `accept`, so fire the change directly.
    const { fireEvent } = await import("@testing-library/react")
    fireEvent.change(input, { target: { files: [new File(["x"], "a.csv")] } })

    expect(await within(dialog).findByText("Chỉ chấp nhận tệp Excel định dạng .xlsx.")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Nhập danh sách" })).toBeDisabled()
    expect(post).not.toHaveBeenCalled()
  })
})
