import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { UserSession } from "../types"
import { SESSION_QUERY_KEY } from "../utils/session-cache"
import { RoleListPage } from "../pages/role-list-page"
import {
  mockRoleFetch,
  patientRole,
  receptionistRole,
  roleAdministratorSession,
} from "./role-fixtures"
import { jsonResponse, sessionWith } from "./staff-member-fixtures"

const push = vi.fn()
const navigation = vi.hoisted(() => ({ query: "" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push }),
  usePathname: () => "/roles",
  useSearchParams: () => new URLSearchParams(navigation.query),
}))

function renderPage(session: UserSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(SESSION_QUERY_KEY, session)
  return render(
    <QueryClientProvider client={client}>
      <RoleListPage />
    </QueryClientProvider>
  )
}

function bodies(fetchMock: ReturnType<typeof mockRoleFetch>, method: string) {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method === method)
    .map(([, init]) => JSON.parse(String(init?.body)))
}

describe("RoleListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigation.query = ""
  })
  afterEach(() => vi.unstubAllGlobals())

  it("lists roles with their counts, status and actions", async () => {
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    const row = (await screen.findByText("Lễ tân")).closest("tr") as HTMLElement
    expect(within(row).getByText("Registers patients, collects payments")).toBeInTheDocument()
    expect(within(row).getAllByText("2")).toHaveLength(2)
    expect(within(row).getByText("Hoạt động")).toBeInTheDocument()
    expect(screen.getByText("Ngừng hoạt động", { selector: "span" })).toBeInTheDocument()
    expect(screen.getByText("Điều dưỡng")).toBeInTheDocument()
    expect(screen.queryByText("RECEPTIONIST")).not.toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: "Mã" })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText("Tìm theo tên vai trò...")).toBeInTheDocument()

    await userEvent.click(within(row).getByRole("button", { name: "Phân quyền vai trò Lễ tân" }))
    expect(push).toHaveBeenCalledWith("/roles/permissions?roleId=role-receptionist")
  })

  it("loads every role once and searches the Vietnamese names on screen", async () => {
    navigation.query = "q=l%E1%BB%85+t%C3%A2n"
    const fetchMock = mockRoleFetch()
    renderPage(roleAdministratorSession)

    expect(await screen.findByText("Lễ tân")).toBeInTheDocument()
    expect(screen.queryByText("Quản trị viên")).not.toBeInTheDocument()
    expect(screen.queryByText("Điều dưỡng")).not.toBeInTheDocument()
    const listCalls = fetchMock.mock.calls
      .map(([input]) => new URL(String(input)))
      .filter((url) => url.pathname === "/api/v1/admin/roles")
    expect(listCalls.length).toBeGreaterThan(0)
    for (const url of listCalls) {
      expect([...url.searchParams.keys()].sort()).toEqual(["page", "size"])
      expect(url.searchParams.get("size")).toBe("100")
    }
  })

  it("shows the no-result message when no Vietnamese name matches", async () => {
    navigation.query = "q=Receptionist"
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    expect(await screen.findByText("Không có kết quả tìm kiếm")).toBeInTheDocument()
  })

  it("shows only the actions the session holds", async () => {
    mockRoleFetch()
    renderPage(sessionWith(["ROLE_MANAGE"]))

    expect(await screen.findByText("Lễ tân")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Thêm vai trò" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Sửa vai trò/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Phân quyền vai trò/ })).not.toBeInTheDocument()
  })

  it("shows a permission notice and does not call the backend without the view permission", () => {
    const fetchMock = mockRoleFetch()
    renderPage(sessionWith(["ROLE_CREATE"]))

    expect(screen.getByRole("alert")).toHaveTextContent("chưa được cấp quyền xem danh sách vai trò")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("offers copying permissions only to a session that may assign them", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    const view = renderPage(roleAdministratorSession)
    await user.click(await screen.findByRole("button", { name: "Thêm vai trò" }))
    expect(await screen.findByText("Sao chép quyền từ")).toBeInTheDocument()
    view.unmount()

    renderPage(sessionWith(["ROLE_MANAGE", "ROLE_CREATE"]))
    await user.click(await screen.findByRole("button", { name: "Thêm vai trò" }))
    expect(await screen.findByLabelText(/Tên vai trò/)).toBeInTheDocument()
    expect(screen.queryByText("Sao chép quyền từ")).not.toBeInTheDocument()
  })

  it("creates a role and shows a duplicated code under its field", async () => {
    const user = userEvent.setup()
    let created = false
    const fetchMock = mockRoleFetch({
      createResponse: () => {
        if (created) return jsonResponse({ result: "OK", code: 201, data: receptionistRole }, 201)
        created = true
        return jsonResponse(
          {
            result: "NG",
            code: 409,
            message: "Duplicate value: code",
            data: [{ field: "code", code: "Duplicate", message: "Role code already exists" }],
          },
          409
        )
      },
    })
    renderPage(roleAdministratorSession)
    await screen.findByText("Lễ tân")

    await user.click(screen.getByRole("button", { name: "Thêm vai trò" }))
    await user.click(await screen.findByRole("button", { name: "Tạo vai trò" }))
    expect(await screen.findByText("Tên vai trò là bắt buộc")).toBeInTheDocument()
    expect(screen.getByText("Mã vai trò là bắt buộc")).toBeInTheDocument()
    expect(bodies(fetchMock, "POST")).toEqual([])

    await user.type(screen.getByLabelText(/^Tên vai trò/), "Nurse 2")
    await user.type(screen.getByLabelText(/^Mã vai trò/), "nurse")
    await user.click(screen.getByRole("button", { name: "Tạo vai trò" }))

    expect(await screen.findByText("Mã vai trò đã tồn tại")).toBeInTheDocument()
    expect(bodies(fetchMock, "POST")).toEqual([{ code: "NURSE", name: "Nurse 2", active: true }])

    await user.click(screen.getByRole("button", { name: "Tạo vai trò" }))
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Tạo vai trò" })).not.toBeInTheDocument()
    )
  })

  it("asks before closing a panel with unsaved changes", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    renderPage(roleAdministratorSession)
    await screen.findByText("Lễ tân")

    await user.click(screen.getByRole("button", { name: "Thêm vai trò" }))
    await user.type(await screen.findByLabelText(/^Tên vai trò/), "Draft")
    await user.click(screen.getByRole("button", { name: "Hủy" }))

    expect(await screen.findByText("Bỏ thay đổi chưa lưu?")).toBeInTheDocument()
  })

  it("updates a role with the version it was read at", async () => {
    const user = userEvent.setup()
    const fetchMock = mockRoleFetch()
    renderPage(roleAdministratorSession)

    await user.click(await screen.findByRole("button", { name: "Sửa vai trò Lễ tân" }))
    expect(await screen.findByDisplayValue("RECEPTIONIST")).toBeDisabled()
    await user.click(screen.getByRole("checkbox", { name: "Hoạt động" }))
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))

    await waitFor(() =>
      expect(bodies(fetchMock, "PUT")).toEqual([
        {
          // Only the status changed: the stored seed name is sent back, not its Vietnamese label.
          name: "Receptionist",
          description: "Registers patients, collects payments",
          active: false,
          rowVersion: 3,
        },
      ])
    )
  })

  it("keeps the Administrator role active", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    await user.click(await screen.findByRole("button", { name: "Sửa vai trò Quản trị viên" }))
    expect(await screen.findByRole("checkbox", { name: "Hoạt động" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
  })

  it("lists and searches roles beyond the first 100", async () => {
    const roles = Array.from({ length: 101 }, (_, index) => ({
      ...receptionistRole,
      id: `role-${index}`,
      code: `ROLE_${String(index).padStart(3, "0")}`,
      name: index === 100 ? "Kỹ thuật viên xét nghiệm" : `Vai trò ${index}`,
      description: null,
    }))
    navigation.query = "q=k%E1%BB%B9+thu%E1%BA%ADt"
    mockRoleFetch({ roles })
    renderPage(roleAdministratorSession)

    expect(await screen.findByText("Kỹ thuật viên xét nghiệm")).toBeInTheDocument()
    expect(screen.queryByText(/vai trò đầu tiên/)).not.toBeInTheDocument()
  })

  it("asks before Sửa quyền drops the edited role details", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    await user.click(await screen.findByRole("button", { name: "Sửa vai trò Lễ tân" }))
    await user.type(await screen.findByLabelText(/^Tên vai trò/), " ca sáng")
    await user.click(screen.getByRole("button", { name: "Sửa quyền" }))

    expect(await screen.findByText("Bỏ thay đổi chưa lưu?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Tiếp tục chỉnh sửa" }))
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/^Tên vai trò/)).toHaveValue("Lễ tân ca sáng")

    await user.click(screen.getByRole("button", { name: "Sửa quyền" }))
    await user.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }))
    expect(push).toHaveBeenCalledWith("/roles/permissions?roleId=role-receptionist")
  })

  it("rejects a name another role shows, on create and on rename", async () => {
    const user = userEvent.setup()
    const fetchMock = mockRoleFetch()
    renderPage(roleAdministratorSession)
    await screen.findByText("Lễ tân")

    await user.click(screen.getByRole("button", { name: "Thêm vai trò" }))
    await user.type(await screen.findByLabelText(/^Tên vai trò/), "lễ tân")
    await user.type(screen.getByLabelText(/^Mã vai trò/), "FRONT_OFFICE")
    await user.click(screen.getByRole("button", { name: "Tạo vai trò" }))
    expect(await screen.findByText("Tên vai trò đã tồn tại")).toBeInTheDocument()
    expect(bodies(fetchMock, "POST")).toEqual([])
    await user.click(screen.getByRole("button", { name: "Hủy" }))
    await user.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }))

    await user.click(await screen.findByRole("button", { name: "Sửa vai trò Điều dưỡng" }))
    const name = await screen.findByLabelText(/^Tên vai trò/)
    await user.clear(name)
    await user.type(name, "Quản trị viên")
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
    expect(await screen.findByText("Tên vai trò đã tồn tại")).toBeInTheDocument()
    expect(bodies(fetchMock, "PUT")).toEqual([])
  })

  it("opens Sửa quyền at once when nothing was edited", async () => {
    const user = userEvent.setup()
    mockRoleFetch()
    renderPage(roleAdministratorSession)

    await user.click(await screen.findByRole("button", { name: "Sửa vai trò Lễ tân" }))
    await user.click(await screen.findByRole("button", { name: "Sửa quyền" }))

    expect(push).toHaveBeenCalledWith("/roles/permissions?roleId=role-receptionist")
    expect(screen.queryByText("Bỏ thay đổi chưa lưu?")).not.toBeInTheDocument()
  })

  it("keeps the Patient role active", async () => {
    const user = userEvent.setup()
    mockRoleFetch({ roles: [patientRole] })
    renderPage(roleAdministratorSession)

    await user.click(await screen.findByRole("button", { name: "Sửa vai trò Bệnh nhân" }))
    expect(await screen.findByRole("checkbox", { name: "Hoạt động" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
    expect(screen.getByText(/Vai trò Bệnh nhân luôn hoạt động/)).toBeInTheDocument()
  })
})
