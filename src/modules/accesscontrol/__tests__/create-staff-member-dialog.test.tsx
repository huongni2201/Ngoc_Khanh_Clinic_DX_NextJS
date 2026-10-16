import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithClient } from "@/test-utils/render-with-client"
import { CreateStaffMemberDialog } from "../components/create-staff-member-dialog"
import { jsonResponse, mockStaffMemberFetch, rolesFixture, staffMemberFixture } from "./staff-member-fixtures"

const onOpenChange = vi.fn()

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Họ và tên/), "Nguyễn Văn An")
  await user.type(screen.getByLabelText(/^Mật khẩu tạm/), "Tam@12345")
  await user.click(await screen.findByRole("radio", { name: /Bác sĩ đa khoa/ }))
}

function postBodies(fetchMock: ReturnType<typeof mockStaffMemberFetch>) {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method === "POST")
    .map(([, init]) => JSON.parse(String(init?.body)))
}

describe("CreateStaffMemberDialog", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it("previews the username prefix and loads the assignable roles", async () => {
    const user = userEvent.setup()
    mockStaffMemberFetch()
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)

    expect(await screen.findByRole("radio", { name: /Lễ tân/ })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/^Họ và tên/), "Nguyễn Văn An")
    expect(screen.getByTestId("username-preview")).toHaveTextContent("annv…")
    expect(screen.queryByLabelText(/Mã nhân viên/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Tên đăng nhập/)).not.toBeInTheDocument()
  })

  it("validates required fields before calling the backend", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch()
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)
    await screen.findByRole("radio", { name: /Lễ tân/ })

    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(await screen.findByText("Họ và tên là bắt buộc")).toBeInTheDocument()
    expect(screen.getByText("Vui lòng chọn một vai trò")).toBeInTheDocument()
    expect(postBodies(fetchMock)).toEqual([])
  })

  it("creates the staff member, shows the generated username once and clears the password", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch()
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(await screen.findByText("Đã tạo nhân viên và tài khoản")).toBeInTheDocument()
    expect(screen.getByText("annv1")).toBeInTheDocument()
    expect(screen.getByText("NV-0001")).toBeInTheDocument()
    expect(postBodies(fetchMock)).toEqual([
      { fullName: "Nguyễn Văn An", initialPassword: "Tam@12345", roleCode: "GENERAL_PRACTITIONER" },
    ])
    expect(screen.queryByDisplayValue("Tam@12345")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Thêm nhân viên khác" }))
    expect(screen.getByLabelText(/^Họ và tên/)).toHaveValue("")
    expect(screen.getByLabelText(/^Mật khẩu tạm/)).toHaveValue("")
  })

  it("reloads the roles and clears a role that is no longer available after a 422", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch({
      roles: [rolesFixture, [rolesFixture[1]]],
      createResponse: () =>
        jsonResponse({ result: "NG", code: 422, message: "The role is not available" }, 422),
    })
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(await screen.findByText(/Vai trò đã chọn không còn khả dụng/)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole("radio", { name: /Bác sĩ đa khoa/ })).not.toBeInTheDocument()
    )
    expect(await screen.findByText("Vui lòng chọn một vai trò")).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/api/v1/roles"))).toHaveLength(2)
  })

  it("keeps the chosen role and asks to submit again when a generated identity collided", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch({
      createResponse: () =>
        jsonResponse({ result: "NG", code: 409, message: "Duplicate" }, 409),
    })
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(await screen.findByText(/vừa bị trùng với dữ liệu khác/)).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Bác sĩ đa khoa/ })).toBeChecked()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/api/v1/roles"))).toHaveLength(1)
  })

  it("marks the field the backend rejected", async () => {
    const user = userEvent.setup()
    mockStaffMemberFetch({
      createResponse: () =>
        jsonResponse(
          {
            result: "NG",
            code: 400,
            message: "Invalid request: initialPassword",
            data: [{ field: "initialPassword", code: "Size", message: "too long" }],
          },
          400
        ),
    })
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(
      await screen.findByText("Mật khẩu tạm không hợp lệ (8–72 ký tự không dấu, không dấu cách)")
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^Mật khẩu tạm/)).toHaveAttribute("aria-invalid", "true")
    expect(screen.queryByText("too long")).not.toBeInTheDocument()
  })

  it("creates one clinic manager role through the existing staff form and explains catalog access", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch({
      roles: [[...rolesFixture, { id: "role-manager", code: "CLINIC_MANAGER", name: "Clinic Manager", description: "Manages the clinic" }]],
      createResponse: () => jsonResponse({ result: "OK", code: 201, data: {
        ...staffMemberFixture,
        account: { ...staffMemberFixture.account, roleCode: "CLINIC_MANAGER" },
      } }, 201),
    })
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)
    await user.type(screen.getByLabelText(/^Họ và tên/), "Nguyễn Văn An")
    await user.type(screen.getByLabelText(/^Mật khẩu tạm/), "Tam@12345")
    await user.click(await screen.findByRole("radio", { name: /Quản lý phòng khám/ }))
    expect(screen.getByRole("status")).toHaveTextContent("khoa, phòng, chuyên khoa, dịch vụ, giá dịch vụ và thuốc")
    expect(screen.getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))
    expect(await screen.findByText("Đã tạo nhân viên và tài khoản")).toBeInTheDocument()
    expect(screen.getByText("Quản lý phòng khám")).toBeInTheDocument()
    expect(postBodies(fetchMock)).toEqual([{ fullName: "Nguyễn Văn An", initialPassword: "Tam@12345", roleCode: "CLINIC_MANAGER" }])
    expect(screen.queryByDisplayValue("Tam@12345")).not.toBeInTheDocument()
  })
})
