import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SESSION_QUERY_KEY } from "../../utils/session-cache"
import { UserAccountCreatePage } from "../pages/user-account-create-page"
import {
  ADMIN_PERMISSIONS,
  GP_ROLE_ID,
  PATIENT_OWNER_ID,
  STAFF_OWNER_ID,
  createRequestBody,
  mockUserAccountFetch,
  sessionWith,
} from "./user-account-fixtures"

const back = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ back, push: vi.fn() }) }))

function renderPage(permissions = ADMIN_PERMISSIONS) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  client.setQueryData(SESSION_QUERY_KEY, sessionWith(permissions))
  render(
    <QueryClientProvider client={client}>
      <UserAccountCreatePage />
    </QueryClientProvider>
  )
  return client
}

async function searchAndSelect(
  user: ReturnType<typeof userEvent.setup>,
  keyword: string,
  ownerName: string
) {
  await user.type(screen.getByRole("textbox", { name: "Tìm hồ sơ chủ tài khoản" }), keyword)
  await user.click(screen.getByRole("button", { name: "Tìm kiếm" }))
  await user.click(await screen.findByRole("radio", { name: ownerName }))
}

describe("UserAccountCreatePage", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it("shows a permission-denied state without the create permission", () => {
    const fetchMock = mockUserAccountFetch()
    renderPage(["USER_ACCOUNT_OWNER_SEARCH"])

    expect(screen.getByText("Không có quyền truy cập")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Tạo tài khoản" })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("explains every missing field on submit", async () => {
    const user = userEvent.setup()
    mockUserAccountFetch()
    renderPage()

    await screen.findByRole("checkbox", { name: "Bác sĩ đa khoa" })
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }))

    expect(await screen.findByText("Vui lòng chọn hồ sơ chủ tài khoản")).toBeInTheDocument()
    expect(screen.getByText("Tên đăng nhập là bắt buộc")).toBeInTheDocument()
    expect(screen.getByText("Mật khẩu tạm thời là bắt buộc")).toBeInTheDocument()
    expect(screen.getByText("Chọn ít nhất một vai trò cho tài khoản nhân viên")).toBeInTheDocument()
  })

  it("creates a staff account, shows the result and warns that the SMS was not sent", async () => {
    const user = userEvent.setup()
    const fetchMock = mockUserAccountFetch({ smsDelivered: false })
    renderPage()

    await searchAndSelect(user, "Nguyễn", "Nguyễn Văn A")
    const owner = screen.getByRole("group", { name: "Chủ tài khoản đã chọn" })
    expect(within(owner).getByText("a.nguyen@example.invalid")).toBeInTheDocument()
    expect(screen.getByText("0912 345 678", { selector: "strong" })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Tên đăng nhập/), "nguyen.van.a")
    expect(await screen.findByText("Tên đăng nhập có thể sử dụng")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Tạo ngẫu nhiên" }))
    const password = screen.getByLabelText(/Mật khẩu tạm thời/) as HTMLInputElement
    expect(password.value).toHaveLength(12)
    expect(password).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("checkbox", { name: "Bác sĩ đa khoa" }))

    const summary = screen.getByRole("complementary", { name: "Tóm tắt tài khoản" })
    expect(within(summary).getByText("Nguyễn Văn A")).toBeInTheDocument()
    expect(within(summary).getByText("nguyen.van.a")).toBeInTheDocument()
    expect(within(summary).getByText("Bác sĩ đa khoa")).toBeInTheDocument()

    const generated = password.value
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }))

    expect(await screen.findByText("Đã tạo tài khoản thành công")).toBeInTheDocument()
    expect(screen.getByText("Chưa gửi được SMS thông tin đăng nhập.")).toBeInTheDocument()
    expect(createRequestBody(fetchMock)).toEqual({
      accountType: "STAFF",
      ownerId: STAFF_OWNER_ID,
      username: "nguyen.van.a",
      temporaryPassword: generated,
      roleIds: [GP_ROLE_ID],
    })
    expect(document.body.textContent).not.toContain(generated)
    expect(screen.queryByLabelText(/Mật khẩu tạm thời/)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tạo tài khoản khác" }))
    expect(screen.getByRole("textbox", { name: "Tìm hồ sơ chủ tài khoản" })).toHaveValue("")
  })

  it("hides the Initial Roles section for a patient account, which gets the PATIENT role", async () => {
    const user = userEvent.setup()
    const fetchMock = mockUserAccountFetch({ smsDelivered: true })
    renderPage()

    expect(screen.getByRole("region", { name: "Vai trò ban đầu" })).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Bệnh nhân" }))
    expect(screen.queryByRole("region", { name: "Vai trò ban đầu" })).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    const summary = screen.getByRole("complementary", { name: "Tóm tắt tài khoản" })
    expect(within(summary).getByText("Bệnh nhân", { selector: "[data-slot=badge]" })).toBeInTheDocument()

    await searchAndSelect(user, "Lê Thị", "Lê Thị Hoa")
    expect(
      within(screen.getByRole("group", { name: "Chủ tài khoản đã chọn" })).getByText("14/03/1990")
    ).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Tên đăng nhập/), "le.thi.hoa")
    await user.type(screen.getByLabelText(/Mật khẩu tạm thời/), "abc")
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }))

    expect(await screen.findByText(/Đã gửi thông tin đăng nhập qua SMS/)).toBeInTheDocument()
    expect(createRequestBody(fetchMock)).toMatchObject({
      accountType: "PATIENT",
      ownerId: PATIENT_OWNER_ID,
      roleIds: [],
    })
  })

  it("blocks creation for an owner without a mobile number", async () => {
    const user = userEvent.setup()
    mockUserAccountFetch()
    renderPage()

    await searchAndSelect(user, "Nguyễn", "Nguyễn Văn An")

    expect(screen.getByText(/chưa có số di động hợp lệ để nhận SMS/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tạo tài khoản" })).toBeDisabled()
  })

  it("shows a taken username next to the field after a 409", async () => {
    const user = userEvent.setup()
    mockUserAccountFetch({
      takenUsernames: ["taken.user"],
      createFailure: { status: 409, message: "Username already exists" },
    })
    renderPage()

    await searchAndSelect(user, "Nguyễn", "Nguyễn Văn A")
    await user.type(screen.getByLabelText(/Tên đăng nhập/), "taken.user")
    expect(await screen.findByText("Tên đăng nhập đã tồn tại")).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Mật khẩu tạm thời/), "abc")
    await user.click(screen.getByRole("checkbox", { name: "Điều dưỡng" }))
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }))

    await waitFor(() =>
      expect(screen.getAllByText("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.")).toHaveLength(2)
    )
    expect(screen.queryByText("Username already exists")).not.toBeInTheDocument()
  })

  it("goes back on cancel", async () => {
    const user = userEvent.setup()
    mockUserAccountFetch()
    renderPage()

    await user.click(screen.getByRole("button", { name: "Hủy" }))

    expect(back).toHaveBeenCalled()
  })
})
