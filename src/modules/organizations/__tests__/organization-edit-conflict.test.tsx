import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EditOrganizationDialog } from "../components/edit-organization-dialog"
import { CreateOrganizationDialog } from "../components/create-organization-dialog"
import { mockOrganizationFetch, organizationFixture } from "./organization-api-fixtures"
import type { OrganizationDetail } from "../types"

const organization: OrganizationDetail = {
  id: "org-1",
  name: "Công ty Cổ phần FPT",
  taxCode: "0101243150",
  phone: "0900000001",
  email: "office@example.invalid",
  address: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
  contactName: "Nguyễn Văn Hùng",
  contactPhone: "0912345678",
  contactEmail: "person@example.invalid",
  status: "ACTIVE",
  rowVersion: 3,
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function conflict() {
  return Response.json({ result: "NG", code: 409, message: "Business rule could not be completed" }, { status: 409 })
}

afterEach(() => vi.unstubAllGlobals())

describe("EditOrganizationDialog conflict", () => {
  beforeEach(() => vi.clearAllMocks())

  it("keeps the user's input on a 409 and saves again only with the reloaded version", async () => {
    const base = mockOrganizationFetch()
    let putCount = 0
    const bodies: Array<Record<string, unknown>> = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "PUT") {
        putCount += 1
        bodies.push(JSON.parse(String(init.body)))
        if (putCount === 1) return conflict()
      }
      if ((init?.method ?? "GET") === "GET" && String(input).endsWith("/api/v1/organizations/org-1")) {
        return Response.json({
          result: "OK",
          code: 200,
          data: { ...organizationFixture, name: "Tên mới từ máy chủ", rowVersion: 7 },
        })
      }
      return base(input, init)
    })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    renderWithClient(<EditOrganizationDialog open onOpenChange={vi.fn()} organization={organization} />)

    const name = screen.getByLabelText(/Tên đơn vị/)
    await user.clear(name)
    await user.type(name, "Tên tôi đang nhập")
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))

    expect(await screen.findByText(/Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên đơn vị/)).toHaveValue("Tên tôi đang nhập")
    expect(putCount).toBe(1)
    expect(bodies[0]).toMatchObject({ rowVersion: 3 })

    await user.click(screen.getByRole("button", { name: "Tải lại dữ liệu mới nhất" }))

    await waitFor(() => expect(screen.getByLabelText(/Tên đơn vị/)).toHaveValue("Tên mới từ máy chủ"))
    expect(putCount).toBe(1)
    expect(screen.queryByText(/Dữ liệu đã thay đổi/)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
    await waitFor(() => expect(putCount).toBe(2))
    expect(bodies[1]).toMatchObject({ rowVersion: 7, name: "Tên mới từ máy chủ" })
  })

  it("does not offer a reload for other failures", async () => {
    const base = mockOrganizationFetch()
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "PUT"
        ? Response.json({ result: "NG", code: 403, message: "Access denied" }, { status: 403 })
        : base(input, init)))
    const user = userEvent.setup()
    renderWithClient(<EditOrganizationDialog open onOpenChange={vi.fn()} organization={organization} />)

    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))

    expect(await screen.findByText("Không được phép thực hiện thao tác này.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Tải lại dữ liệu mới nhất" })).not.toBeInTheDocument()
  })
})

describe("CreateOrganizationDialog conflict", () => {
  it("explains that the tax code is already used on a 409", async () => {
    const base = mockOrganizationFetch()
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "POST" ? conflict() : base(input, init)))
    const user = userEvent.setup()
    renderWithClient(<CreateOrganizationDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText(/Mã số thuế/), "0101243150")
    await user.type(screen.getByLabelText(/Tên đơn vị/), "Công ty FPT")
    await user.type(screen.getByLabelText(/Điện thoại đơn vị/), "0900000001")
    await user.type(screen.getByLabelText(/Email đơn vị/), "office@example.invalid")
    await user.type(screen.getByLabelText(/Người liên hệ/), "Nguyễn Văn Hùng")
    await user.type(screen.getByLabelText(/^Số điện thoại/), "0912345678")
    await user.type(screen.getByLabelText(/Email người liên hệ/), "person@example.invalid")
    await user.type(screen.getByLabelText(/Địa chỉ/), "Hà Nội")
    await user.click(screen.getByRole("button", { name: /Tạo đơn vị|Lưu|Tạo/ }))

    expect(await screen.findByText("Mã số thuế đã tồn tại. Vui lòng nhập mã khác.")).toBeInTheDocument()
  })
})
