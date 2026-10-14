import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithClient } from "@/test-utils/render-with-client"
import { CreateStaffMemberDialog } from "../components/create-staff-member-dialog"
import { jsonResponse, mockStaffMemberFetch, rolesFixture } from "./staff-member-fixtures"

const onOpenChange = vi.fn()

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Họ và tên/), "Nguyễn Văn An")
  await user.type(screen.getByLabelText(/^Mật khẩu tạm/), "Tam@12345")
  await user.click(await screen.findByRole("checkbox", { name: /Bác sĩ đa khoa/ }))
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

    expect(await screen.findByRole("checkbox", { name: /Lễ tân/ })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/^Họ và tên/), "Nguyễn Văn An")
    expect(screen.getByTestId("username-preview")).toHaveTextContent("annv…")
    expect(screen.queryByLabelText(/Mã nhân viên/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Tên đăng nhập/)).not.toBeInTheDocument()
  })

  it("validates required fields before calling the backend", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch()
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)
    await screen.findByRole("checkbox", { name: /Lễ tân/ })

    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(await screen.findByText("Họ và tên là bắt buộc")).toBeInTheDocument()
    expect(screen.getByText("Chọn ít nhất một vai trò")).toBeInTheDocument()
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
      { fullName: "Nguyễn Văn An", initialPassword: "Tam@12345", roleCodes: ["GENERAL_PRACTITIONER"] },
    ])
    expect(screen.queryByDisplayValue("Tam@12345")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Thêm nhân viên khác" }))
    expect(screen.getByLabelText(/^Họ và tên/)).toHaveValue("")
    expect(screen.getByLabelText(/^Mật khẩu tạm/)).toHaveValue("")
  })

  it("reloads the roles and drops a role that is no longer available after a 409", async () => {
    const user = userEvent.setup()
    const fetchMock = mockStaffMemberFetch({
      roles: [rolesFixture, [rolesFixture[1]]],
      createResponse: () => jsonResponse({ result: "NG", code: 409, message: "Conflict" }, 409),
    })
    renderWithClient(<CreateStaffMemberDialog open onOpenChange={onOpenChange} />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Tạo nhân viên" }))

    expect(await screen.findByText(/Một hoặc nhiều vai trò không còn khả dụng/)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole("checkbox", { name: /Bác sĩ đa khoa/ })).not.toBeInTheDocument()
    )
    expect(await screen.findByText("Chọn ít nhất một vai trò")).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/api/v1/roles"))).toHaveLength(2)
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

    expect(await screen.findByText("Mật khẩu tạm không hợp lệ (8–72 byte)")).toBeInTheDocument()
    expect(screen.getByLabelText(/^Mật khẩu tạm/)).toHaveAttribute("aria-invalid", "true")
    expect(screen.queryByText("too long")).not.toBeInTheDocument()
  })
})
