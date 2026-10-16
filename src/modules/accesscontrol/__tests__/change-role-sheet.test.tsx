import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
  staffMemberFixture,
} from "./staff-member-fixtures"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/staff-members",
  useSearchParams: () => new URLSearchParams(),
}))

const withoutAccount = {
  ...staffMemberFixture,
  id: "staff-3",
  staffCode: "NV-0003",
  fullName: "Lê Thu Hà",
  account: null,
}

const lockedStaffMember = {
  ...staffMemberFixture,
  id: "staff-2",
  staffCode: "NV-0002",
  fullName: "Đỗ Mai Anh",
  account: { ...staffMemberFixture.account!, id: "account-2", username: "anhdm1", status: "LOCKED" as const },
}

function renderPage(session: UserSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(SESSION_QUERY_KEY, session)
  return render(
    <QueryClientProvider client={client}>
      <StaffMemberListPage />
    </QueryClientProvider>
  )
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Đổi vai trò của Nguyễn Văn An" }))
  return screen.findByRole("dialog")
}

describe("Change Role panel (UC-010)", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it("offers the action only to sessions that may change roles, and only for active accounts", async () => {
    mockStaffMemberFetch({ staffMembers: [staffMemberFixture, lockedStaffMember, withoutAccount] })
    const view = renderPage(administratorSession)

    expect(await screen.findByRole("button", { name: "Đổi vai trò của Nguyễn Văn An" })).toBeEnabled()
    const locked = screen.getByRole("button", { name: "Đổi vai trò của Đỗ Mai Anh" })
    expect(locked).toBeDisabled()
    expect(locked).toHaveAttribute("title", "Chỉ đổi vai trò cho tài khoản đang hoạt động")
    const noAccount = screen.getByRole("button", { name: "Đổi vai trò của Lê Thu Hà" })
    expect(noAccount).toBeDisabled()
    expect(noAccount).toHaveAttribute("title", "Nhân viên chưa có tài khoản")
    view.unmount()

    renderPage(sessionWith(["STAFF_MEMBER_VIEW", "ROLE_VIEW", "USER_ACCOUNT_CREATE"]))
    expect(await screen.findByText("NV-0001")).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: "Thao tác" })).not.toBeInTheDocument()
  })

  it("filters the roles, shows the permission count and saves the new role with the account version", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch()
    renderPage(administratorSession)

    const panel = await openPanel(user)
    expect(within(panel).getByText("Vai trò hiện tại").nextElementSibling).toHaveTextContent("Bác sĩ đa khoa")
    const save = within(panel).getByRole("button", { name: "Lưu thay đổi" })
    expect(save).toBeDisabled()

    await user.type(within(panel).getByRole("textbox", { name: "Tìm vai trò" }), "xyz")
    expect(within(panel).getByText("Không có kết quả tìm kiếm.")).toBeInTheDocument()
    await user.clear(within(panel).getByRole("textbox", { name: "Tìm vai trò" }))
    await user.type(within(panel).getByRole("textbox", { name: "Tìm vai trò" }), "lễ")
    expect(within(panel).queryByRole("radio", { name: /Bác sĩ đa khoa/ })).not.toBeInTheDocument()

    await user.click(within(panel).getByRole("radio", { name: /Lễ tân/ }))
    expect(
      within(panel).getByText("Lễ tân", { selector: "span.font-semibold" }).parentElement
    ).toHaveTextContent("Lễ tân: 24 quyền")
    expect(save).toBeEnabled()
    await user.click(save)

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    const put = fetchMock.mock.calls.find(([, init]) => init?.method === "PUT")
    expect(new URL(String(put?.[0])).pathname).toBe("/api/v1/accounts/account-1/role")
    expect(JSON.parse(String(put?.[1]?.body))).toEqual({ roleCode: "RECEPTIONIST", rowVersion: 3 })
  })

  it("keeps the current role from being saved again", async () => {
    const user = userEvent.setup()
    mockStaffMemberFetch()
    renderPage(administratorSession)

    const panel = await openPanel(user)
    await user.click(within(panel).getByRole("radio", { name: /Bác sĩ đa khoa/ }))

    expect(within(panel).getByText("(hiện tại)")).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: "Lưu thay đổi" })).toBeDisabled()
  })

  it.each([
    [
      "the last Administrator (MSG12)",
      () =>
        jsonResponse(
          {
            result: "NG",
            code: 409,
            message: "Conflicting value: roleCode",
            data: [{ field: "roleCode", code: "LastAdministrator", message: "x" }],
          },
          409
        ),
      "annv1 là tài khoản Quản trị viên duy nhất đang hoạt động",
    ],
    [
      "a change made by another user (MSG13)",
      () => jsonResponse({ result: "NG", code: 409, message: "Record was changed by another request" }, 409),
      "Vai trò của annv1 vừa được người khác thay đổi",
    ],
    [
      "a role deactivated meanwhile (MSG11)",
      () =>
        jsonResponse(
          {
            result: "NG",
            code: 422,
            message: "The role is not available",
            data: [{ field: "roleCode", code: "UnavailableRole", message: "x" }],
          },
          422
        ),
      "Vai trò Lễ tân không còn hoạt động",
    ],
    [
      "an account locked meanwhile",
      () =>
        jsonResponse(
          {
            result: "NG",
            code: 422,
            message: "The account is not an active staff account",
            data: [{ field: "accountId", code: "InactiveAccount", message: "x" }],
          },
          422
        ),
      "Tài khoản không còn hoạt động",
    ],
  ])("keeps the panel open and explains %s", async (_, response, message) => {
    const user = userEvent.setup()
    mockStaffMemberFetch({ changeRoleResponse: response })
    renderPage(administratorSession)

    const panel = await openPanel(user)
    await user.click(within(panel).getByRole("radio", { name: /Lễ tân/ }))
    await user.click(within(panel).getByRole("button", { name: "Lưu thay đổi" }))

    expect(await within(panel).findByRole("alert")).toHaveTextContent(message)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("stays open while the save is in flight, so its error is still shown", async () => {
    const user = userEvent.setup()
    let answer: (response: Response) => void = () => undefined
    mockStaffMemberFetch({
      changeRoleResponse: () => new Promise<Response>((resolve) => (answer = resolve)),
    })
    renderPage(administratorSession)

    const panel = await openPanel(user)
    await user.click(within(panel).getByRole("radio", { name: /Lễ tân/ }))
    await user.click(within(panel).getByRole("button", { name: "Lưu thay đổi" }))
    await user.keyboard("{Escape}")
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    answer(
      jsonResponse(
        {
          result: "NG",
          code: 409,
          message: "Conflicting value: roleCode",
          data: [{ field: "roleCode", code: "LastAdministrator", message: "x" }],
        },
        409
      )
    )
    expect(await within(panel).findByRole("alert")).toHaveTextContent("Quản trị viên duy nhất")
  })

  it("reloads the staff list after a rejected change, so the panel opened again uses the latest version", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch({
      changeRoleResponse: () =>
        jsonResponse({ result: "NG", code: 409, message: "Record was changed by another request" }, 409),
    })
    renderPage(administratorSession)
    const listReads = () =>
      fetchMock.mock.calls.filter(
        ([input, init]) =>
          new URL(String(input)).pathname === "/api/v1/staff-members" && (init?.method ?? "GET") === "GET"
      ).length

    const panel = await openPanel(user)
    const before = listReads()
    await user.click(within(panel).getByRole("radio", { name: /Lễ tân/ }))
    await user.click(within(panel).getByRole("button", { name: "Lưu thay đổi" }))

    await within(panel).findByRole("alert")
    await waitFor(() => expect(listReads()).toBeGreaterThan(before))
  })

  it("lists the roles by the Vietnamese name shown on screen", async () => {
    const user = userEvent.setup()
    mockStaffMemberFetch()
    renderPage(administratorSession)

    const panel = await openPanel(user)
    expect(
      within(panel)
        .getAllByRole("radio")
        .map((radio) => radio.closest("label")?.textContent)
    ).toEqual([
      expect.stringContaining("Bác sĩ đa khoa"),
      expect.stringContaining("Lễ tân"),
    ])
  })

  it("shows the permissions of the selected role, read-only, to sessions that may read them", async () => {
    const user = userEvent.setup()
    mockStaffMemberFetch()
    renderPage(
      sessionWith([
        "STAFF_MEMBER_VIEW",
        "ROLE_VIEW",
        "USER_ROLE_ASSIGN",
        "ROLE_PERMISSION_VIEW",
        "PERMISSION_VIEW",
      ])
    )

    const panel = await openPanel(user)
    await user.click(within(panel).getByRole("radio", { name: /Lễ tân/ }))
    await user.click(within(panel).getByRole("button", { name: "Xem quyền" }))

    expect(await within(panel).findByText("Tìm bệnh nhân và xem thông tin tóm tắt")).toBeInTheDocument()
    expect(within(panel).getByText("Hoàn tiền")).toBeInTheDocument()
    expect(within(panel).getByText("Hóa đơn và thanh toán")).toBeInTheDocument()
    expect(within(panel).queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("hides the permission list without the permission to read it", async () => {
    const user = userEvent.setup()
    mockStaffMemberFetch()
    renderPage(administratorSession)

    const panel = await openPanel(user)
    await user.click(within(panel).getByRole("radio", { name: /Lễ tân/ }))

    expect(within(panel).queryByRole("button", { name: "Xem quyền" })).not.toBeInTheDocument()
  })
})
