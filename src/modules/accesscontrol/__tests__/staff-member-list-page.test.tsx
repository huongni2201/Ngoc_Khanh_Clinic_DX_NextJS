import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { UserSession } from "../types"
import { SESSION_QUERY_KEY } from "../utils/session-cache"
import { StaffMemberListPage } from "../pages/staff-member-list-page"
import {
  administratorSession,
  jsonResponse,
  mockStaffMemberFetch,
  sessionWith,
} from "./staff-member-fixtures"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/staff-members",
  useSearchParams: () => new URLSearchParams(),
}))

function renderPage(session: UserSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(SESSION_QUERY_KEY, session)
  return render(
    <QueryClientProvider client={client}>
      <StaffMemberListPage />
    </QueryClientProvider>
  )
}

describe("StaffMemberListPage", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it("lists staff members with their username, roles and status", async () => {
    mockStaffMemberFetch()
    renderPage(administratorSession)

    expect(await screen.findByText("NV-0001")).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument()
    expect(screen.getAllByText("annv1").length).toBeGreaterThan(0)
    expect(screen.getByText("Bác sĩ đa khoa")).toBeInTheDocument()
    expect(screen.getByText("Đang làm việc")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Thêm nhân viên" })).toBeInTheDocument()
  })

  it("hides the create action without the create, role-assign and role-view permissions", async () => {
    mockStaffMemberFetch()
    renderPage(sessionWith(["STAFF_MEMBER_VIEW", "USER_ACCOUNT_CREATE"]))

    expect(await screen.findByText("NV-0001")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Thêm nhân viên" })).not.toBeInTheDocument()
  })

  it("shows a permission notice and does not call the backend without the view permission", () => {
    const fetchMock = mockStaffMemberFetch()
    renderPage(sessionWith([]))

    expect(screen.getByRole("alert")).toHaveTextContent("chưa được cấp quyền xem danh sách nhân viên")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows the backend failure with a retry action instead of an empty list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ result: "NG", code: 403, message: "Forbidden" }, 403))
    )
    renderPage(administratorSession)

    expect(await screen.findByText("Không được phép thực hiện thao tác này.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument()
    expect(screen.queryByText("Chưa có nhân viên nào")).not.toBeInTheDocument()
  })
})
