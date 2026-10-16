import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { Toaster } from "@/shared/ui/toaster"
import { findDialog, queryDialog } from "./support/app-dialog"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"

const download = vi.hoisted(() => ({ saveBlobAs: vi.fn() }))
vi.mock("../utils/download-blob", () => download)

const KEY_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const KEY_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

function item(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `p-${index}`,
    agreementId: "agreement-1",
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
    liveAssignmentCount: 0,
    nextSessionDate: null,
    lastAttendedDate: null,
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
        agreementId="agreement-1"
        agreement={{ code: "DK 001", name: "Khám định kỳ", status: "DRAFT", rowVersion: 4 }}
        {...props}
      />
      <Toaster />
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

    expect(await screen.findByText("Chưa có người khám trong thỏa thuận")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /nhập từ excel/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
  })

  it("does not call the backend and says so when the user cannot read Participants", () => {
    const get = vi.spyOn(apiClient, "get")
    renderTab({ canRead: false })

    expect(screen.getByText("Không có quyền xem")).toBeInTheDocument()
    expect(get).not.toHaveBeenCalled()
  })

  it("keeps search and filters available when the roster is empty", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([]))
    renderTab()

    expect(await screen.findByText("Chưa có người khám trong thỏa thuận")).toBeInTheDocument()
    expect(
      screen.getByRole("searchbox", { name: "Tìm người khám trong thỏa thuận" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("combobox", { name: "Lọc theo trạng thái danh sách" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("combobox", { name: "Lọc theo trạng thái tiếp nhận" })
    ).toBeInTheDocument()
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
  it.each(["ENDED", "CANCELLED"])(
    "hides template and import for a %s agreement even with the permission",
    async (status) => {
      vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
      renderTab({
        canImport: true,
        canDownloadTemplate: true,
        agreement: { code: "DK", name: "Khám định kỳ", status, rowVersion: 1 },
      })

      await screen.findByText("Người khám 1")
      expect(screen.queryByRole("button", { name: /nhập từ excel/i })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
    }
  )

  it("downloads the template with a file name from the agreement code", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    const blob = new Blob(["x"])
    const getBlob = vi.spyOn(apiClient, "getBlob").mockResolvedValue({ blob, filename: undefined })
    renderTab({ canImport: true, canDownloadTemplate: true })
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Tải file mẫu" }))

    await waitFor(() => expect(download.saveBlobAs).toHaveBeenCalledTimes(1))
    expect(getBlob).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/agreements/agreement-1/participants/import-template",
      expect.anything()
    )
    expect(download.saveBlobAs.mock.calls[0][0]).toBe(blob)
    expect(download.saveBlobAs.mock.calls[0][1]).toMatch(/^mau-nhap-nguoi-kham-.*\.xlsx$/)
  })

  it("tells the user when the template cannot be downloaded", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)]))
    vi.spyOn(apiClient, "getBlob").mockRejectedValue(new ApiClientError("x", 500))
    renderTab({ canImport: true, canDownloadTemplate: true })
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Tải file mẫu" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Không thể tải file mẫu. Vui lòng thử lại."
    )
  })
})

describe("Participant import dialog", () => {
  const xlsx = () => new File(["data"], "nguoi-kham.xlsx")

  async function openDialog() {
    const user = userEvent.setup()
    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("button", { name: "Nhập từ Excel" }))
    const dialog = await findDialog()
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
        agreementId: "agreement-1",
        totalRows: 3,
        createdCount: 3,
        completedAt: "2026-10-06T10:00:00Z",
      },
    })
    renderTab({ canImport: true })
    const { user, dialog } = await openDialog()
    expect(within(dialog).queryByRole("button", { name: "Tải file mẫu" })).not.toBeInTheDocument()
    const listCalls = get.mock.calls.length

    await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
    await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))

    await waitFor(() => expect(queryDialog()).not.toBeInTheDocument())
    expect(await screen.findByText("Đã thêm 3 người khám vào thỏa thuận.")).toBeInTheDocument()
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
    expect(within(dialog).getByText("Chưa có người khám nào được thêm vào thỏa thuận.")).toBeInTheDocument()
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
          agreementId: "agreement-1",
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

    await waitFor(() => expect(queryDialog()).not.toBeInTheDocument())
    expect(await screen.findByText("Đã thêm 1 người khám vào thỏa thuận.")).toBeInTheDocument()
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

  describe("scheduling at import", () => {
    const SESSION = {
      id: "session-1",
      organizationId: "org-1",
      agreementId: "agreement-1",
      sessionDate: "2026-10-20",
      activity: "ALL",
      siteType: "CLINIC",
      siteAddress: "",
      status: "OPEN",
      assignedCount: 5,
      attendedCount: 0,
      noShowCount: 0,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      rowVersion: 3,
    }
    const imported = (extra: Record<string, unknown> = {}) => ({
      result: "OK" as const,
      code: 201,
      message: "ok",
      data: {
        importJobId: "job-1",
        agreementId: "agreement-1",
        totalRows: 3,
        createdCount: 3,
        completedAt: "2026-10-06T10:00:00Z",
        ...extra,
      },
    })

    function mockGets() {
      return vi.spyOn(apiClient, "get").mockImplementation(async (url: string) =>
        url.includes("/sessions") ? page([SESSION]) : page([item(1)])
      )
    }

    it("offers no day picker without the permission, and sends no session", async () => {
      mockGets()
      const post = vi.spyOn(apiClient, "post").mockResolvedValue(imported())
      renderTab({ canImport: true })
      const { user, dialog } = await openDialog()

      expect(within(dialog).queryByLabelText(/Ngày khám/)).not.toBeInTheDocument()
      await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
      await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))

      await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
      expect((post.mock.calls[0][1] as FormData).has("sessionId")).toBe(false)
    })

    it("sends the chosen open session with the file and reports who was scheduled", async () => {
      const get = mockGets()
      const post = vi.spyOn(apiClient, "post").mockResolvedValue(
        imported({ sessionId: "session-1", assignedCount: 3 })
      )
      renderTab({ canImport: true, canAssign: true })
      const { user, dialog } = await openDialog()

      const picker = await within(dialog).findByLabelText(/Ngày khám/)
      await within(dialog).findByRole("option", { name: /20\/10\/2026/ })
      await user.selectOptions(picker, "session-1")
      await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
      await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))

      await waitFor(() => expect(queryDialog()).not.toBeInTheDocument())
      expect(
        await screen.findByText(
          "Đã thêm 3 người khám vào thỏa thuận và xếp lịch cho 3 người."
        )
      ).toBeInTheDocument()
      expect((post.mock.calls[0][1] as FormData).get("sessionId")).toBe("session-1")
      const sessionListUrl = get.mock.calls
        .map((call) => String(call[0]))
        .find((url) => url.includes("/sessions"))
      expect(sessionListUrl).toContain("agreementId=agreement-1")
      expect(sessionListUrl).toContain("status=OPEN")
    })

    it("starts a new Idempotency-Key when the day changes after the file was chosen", async () => {
      mockGets()
      const post = vi
        .spyOn(apiClient, "post")
        .mockRejectedValue(new ApiClientError("x", 400, 400, "Row 2: sex is required"))
      renderTab({ canImport: true, canAssign: true })
      const { user, dialog } = await openDialog()

      await within(dialog).findByRole("option", { name: /20\/10\/2026/ })
      await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
      await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))
      await within(dialog).findByText(/Dòng 2/)
      await user.selectOptions(within(dialog).getByLabelText(/Ngày khám/), "session-1")
      await user.click(within(dialog).getByRole("button", { name: /Nhập danh sách|Thử lại/ }))

      await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
      const keys = post.mock.calls.map(
        (call) => (call[2] as { headers: Record<string, string> }).headers["Idempotency-Key"]
      )
      expect(keys).toEqual([KEY_A, KEY_B])
      expect((post.mock.calls[0][1] as FormData).has("sessionId")).toBe(false)
      expect((post.mock.calls[1][1] as FormData).get("sessionId")).toBe("session-1")
    })

    it("explains a refused day in Vietnamese and says nobody was added", async () => {
      mockGets()
      vi.spyOn(apiClient, "post").mockRejectedValue(
        new ApiClientError("x", 409, 409, "Business rule could not be completed")
      )
      renderTab({ canImport: true, canAssign: true })
      const { user, dialog } = await openDialog()

      await within(dialog).findByRole("option", { name: /20\/10\/2026/ })
      await user.selectOptions(within(dialog).getByLabelText(/Ngày khám/), "session-1")
      await user.upload(within(dialog).getByLabelText(/Tệp Excel/), xlsx())
      await user.click(within(dialog).getByRole("button", { name: "Nhập danh sách" }))

      expect(
        await within(dialog).findByText(/Không xếp được vào lịch khám đã chọn/)
      ).toBeInTheDocument()
      expect(
        within(dialog).getByText("Chưa có người khám nào được thêm vào thỏa thuận.")
      ).toBeInTheDocument()
    })
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

describe("Participant page size", () => {
  it("sends the chosen size and starts again at page 1", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(page([item(1)], 25))
    const user = userEvent.setup()
    renderTab()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Trang 2" }))
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith(expect.stringContaining("page=2"), expect.anything())
    )

    await user.click(await screen.findByRole("combobox", { name: "Số dòng mỗi trang" }))
    await user.click(await screen.findByRole("option", { name: "50" }))

    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith(expect.stringMatching(/page=1&size=50&/), expect.anything())
    )
  })
})

describe("ParticipantsTab scheduling", () => {
  const SESSIONS = "/api/v1/organizations/org-1/sessions"

  function sessionRow(id: string, date: string, overrides: Record<string, unknown> = {}) {
    return {
      id,
      organizationId: "org-1",
      agreementId: "agreement-1",
      sessionDate: date,
      activity: "ALL",
      siteType: "CLINIC",
      siteAddress: "",
      status: "OPEN",
      assignedCount: 7,
      attendedCount: 0,
      noShowCount: 0,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      rowVersion: 0,
      ...overrides,
    }
  }

  /** Answers the sessions the picker lists and the Participant list. */
  function mockApi(rows: unknown[]) {
    return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
      if (path.startsWith(`${SESSIONS}?`)) {
        return page([sessionRow("session-1", "2026-10-20"), sessionRow("session-2", "2026-10-22")]) as never
      }
      return page(rows) as never
    })
  }

  const assigned = (ids: string[], skipped: string[] = []) => ({
    result: "OK" as const,
    code: 201,
    message: "ok",
    data: {
      sessionId: "session-1",
      assigned: ids.map((id) => ({ participantId: id, assignmentId: `a-${id}` })),
      skippedParticipantIds: skipped,
    },
  })

  async function tick(user: ReturnType<typeof userEvent.setup>, ...names: string[]) {
    for (const name of names) {
      await user.click(await screen.findByRole("checkbox", { name: `Chọn ${name}` }))
    }
  }

  it("shows when each person is expected, or that nobody has put them in a session yet", async () => {
    mockApi([
      item(1, { liveAssignmentCount: 1, nextSessionDate: "2026-10-20" }),
      item(2, { liveAssignmentCount: 0, nextSessionDate: null }),
    ])
    renderTab({ canAssign: true })

    await screen.findByText("Người khám 1")
    expect(screen.getByText("20/10/2026")).toBeInTheDocument()
    expect(screen.getByText("Chưa xếp lịch")).toBeInTheDocument()
  })

  it("assigns the ticked people to the chosen session in the order they were ticked", async () => {
    mockApi([item(1), item(2), item(3)])
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(assigned(["p-3", "p-1"]))
    const user = userEvent.setup()
    renderTab({ canAssign: true })

    await tick(user, "Người khám 3", "Người khám 1")
    expect(screen.getByText("Đã chọn 2 người khám")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Xếp lịch khám (2)" }))
    const dialog = await findDialog()
    expect(within(dialog).getByText(/Chọn lịch khám cho 2 người khám đã chọn/)).toBeInTheDocument()
    // The number of people already in a session is shown for reference; there is no capacity.
    expect(within(dialog).getAllByRole("radio")).toHaveLength(2)
    expect(within(dialog).getAllByText(/7 người/)).toHaveLength(2)
    expect(within(dialog).getByRole("button", { name: "Xếp lịch" })).toBeDisabled()

    await user.click(within(dialog).getByRole("radio", { name: /22\/10\/2026/ }))
    await user.click(within(dialog).getByRole("button", { name: "Xếp lịch" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(`${SESSIONS}/session-2/assignments`, {
      participantIds: ["p-3", "p-1"],
    })
    await waitFor(() => expect(queryDialog()).not.toBeInTheDocument())
    expect(await screen.findByText("Đã xếp lịch cho 2 người khám.")).toBeInTheDocument()
    // The ticks are spent: the next action starts from an empty selection.
    expect(screen.queryByText("Đã chọn 2 người khám")).not.toBeInTheDocument()
  })

  it("reports the people who were already in the session instead of failing", async () => {
    mockApi([item(1), item(2)])
    vi.spyOn(apiClient, "post").mockResolvedValue(assigned(["p-1"], ["p-2"]))
    const user = userEvent.setup()
    renderTab({ canAssign: true })

    await tick(user, "Người khám 1", "Người khám 2")
    await user.click(screen.getByRole("button", { name: "Xếp lịch khám (2)" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getAllByRole("radio")[0])
    await user.click(within(dialog).getByRole("button", { name: "Xếp lịch" }))

    expect(
      await screen.findByText("Đã xếp lịch cho 1 người; 1 người đã có trong lịch này.")
    ).toBeInTheDocument()
  })

  it("keeps the dialog and the ticks when the backend refuses, and says why in Vietnamese", async () => {
    mockApi([item(1)])
    const post = vi
      .spyOn(apiClient, "post")
      .mockRejectedValue(new ApiClientError("x", 409, 409, "Participant is cancelled"))
    const user = userEvent.setup()
    renderTab({ canAssign: true })

    await tick(user, "Người khám 1")
    await user.click(screen.getByRole("button", { name: "Xếp lịch khám (1)" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getAllByRole("radio")[0])
    await user.click(within(dialog).getByRole("button", { name: "Xếp lịch" }))

    expect(await within(dialog).findByText(/người khám đã bị hủy, thỏa thuận đã kết thúc/)).toBeInTheDocument()
    expect(within(dialog).queryByText(/Participant is cancelled/)).not.toBeInTheDocument()
    expect(post).toHaveBeenCalledTimes(1)
    expect(queryDialog()).toBeInTheDocument()
  })

  it("lists only the open sessions of this agreement and the shared ones", async () => {
    const get = mockApi([item(1)])
    const user = userEvent.setup()
    renderTab({ canAssign: true })

    await tick(user, "Người khám 1")
    await user.click(screen.getByRole("button", { name: "Xếp lịch khám (1)" }))
    await findDialog()

    const request = get.mock.calls
      .map(([path]) => new URL(String(path), "http://local"))
      .find((url) => url.pathname === SESSIONS)
    expect(request?.searchParams.get("agreementId")).toBe("agreement-1")
    expect(request?.searchParams.get("status")).toBe("OPEN")
  })

  it("offers to create a session from the picker only with the create permission", async () => {
    mockApi([item(1)])
    const user = userEvent.setup()
    const first = renderTab({ canAssign: true, canCreateSession: false })

    await tick(user, "Người khám 1")
    await user.click(screen.getByRole("button", { name: "Xếp lịch khám (1)" }))
    const dialog = await findDialog()
    expect(within(dialog).queryByRole("button", { name: "Tạo lịch khám mới" })).not.toBeInTheDocument()
    first.unmount()

    renderTab({ canAssign: true, canCreateSession: true })
    await tick(user, "Người khám 1")
    await user.click(screen.getByRole("button", { name: "Xếp lịch khám (1)" }))
    expect(
      within(await findDialog()).getByRole("button", { name: "Tạo lịch khám mới" })
    ).toBeInTheDocument()
  })

  it("offers no scheduling without the permission, or once the agreement has ended", async () => {
    mockApi([item(1)])
    const first = renderTab({ canAssign: false, canRemove: true })
    const user = userEvent.setup()
    await tick(user, "Người khám 1")
    expect(screen.queryByRole("button", { name: /^Xếp lịch khám/ })).not.toBeInTheDocument()
    first.unmount()

    renderTab({
      canAssign: true,
      canRemove: true,
      agreement: { code: "DK", name: "Khám định kỳ", status: "ENDED", rowVersion: 1 },
    })
    await screen.findByText("Người khám 1")
    expect(screen.queryByRole("button", { name: /^Xếp lịch khám/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it.each([
    ["Chưa xếp lịch", "unscheduledFor=ANY"],
    ["Chưa có lịch lấy mẫu", "unscheduledFor=SAMPLING"],
    ["Chưa có lịch khám", "unscheduledFor=EXAMINATION"],
  ])("filters %s through the backend", async (option, expected) => {
    const get = mockApi([item(1)])
    const user = userEvent.setup()
    renderTab({ canAssign: true })
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("combobox", { name: "Lọc theo lịch khám" }))
    await user.click(await screen.findByRole("option", { name: option }))

    await waitFor(() =>
      expect(get.mock.calls.some(([path]) => String(path).includes(expected))).toBe(true)
    )
    // The first page again: the filter changes the list.
    expect(String(get.mock.calls.at(-1)?.[0])).toContain("page=1")
  })

  it("selects everyone matching the schedule filter, not only the visible page", async () => {
    const get = mockApi([item(1), item(2)])
    const user = userEvent.setup()
    renderTab({ canAssign: true })
    await screen.findByText("Người khám 1")
    await user.click(screen.getByRole("combobox", { name: "Lọc theo lịch khám" }))
    await user.click(await screen.findByRole("option", { name: "Chưa xếp lịch" }))
    await waitFor(() =>
      expect(get.mock.calls.some(([path]) => String(path).includes("unscheduledFor=ANY"))).toBe(true)
    )

    await user.click(screen.getByRole("button", { name: "Chọn tất cả người khớp bộ lọc" }))

    expect(await screen.findByText("Đã chọn 2 người khám")).toBeInTheDocument()
    const selectAll = get.mock.calls
      .map(([path]) => new URL(String(path), "http://local"))
      .filter((url) => url.searchParams.get("size") === "100")
    expect(selectAll.at(-1)?.searchParams.get("unscheduledFor")).toBe("ANY")
    expect(selectAll.at(-1)?.searchParams.get("rosterStatus")).toBe("ACTIVE")
  })
})
