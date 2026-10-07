import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CreateOrganizationDialog } from "../components/create-organization-dialog"
import { mockOrganizationFetch } from "./organization-api-fixtures"

const onCreated = vi.fn()
const onOpenChange = vi.fn()

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("CreateOrganizationDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrganizationFetch()
  })

  afterEach(() => vi.unstubAllGlobals())

  it("renders fields that match the organization request contract", () => {
    renderWithClient(<CreateOrganizationDialog open onOpenChange={onOpenChange} onCreated={onCreated} />)

    expect(screen.getByLabelText(/Tên đơn vị/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Điện thoại đơn vị/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email đơn vị/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email người liên hệ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã số thuế/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Địa chỉ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Người liên hệ \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Mã đơn vị/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Loại đơn vị/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Chức vụ người liên hệ/i)).not.toBeInTheDocument()
  })

  it("validates required organization fields", async () => {
    const user = userEvent.setup()
    renderWithClient(<CreateOrganizationDialog open onOpenChange={onOpenChange} onCreated={onCreated} />)

    await user.click(screen.getByRole("button", { name: "Tạo đơn vị" }))

    expect(screen.getByText("Tên đơn vị phải có ít nhất 2 ký tự")).toBeInTheDocument()
    expect(screen.getByText("Người liên hệ là bắt buộc")).toBeInTheDocument()
    expect(screen.getAllByText("Số điện thoại là bắt buộc")).toHaveLength(2)
  })

  it("creates an organization through the backend API, closes the dialog and reports its ID", async () => {
    const user = userEvent.setup()
    const fetchMock = mockOrganizationFetch()
    renderWithClient(<CreateOrganizationDialog open onOpenChange={onOpenChange} onCreated={onCreated} />)

    await user.type(screen.getByLabelText(/Tên đơn vị/i), "Đại học Bách Khoa Hà Nội")
    await user.type(screen.getByLabelText(/Mã số thuế/i), "0100998877")
    await user.type(screen.getByLabelText(/Điện thoại đơn vị/i), "0900000001")
    await user.type(screen.getByLabelText(/Email đơn vị/i), "contact@example.invalid")
    await user.type(screen.getByLabelText(/Email người liên hệ/i), "person@example.invalid")
    await user.type(screen.getByLabelText(/Địa chỉ/i), "Số 1 Đại Cồ Việt")
    await user.type(screen.getByLabelText(/^Người liên hệ \*/i), "Lê Hoàng Quân")
    await user.type(screen.getByLabelText(/Số điện thoại/i), "0912345678")
    await user.click(screen.getByRole("button", { name: "Tạo đơn vị" }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("org-created"))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/organizations"),
      expect.objectContaining({ method: "POST" })
    )
  })
})
