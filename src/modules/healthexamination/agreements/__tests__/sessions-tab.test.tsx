import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ALL_PERMISSIONS, staffSessionWith } from "@/test-utils/render-with-client"
import { Toaster } from "@/shared/ui/toaster"
import { findDialog, queryDialog } from "./support/app-dialog"
import { SessionsTab } from "../components/session-tab/sessions-tab"

const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn(), search: "" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: nav.push }),
  usePathname: () => "/organizations/org-1/agreements/agreement-1",
  useSearchParams: () => new URLSearchParams(nav.search),
}))

const SESSIONS = "/api/v1/organizations/org-1/sessions"
const ASSIGNMENTS = `${SESSIONS}/session-1/assignments`

function session(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    organizationId: "org-1",
    agreementId: "agreement-1",
    sessionDate: "2026-10-20",
    activity: "ALL",
    siteType: "ORGANIZATION_SITE",
    siteAddress: "1 Đường A",
    status: "OPEN",
    assignedCount: 5,
    attendedCount: 2,
    noShowCount: 1,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    rowVersion: 3,
    ...overrides,
  }
}

const SESSION_ONE = session()
const SESSION_TWO = session({
  id: "session-2",
  agreementId: null,
  sessionDate: "2026-10-22",
  activity: "EXAMINATION",
  siteType: "CLINIC",
  siteAddress: "",
  assignedCount: 0,
  attendedCount: 0,
  noShowCount: 0,
  rowVersion: 0,
})
const SESSION_CANCELLED = session({
  id: "session-3",
  sessionDate: "2026-10-25",
  status: "CANCELLED",
  assignedCount: 0,
  attendedCount: 0,
  noShowCount: 0,
})

function row(index: number, status: string, overrides: Record<string, unknown> = {}) {
  const names = ["", "Nguyễn Văn A", "Trần Thị B", "Lê Văn C"]
  return {
    assignmentId: `a-${index}`,
    status,
    attendedAt: status === "ATTENDED" ? "2026-10-20T02:00:00Z" : null,
    note: null,
    assignmentRowVersion: index + 1,
    participantId: `p-${index}`,
    agreementId: "agreement-1",
    participantCode: `NV00${index}`,
    fullName: names[index],
    dateOfBirth: "1990-03-14",
    sex: "MALE",
    identificationNumberMasked: "********8901",
    departmentName: "Kế toán",
    positionName: "Nhân viên",
    rosterStatus: "ACTIVE",
    ...overrides,
  }
}

const ROWS = [row(1, "ASSIGNED"), row(2, "ATTENDED"), row(3, "NO_SHOW")]

const envelope = (data: unknown, code = 200) => ({ result: "OK" as const, code, message: "ok", data })

function page(items: unknown[]) {
  return envelope({ items, page: 1, size: 20, totalElements: items.length, totalPages: 1 })
}

/** Answers the session list (honouring `status`), one session and the Participants of session-1. */
function mockGet(options: { sessions?: unknown[]; rows?: unknown[] } = {}) {
  const sessions = (options.sessions ?? [SESSION_ONE, SESSION_TWO, SESSION_CANCELLED]) as Array<
    ReturnType<typeof session>
  >
  const rows = options.rows ?? ROWS
  return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
    const url = new URL(path, "http://local")
    if (url.pathname === ASSIGNMENTS) return page(rows) as never
    if (url.pathname === SESSIONS) {
      const status = url.searchParams.get("status")
      return page(sessions.filter((item) => !status || item.status === status)) as never
    }
    const found = sessions.find((item) => url.pathname === `${SESSIONS}/${item.id}`)
    return envelope(found ?? SESSION_ONE) as never
  })
}

const AGREEMENT = { id: "agreement-1", name: "Khám định kỳ", code: "DK001", status: "ACTIVE" }

function renderTab(
  props: Partial<React.ComponentProps<typeof SessionsTab>> = {},
  permissions: readonly string[] = ALL_PERMISSIONS
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(["auth", "session"], staffSessionWith(permissions))
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionsTab organizationId="org-1" agreement={AGREEMENT} {...props} />
      <Toaster />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  nav.search = ""
})
afterEach(() => vi.restoreAllMocks())

describe("SessionsTab list", () => {
  it("lists date, activity, place and the counts kept for reference, never a capacity", async () => {
    mockGet()
    renderTab()

    const table = within(await screen.findByRole("table", { name: "Lịch khám" }))
    const first = within(table.getByText("20/10/2026").closest("tr") as HTMLElement)
    expect(first.getByText("Lấy mẫu và khám")).toBeInTheDocument()
    expect(first.getByText(/Tại đơn vị: 1 Đường A/)).toBeInTheDocument()
    expect(first.getByText("Đang mở")).toBeInTheDocument()
    expect(first.getAllByRole("cell").map((cell) => cell.textContent)).toEqual(
      expect.arrayContaining(["5", "2", "1"])
    )
    const second = within(table.getByText("22/10/2026").closest("tr") as HTMLElement)
    expect(second.getByText("Khám")).toBeInTheDocument()
    expect(second.getByText("Tại phòng khám")).toBeInTheDocument()
    expect(table.queryByText(/sức chứa|ca khám/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: /sức chứa|ca/i })).not.toBeInTheDocument()
  })

  it("asks for the sessions of the agreement, newest first", async () => {
    const get = mockGet()
    renderTab()
    await screen.findByRole("table", { name: "Lịch khám" })

    const url = new URL(String(get.mock.calls[0][0]), "http://local")
    expect(url.searchParams.get("agreementId")).toBe("agreement-1")
    expect(url.searchParams.get("sortKey")).toBe("sessionDate")
    expect(url.searchParams.get("sortBy")).toBe("DESC")
  })

  it("marks a shared session only on the organization's own list", async () => {
    mockGet()
    const { unmount } = renderTab({ agreement: undefined })
    expect(await screen.findByText(/\(dùng chung\)/)).toBeInTheDocument()
    unmount()

    renderTab()
    await screen.findByRole("table", { name: "Lịch khám" })
    expect(screen.queryByText(/\(dùng chung\)/)).not.toBeInTheDocument()
  })

  it("reads the filters from the address and sends exactly those", async () => {
    nav.search = "sfrom=2026-10-20&sto=2026-10-22&sact=SAMPLING&sstatus=OPEN&sq=Hà%20Nội"
    const get = mockGet()
    renderTab()
    await screen.findByRole("table", { name: "Lịch khám" })

    const url = new URL(String(get.mock.calls[0][0]), "http://local")
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      from: "2026-10-20",
      to: "2026-10-22",
      activity: "SAMPLING",
      status: "OPEN",
      searchKey: "Hà Nội",
    })
    expect(screen.getByLabelText("Lọc theo loại hoạt động")).toHaveValue("SAMPLING")
    expect(screen.getByLabelText("Lọc lịch khám từ ngày")).toHaveValue("2026-10-20")
  })

  it("writes a changed filter to the address so it survives coming back", async () => {
    mockGet()
    const user = userEvent.setup()
    renderTab()
    await screen.findByRole("table", { name: "Lịch khám" })

    await user.selectOptions(screen.getByLabelText("Lọc theo loại hoạt động"), "EXAMINATION")

    expect(nav.replace).toHaveBeenCalledWith(
      "/organizations/org-1/agreements/agreement-1?sact=EXAMINATION",
      { scroll: false }
    )
  })

  it("tells an empty list apart from an empty filter result", async () => {
    mockGet({ sessions: [] })
    const first = renderTab()
    expect(
      await screen.findByText("Chưa có lịch khám nào. Tạo lịch khám để xếp người khám vào.")
    ).toBeInTheDocument()
    first.unmount()

    nav.search = "sact=SAMPLING"
    renderTab()
    expect(await screen.findByText("Không tìm thấy lịch khám phù hợp với bộ lọc.")).toBeInTheDocument()
  })

  it("requests nothing and explains the missing permission", () => {
    const get = vi.spyOn(apiClient, "get")
    renderTab({}, ["PARTICIPANT_VIEW"])

    expect(screen.getByText("Không có quyền xem")).toBeInTheDocument()
    expect(get).not.toHaveBeenCalled()
  })

  it("offers a retry when the list cannot be loaded", async () => {
    let fail = true
    vi.spyOn(apiClient, "get").mockImplementation(async () => {
      if (fail) throw new ApiClientError("Máy chủ gặp lỗi. Vui lòng thử lại sau.", 500)
      return page([SESSION_ONE]) as never
    })
    const user = userEvent.setup()
    renderTab()

    expect(await screen.findByRole("alert")).toHaveTextContent("Máy chủ gặp lỗi")
    fail = false
    await user.click(screen.getByRole("button", { name: "Thử lại" }))
    expect(await screen.findByText("20/10/2026")).toBeInTheDocument()
  })
})

describe("SessionsTab actions follow the permissions and the agreement", () => {
  it("shows create, view, edit and cancel only on an open session of an open agreement", async () => {
    mockGet()
    renderTab()

    await screen.findByText("20/10/2026")
    expect(screen.getByRole("button", { name: "Tạo lịch khám" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Xem lịch khám ngày 20/10/2026" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sửa lịch khám ngày 20/10/2026" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hủy lịch khám ngày 20/10/2026" })).toBeInTheDocument()
    // A cancelled session is history: it can be looked at and nothing else.
    expect(screen.getByRole("button", { name: "Xem lịch khám ngày 25/10/2026" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Sửa lịch khám ngày 25/10/2026" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Hủy lịch khám ngày 25/10/2026" })).not.toBeInTheDocument()
  })

  it("hides every change on an ended agreement but keeps reading", async () => {
    mockGet()
    renderTab({ agreement: { ...AGREEMENT, status: "ENDED" } })

    await screen.findByText("20/10/2026")
    expect(screen.getByRole("button", { name: "Xem lịch khám ngày 20/10/2026" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Tạo lịch khám" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Sửa lịch khám/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Hủy lịch khám/ })).not.toBeInTheDocument()
  })

  it("gives a reader only the view", async () => {
    mockGet()
    renderTab({}, [
      "HEALTH_EXAMINATION_SESSION_VIEW",
      "HEALTH_EXAMINATION_SESSION_DETAIL_VIEW",
    ])

    await screen.findByText("20/10/2026")
    expect(screen.getByRole("button", { name: "Xem lịch khám ngày 20/10/2026" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Tạo lịch khám" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Sửa lịch khám/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Hủy lịch khám/ })).not.toBeInTheDocument()
  })

  it("needs the session detail as well to edit", async () => {
    mockGet()
    renderTab({}, ["HEALTH_EXAMINATION_SESSION_VIEW", "HEALTH_EXAMINATION_SESSION_UPDATE"])

    await screen.findByText("20/10/2026")
    expect(screen.queryByRole("button", { name: /^Sửa lịch khám/ })).not.toBeInTheDocument()
  })

  it("opens the detail through the address", async () => {
    mockGet()
    const user = userEvent.setup()
    renderTab()
    await user.click(await screen.findByRole("button", { name: "Xem lịch khám ngày 20/10/2026" }))

    expect(nav.replace).toHaveBeenCalledWith(
      "/organizations/org-1/agreements/agreement-1?session=session-1",
      { scroll: false }
    )
  })
})

describe("creating a session", () => {
  async function openCreate(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole("button", { name: "Tạo lịch khám" }))
    return findDialog()
  }

  it("asks for a date and, at the organization, for the address, before any request", async () => {
    mockGet()
    const post = vi.spyOn(apiClient, "post")
    const user = userEvent.setup()
    renderTab()
    const dialog = await openCreate(user)

    await user.click(within(dialog).getByRole("button", { name: "Tạo lịch khám" }))
    expect(await within(dialog).findByText("Ngày khám là bắt buộc")).toBeInTheDocument()

    await user.selectOptions(within(dialog).getByLabelText(/^Địa điểm/), "ORGANIZATION_SITE")
    await user.type(within(dialog).getByLabelText(/Ngày khám/), "2026-10-23")
    await user.click(within(dialog).getByRole("button", { name: "Tạo lịch khám" }))

    expect(await within(dialog).findByText("Địa chỉ nơi khám tại đơn vị là bắt buộc")).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it("has no capacity and no shift to fill in", async () => {
    mockGet()
    const user = userEvent.setup()
    renderTab()
    const dialog = await openCreate(user)

    expect(within(dialog).queryByLabelText(/sức chứa|ca khám|giờ/i)).not.toBeInTheDocument()
    expect(within(dialog).getByText(/Không giới hạn số người và không chia ca/)).toBeInTheDocument()
  })

  it("posts a session reserved to the agreement when asked, and tells the user", async () => {
    mockGet()
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(session({ id: "session-9" }), 201))
    const user = userEvent.setup()
    renderTab()
    const dialog = await openCreate(user)

    await user.type(within(dialog).getByLabelText(/Ngày khám/), "2026-10-23")
    await user.selectOptions(within(dialog).getByLabelText(/Loại hoạt động/), "SAMPLING")
    await user.click(within(dialog).getByRole("checkbox", { name: /Chỉ dành cho thỏa thuận này/ }))
    await user.click(within(dialog).getByRole("button", { name: "Tạo lịch khám" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(SESSIONS, {
      sessionDate: "2026-10-23",
      activity: "SAMPLING",
      siteType: "CLINIC",
      siteAddress: "",
      agreementId: "agreement-1",
    })
    await waitFor(() => expect(queryDialog()).not.toBeInTheDocument())
    expect(await screen.findByText("Đã tạo lịch khám.")).toBeInTheDocument()
  })

  it("shares the session by default and refreshes the list", async () => {
    const get = mockGet()
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(session({ id: "session-9" }), 201))
    const user = userEvent.setup()
    renderTab()
    const dialog = await openCreate(user)
    const reads = get.mock.calls.length

    await user.type(within(dialog).getByLabelText(/Ngày khám/), "2026-10-23")
    await user.click(within(dialog).getByRole("button", { name: "Tạo lịch khám" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0][1]).not.toHaveProperty("agreementId")
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(reads))
  })

  it("keeps the dialog and explains a repeated open slot", async () => {
    mockGet()
    vi.spyOn(apiClient, "post").mockRejectedValue(new ApiClientError("x", 409, 409, "Session already exists"))
    const user = userEvent.setup()
    renderTab()
    const dialog = await openCreate(user)

    await user.type(within(dialog).getByLabelText(/Ngày khám/), "2026-10-20")
    await user.click(within(dialog).getByRole("button", { name: "Tạo lịch khám" }))

    expect(
      await within(dialog).findByText(/Đã có lịch khám đang mở cùng ngày, địa điểm và loại hoạt động/)
    ).toBeInTheDocument()
    expect(within(dialog).queryByText(/Session already exists/)).not.toBeInTheDocument()
    expect(queryDialog()).toBeInTheDocument()
  })
})

describe("editing and cancelling a session", () => {
  it("puts the version of the row into the update", async () => {
    mockGet()
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(envelope(session({ rowVersion: 4 })))
    const user = userEvent.setup()
    renderTab()
    await user.click(await screen.findByRole("button", { name: "Sửa lịch khám ngày 20/10/2026" }))
    const dialog = await findDialog()

    expect(within(dialog).getByLabelText(/Ngày khám/)).toHaveValue("2026-10-20")
    expect(within(dialog).getByLabelText(/Địa chỉ nơi khám/)).toHaveValue("1 Đường A")
    await user.clear(within(dialog).getByLabelText(/Ngày khám/))
    await user.type(within(dialog).getByLabelText(/Ngày khám/), "2026-10-21")
    await user.click(within(dialog).getByRole("button", { name: "Lưu thay đổi" }))

    await waitFor(() => expect(put).toHaveBeenCalledTimes(1))
    expect(put).toHaveBeenCalledWith(`${SESSIONS}/session-1`, {
      sessionDate: "2026-10-21",
      activity: "ALL",
      siteType: "ORGANIZATION_SITE",
      siteAddress: "1 Đường A",
      rowVersion: 3,
    })
    expect(await screen.findByText("Đã cập nhật lịch khám.")).toBeInTheDocument()
  })

  it("cancels with the version and confirms", async () => {
    mockGet()
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue(envelope(session({ id: "session-2", status: "CANCELLED", rowVersion: 1 })))
    const user = userEvent.setup()
    renderTab()
    await user.click(await screen.findByRole("button", { name: "Hủy lịch khám ngày 22/10/2026" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Hủy lịch khám" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(`${SESSIONS}/session-2/cancel`, { rowVersion: 0 })
    expect(await screen.findByText("Đã hủy lịch khám ngày 22/10/2026.")).toBeInTheDocument()
  })

  it("explains that people must be moved first when the session still has some", async () => {
    mockGet()
    vi.spyOn(apiClient, "post").mockRejectedValue(new ApiClientError("x", 409, 409, "Session has Participants"))
    const user = userEvent.setup()
    renderTab()
    await user.click(await screen.findByRole("button", { name: "Hủy lịch khám ngày 20/10/2026" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Hủy lịch khám" }))

    expect(await within(dialog).findByText(/Lịch khám còn người được xếp/)).toBeInTheDocument()
    expect(queryDialog()).toBeInTheDocument()
  })
})

describe("the people of a session", () => {
  beforeEach(() => {
    nav.search = "session=session-1"
  })

  async function openSheet() {
    mockGet()
    renderTab()
    const sheet = await screen.findByRole("dialog", { name: "Lịch khám ngày 20/10/2026" })
    await within(sheet).findByText("Nguyễn Văn A")
    return sheet
  }

  it("shows the session, its counts and each Participant with the state of the assignment", async () => {
    const sheet = await openSheet()

    expect(within(sheet).getByText("Lấy mẫu và khám")).toBeInTheDocument()
    expect(within(sheet).getByText("Đã xếp", { selector: "dt" }).nextElementSibling).toHaveTextContent("5")
    expect(within(sheet).getByText("Đã đến", { selector: "dt" }).nextElementSibling).toHaveTextContent("2")
    expect(within(sheet).getByText("Không đến", { selector: "dt" }).nextElementSibling).toHaveTextContent("1")
    const names = within(sheet).getAllByRole("row").map((item) => item.textContent)
    expect(names.join(" ")).toMatch(/Nguyễn Văn A.*Chờ khám/)
    expect(names.join(" ")).toMatch(/Trần Thị B.*Đã đến/)
    expect(names.join(" ")).toMatch(/Lê Văn C.*Không đến/)
    expect(sheet).not.toHaveTextContent("********8901")
  })

  it("offers each row only what its state allows", async () => {
    const sheet = await openSheet()

    // Waiting: attended, no-show, move, cancel.
    expect(within(sheet).getByRole("button", { name: "Ghi nhận Nguyễn Văn A đã đến" })).toBeEnabled()
    expect(within(sheet).getByRole("button", { name: "Ghi nhận Nguyễn Văn A không đến" })).toBeEnabled()
    expect(within(sheet).getByRole("button", { name: "Đổi lịch khám của Nguyễn Văn A" })).toBeEnabled()
    expect(within(sheet).getByRole("button", { name: "Hủy phân lịch của Nguyễn Văn A" })).toBeEnabled()
    // Attended: can be undone, never moved or cancelled.
    expect(within(sheet).getByRole("button", { name: "Hoàn tác ghi nhận của Trần Thị B" })).toBeEnabled()
    expect(within(sheet).queryByRole("button", { name: "Đổi lịch khám của Trần Thị B" })).not.toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: "Hủy phân lịch của Trần Thị B" })).not.toBeInTheDocument()
    // Missed: can still be corrected to attended, which is how a make-up visit is recorded.
    expect(within(sheet).getByRole("button", { name: "Ghi nhận Lê Văn C đã đến" })).toBeEnabled()
    expect(within(sheet).getByRole("button", { name: "Hoàn tác ghi nhận của Lê Văn C" })).toBeEnabled()
    expect(within(sheet).queryByRole("button", { name: "Ghi nhận Lê Văn C không đến" })).not.toBeInTheDocument()
  })

  it("records a Participant as attended with the version of the assignment", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope({
        id: "a-1",
        participantId: "p-1",
        sessionId: "session-1",
        status: "ATTENDED",
        replacedByAssignmentId: null,
        attendedAt: "2026-10-20T02:00:00Z",
        note: null,
        rowVersion: 3,
      })
    )
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Ghi nhận Nguyễn Văn A đã đến" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/a-1/attendance`, { status: "ATTENDED", rowVersion: 2 })
    expect(await screen.findByText("Đã ghi nhận Nguyễn Văn A đến khám.")).toBeInTheDocument()
  })

  it("records a no-show and undoes a mistake", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope({ id: "a-1", participantId: "p-1", sessionId: "session-1", status: "NO_SHOW", rowVersion: 3 })
    )
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Ghi nhận Nguyễn Văn A không đến" }))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0]).toEqual([`${ASSIGNMENTS}/a-1/attendance`, { status: "NO_SHOW", rowVersion: 2 }])

    await user.click(within(sheet).getByRole("button", { name: "Hoàn tác ghi nhận của Trần Thị B" }))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    expect(post.mock.calls[1]).toEqual([`${ASSIGNMENTS}/a-2/attendance`, { status: "ASSIGNED", rowVersion: 3 }])
  })

  it("explains a session that has not started yet and a stale record, without backend English", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockRejectedValueOnce(new ApiClientError("x", 409, 409, "Session has not started"))
      .mockRejectedValueOnce(new ApiClientError("x", 409, 409, "Record was changed by another request"))
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Ghi nhận Nguyễn Văn A đã đến" }))
    expect(await within(sheet).findByText(/lịch khám chưa tới ngày/)).toBeInTheDocument()

    await user.click(within(sheet).getByRole("button", { name: "Ghi nhận Nguyễn Văn A đã đến" }))
    expect(await within(sheet).findByText(/Dữ liệu đã được người khác thay đổi/)).toBeInTheDocument()
    expect(sheet).not.toHaveTextContent("Session has not started")
    expect(post).toHaveBeenCalledTimes(2)
  })

  it("moves one Participant to another open session and keeps the history on the server", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope({ id: "a-9", participantId: "p-1", sessionId: "session-2", status: "ASSIGNED", rowVersion: 0 })
    )
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Đổi lịch khám của Nguyễn Văn A" }))
    const dialog = await screen.findByRole("dialog", { name: "Đổi lịch khám" })
    // The session the Participant is in cannot be the target; a cancelled one is not offered.
    const options = within(within(dialog).getByRole("list", { name: "Lịch khám đang mở" })).getAllByRole("radio")
    expect(options).toHaveLength(1)
    await user.click(options[0])
    await user.click(within(dialog).getByRole("button", { name: "Đổi lịch" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/a-1/move`, { targetSessionId: "session-2", rowVersion: 2 })
    expect(await screen.findByText("Đã đổi lịch khám của Nguyễn Văn A.")).toBeInTheDocument()
  })

  it("keeps the picker open and explains a move the backend refuses", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(new ApiClientError("x", 409, 409, "Participant already in session"))
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Đổi lịch khám của Nguyễn Văn A" }))
    const dialog = await screen.findByRole("dialog", { name: "Đổi lịch khám" })
    await user.click(within(within(dialog).getByRole("list", { name: "Lịch khám đang mở" })).getByRole("radio"))
    await user.click(within(dialog).getByRole("button", { name: "Đổi lịch" }))

    expect(await within(dialog).findByText(/đã có trong lịch đích/)).toBeInTheDocument()
    expect(screen.getByRole("dialog", { name: "Đổi lịch khám" })).toBeInTheDocument()
  })

  it("moves the whole session when the organization changes the day, and names who stayed", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope({
        sourceSessionId: "session-1",
        targetSessionId: "session-2",
        movedCount: 4,
        skippedParticipantIds: ["p-9"],
      })
    )
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Dời cả lịch sang ngày khác" }))
    const dialog = await screen.findByRole("dialog", { name: "Dời cả lịch khám" })
    expect(within(dialog).getByText(/Người đã đến khám ở lại lịch này/)).toBeInTheDocument()
    await user.click(within(within(dialog).getByRole("list", { name: "Lịch khám đang mở" })).getByRole("radio"))
    await user.click(within(dialog).getByRole("button", { name: "Dời cả lịch" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/move`, { targetSessionId: "session-2" })
    expect(await screen.findByText("Đã dời 4 người; 1 người đã có trong lịch đích.")).toBeInTheDocument()
  })

  it("cancels the assignment of a waiting Participant with the note, keeping them on the roster", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope({ id: "a-1", participantId: "p-1", sessionId: "session-1", status: "CANCELLED", rowVersion: 3 })
    )
    const sheet = await openSheet()
    const user = userEvent.setup()

    await user.click(within(sheet).getByRole("button", { name: "Hủy phân lịch của Nguyễn Văn A" }))
    const dialog = await screen.findByRole("dialog", { name: "Hủy phân lịch" })
    expect(within(dialog).getByText(/vẫn ở trong danh sách/)).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText(/Lý do/), "Nghỉ phép")
    await user.click(within(dialog).getByRole("button", { name: "Hủy phân lịch" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/a-1/cancel`, { rowVersion: 2, note: "Nghỉ phép" })
    expect(await screen.findByText("Đã hủy phân lịch của Nguyễn Văn A.")).toBeInTheDocument()
  })

  it("filters the people by status through the backend", async () => {
    const sheet = await openSheet()
    const get = vi.mocked(apiClient.get)
    const user = userEvent.setup()

    await user.selectOptions(within(sheet).getByLabelText("Lọc theo trạng thái phân lịch"), "NO_SHOW")

    await waitFor(() =>
      expect(
        get.mock.calls.some(([path]) => String(path).startsWith(ASSIGNMENTS) && String(path).includes("status=NO_SHOW"))
      ).toBe(true)
    )
  })

  it("shows the people but no action to an account that can only read them", async () => {
    mockGet()
    renderTab({}, [
      "HEALTH_EXAMINATION_SESSION_VIEW",
      "HEALTH_EXAMINATION_SESSION_DETAIL_VIEW",
      "HEALTH_EXAMINATION_ASSIGNMENT_VIEW",
    ])
    const sheet = await screen.findByRole("dialog", { name: "Lịch khám ngày 20/10/2026" })
    await within(sheet).findByText("Nguyễn Văn A")

    expect(within(sheet).queryByRole("button", { name: /^Ghi nhận/ })).not.toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: /^Đổi lịch khám của/ })).not.toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: /^Hủy phân lịch của/ })).not.toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: "Dời cả lịch sang ngày khác" })).not.toBeInTheDocument()
  })

  it("does not list the people without the permission to see them", async () => {
    const get = mockGet()
    renderTab({}, ["HEALTH_EXAMINATION_SESSION_VIEW", "HEALTH_EXAMINATION_SESSION_DETAIL_VIEW"])
    const sheet = await screen.findByRole("dialog", { name: "Lịch khám ngày 20/10/2026" })

    expect(
      await within(sheet).findByText(/chưa được cấp quyền xem người khám trong lịch khám/)
    ).toBeInTheDocument()
    expect(get.mock.calls.some(([path]) => String(path).includes("/assignments"))).toBe(false)
  })

  it("offers no change on an ended agreement", async () => {
    mockGet()
    renderTab({ agreement: { ...AGREEMENT, status: "ENDED" } })
    const sheet = await screen.findByRole("dialog", { name: "Lịch khám ngày 20/10/2026" })
    await within(sheet).findByText("Nguyễn Văn A")

    expect(within(sheet).queryByRole("button", { name: /^Ghi nhận/ })).not.toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: /^Đổi lịch khám của/ })).not.toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: "Dời cả lịch sang ngày khác" })).not.toBeInTheDocument()
  })

  it("explains an empty session", async () => {
    mockGet({ rows: [] })
    renderTab()
    const sheet = await screen.findByRole("dialog", { name: "Lịch khám ngày 20/10/2026" })

    expect(await within(sheet).findByText("Chưa có người khám nào trong lịch này.")).toBeInTheDocument()
  })
})
