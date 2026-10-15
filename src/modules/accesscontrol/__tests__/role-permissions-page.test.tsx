import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { UserSession } from "../types"
import { SESSION_QUERY_KEY } from "../utils/session-cache"
import { RolePermissionsPage } from "../pages/role-permissions-page"
import { mockRoleFetch, roleAdministratorSession } from "./role-fixtures"
import { jsonResponse, sessionWith } from "./staff-member-fixtures"

const navigation = vi.hoisted(() => ({ roleId: "role-receptionist" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/roles/permissions",
  useSearchParams: () => new URLSearchParams({ roleId: navigation.roleId }),
}))

function renderPage(session: UserSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(SESSION_QUERY_KEY, session)
  return render(
    <QueryClientProvider client={client}>
      <RolePermissionsPage />
    </QueryClientProvider>
  )
}

function permissionRow(name: string) {
  return screen.getByText(name).closest('[data-slot="permission-row"]') as HTMLElement
}

function moduleCard(name: string) {
  return screen.getByRole("region", { name })
}

describe("RolePermissionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigation.roleId = "role-receptionist"
  })
  afterEach(() => vi.unstubAllGlobals())

  it("groups permissions by module with counts and the sensitive label", async () => {
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    expect(await screen.findByText("Hoàn tiền")).toBeInTheDocument()
    expect(within(moduleCard("Hóa đơn và thanh toán")).getByText("1/2 quyền")).toBeInTheDocument()
    expect(within(moduleCard("Bệnh nhân")).getByText("1/2 quyền")).toBeInTheDocument()
    // The module title is one step larger than the permission names (text-sm).
    expect(screen.getByRole("heading", { name: "Bệnh nhân", level: 3 })).toHaveClass("text-base")
    expect(within(permissionRow("Hoàn tiền")).getByText("Nhạy cảm")).toBeInTheDocument()
    expect(screen.queryByText("UC-046")).not.toBeInTheDocument()
    expect(screen.queryByText("PAYMENT_REFUND")).not.toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: "Mã" })).not.toBeInTheDocument()
    expect(screen.getByText(/Thay đổi chờ lưu/)).toHaveTextContent("0 cấp · 0 gỡ")
  })

  it("folds a module and opens every module while searching", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    renderPage(roleAdministratorSession)
    await screen.findByText("Hoàn tiền")

    await user.click(screen.getByRole("button", { name: "Thu gọn nhóm Hóa đơn và thanh toán" }))
    expect(screen.queryByText("Hoàn tiền")).not.toBeInTheDocument()
    expect(within(moduleCard("Hóa đơn và thanh toán")).getByText("1/2 quyền")).toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: "Tìm quyền" }), "hoàn")
    expect(await screen.findByText("Hoàn tiền")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /nhóm Hóa đơn và thanh toán/ })
    ).not.toBeInTheDocument()
  })

  it("marks pending changes and saves only them with the role version", async () => {
    const user = userEvent.setup()
    const fetchMock = mockRoleFetch()
    renderPage(roleAdministratorSession)
    await screen.findByText("Hoàn tiền")

    await user.click(within(permissionRow("Tạo hồ sơ bệnh nhân")).getByRole("checkbox"))
    await user.click(within(permissionRow("Hoàn tiền")).getByRole("checkbox"))

    expect(within(permissionRow("Tạo hồ sơ bệnh nhân")).getByText("+ Cấp")).toBeInTheDocument()
    expect(within(permissionRow("Hoàn tiền")).getByText("− Gỡ")).toBeInTheDocument()
    expect(screen.getByText(/Thay đổi chờ lưu/)).toHaveTextContent("1 cấp · 1 gỡ")

    await user.click(screen.getByRole("button", { name: "Lưu quyền" }))

    await waitFor(() =>
      expect(
        fetchMock.mock.calls
          .filter(([, init]) => init?.method === "PUT")
          .map(([, init]) => JSON.parse(String(init?.body)))
      ).toEqual([{ rowVersion: 3, grant: ["PATIENT_CREATE"], revoke: ["PAYMENT_REFUND"] }])
    )
    await waitFor(() =>
      expect(screen.getByText(/Thay đổi chờ lưu/)).toHaveTextContent("0 cấp · 0 gỡ")
    )
  })

  it("discards pending changes and filters by permission name", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    renderPage(roleAdministratorSession)
    await screen.findByText("Hoàn tiền")

    await user.click(within(permissionRow("Tạo hồ sơ bệnh nhân")).getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: "Huỷ thay đổi" }))
    expect(screen.getByText(/Thay đổi chờ lưu/)).toHaveTextContent("0 cấp · 0 gỡ")

    await user.type(screen.getByRole("textbox", { name: "Tìm quyền" }), "lịch sử thanh toán")
    await waitFor(() => expect(screen.queryByText("Hoàn tiền")).not.toBeInTheDocument())
    expect(screen.getByText("Xem chi phí và lịch sử thanh toán của lượt khám")).toBeInTheDocument()
  })

  it("keeps the pending changes and offers a reload when the role changed meanwhile", async () => {
    const user = userEvent.setup()
    mockRoleFetch({
      savePermissionsResponse: () =>
        jsonResponse({ result: "NG", code: 409, message: "Record was changed by another request" }, 409),
    })
    renderPage(roleAdministratorSession)
    await screen.findByText("Hoàn tiền")

    await user.click(within(permissionRow("Tạo hồ sơ bệnh nhân")).getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: "Lưu quyền" }))

    expect(await screen.findByText(/vừa được người khác thay đổi/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tải lại" })).toBeInTheDocument()
    expect(screen.getByText(/Thay đổi chờ lưu/)).toHaveTextContent("1 cấp · 0 gỡ")
  })

  it("locks every checkbox of an inactive role", async () => {
    navigation.roleId = "role-nurse"
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    expect(await screen.findByText(/Vai trò đang ngừng hoạt động/)).toBeInTheDocument()
    expect(within(permissionRow("Hoàn tiền")).getByRole("checkbox")).toHaveAttribute(
      "aria-disabled",
      "true"
    )
  })

  it("keeps the role administration permissions on the Administrator role", async () => {
    navigation.roleId = "role-administrator"
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    await screen.findByText("Cấp hoặc gỡ quyền của vai trò")
    const row = permissionRow("Cấp hoặc gỡ quyền của vai trò")
    expect(within(row).getByRole("checkbox")).toHaveAttribute("aria-disabled", "true")
    expect(within(row).getByText("Bắt buộc với vai trò Quản trị viên")).toBeInTheDocument()
    expect(within(permissionRow("Hoàn tiền")).getByRole("checkbox")).not.toHaveAttribute(
      "aria-disabled",
      "true"
    )
  })

  it("shows a permission notice without the view permissions", () => {
    const fetchMock = mockRoleFetch()
    renderPage(sessionWith(["ROLE_PERMISSION_VIEW"]))

    expect(screen.getByRole("alert")).toHaveTextContent("chưa được cấp quyền xem quyền của vai trò")
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
