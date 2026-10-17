import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CreateHealthExaminationAgreementDialog } from "@/modules/healthexamination/agreements/components/agreement-form/create-health-examination-agreement-dialog"
import type { HealthExaminationAgreement } from "@/modules/healthexamination/agreements"
import * as healthAgreementsApi from "@/modules/healthexamination/agreements/api"
import { ApiClientError } from "@/shared/api/api-client"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/organizations/org-2",
  useSearchParams: () => new URLSearchParams(),
}))

const createdAgreement: HealthExaminationAgreement = {
  id: "agreement-mock-123", organizationId: "org-2", code: "DK001",
  name: "Khám sức khỏe CBNV 2026", status: "DRAFT",
  validFrom: "2026-09-15", validTo: "2026-09-16",
  createdAt: "2026-09-15T00:00:00Z", updatedAt: "2026-09-15T00:00:00Z",
  rowVersion: 0, createdBy: "staff-1", services: [],
}

function renderDialog(onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <CreateHealthExaminationAgreementDialog
        open onOpenChange={onOpenChange} organizationId="org-2"
        organizationName="Công ty Cổ phần FPT"
      />
    </QueryClientProvider>
  )
  return onOpenChange
}

async function fillBasicInfo(user: ReturnType<typeof userEvent.setup>, name = createdAgreement.name) {
  await screen.findByText("Khám nội tổng quát")
  await user.type(screen.getByLabelText(/Tên thỏa thuận/), name)
  setValidity("2026-09-15", "2026-09-16")
}

function setValidity(from: string, to: string) {
  fireEvent.change(screen.getByLabelText(/^Áp dụng từ ngày/), { target: { value: from } })
  fireEvent.change(screen.getByLabelText(/^Áp dụng đến ngày/), { target: { value: to } })
}

function serviceCheckbox(name: string) {
  return screen.getByRole("checkbox", { name })
}

describe("CreateHealthExaminationAgreementDialog", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("shows the organization and both form sections", async () => {
    renderDialog()
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Tạo thỏa thuận cho Công ty Cổ phần FPT")).toBeInTheDocument()
    expect(screen.getByText("Thông tin thỏa thuận")).toBeInTheDocument()
    expect(screen.getByText("Chọn hạng mục & giá")).toBeInTheDocument()
  })

  it("requires at least one selected service", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement")
    renderDialog()
    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    expect(await screen.findByText("Vui lòng chọn ít nhất một hạng mục khám.")).toBeInTheDocument()
    expect(createSpy).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("preselects nothing, shows the reference price and defaults the negotiated price to it", async () => {
    const user = userEvent.setup()
    renderDialog()
    await screen.findByText("Khám nội tổng quát")
    const input = screen.getByRole("textbox", { name: "Giá thỏa thuận cho Khám nội tổng quát" })
    expect(serviceCheckbox("Khám nội tổng quát")).not.toBeChecked()
    expect(input).toBeDisabled()
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    expect(input).toBeEnabled()
    expect(input).toHaveValue("100.000 đ")
  })

  it("keeps the typed price when a service is deselected and selected again", async () => {
    const user = userEvent.setup()
    renderDialog()
    await screen.findByText("Xét nghiệm máu")
    const input = screen.getByRole("textbox", { name: "Giá thỏa thuận cho Xét nghiệm máu" })
    await user.click(serviceCheckbox("Xét nghiệm máu"))
    await user.clear(input)
    await user.type(input, "220000")
    await user.click(serviceCheckbox("Xét nghiệm máu"))
    expect(input).toBeDisabled()
    await user.click(serviceCheckbox("Xét nghiệm máu"))
    expect(input).toHaveValue("220.000 đ")
  })

  it("has no examination day or site field: those belong to the sessions", async () => {
    renderDialog()
    await screen.findByText("Khám nội tổng quát")
    expect(screen.queryByLabelText(/Loại địa điểm/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Địa chỉ địa điểm khám/)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Thêm ngày" })).not.toBeInTheDocument()
    expect(screen.getByText(/Ngày khám và địa điểm được xếp ở Lịch khám/)).toBeInTheDocument()
  })

  it("lets the validity period stay open and rejects an inverted one", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement")
    renderDialog()
    await screen.findByText("Khám nội tổng quát")
    await user.type(screen.getByLabelText(/Tên thỏa thuận/), "Thỏa thuận mở")
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    setValidity("2026-09-20", "2026-09-10")
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    expect(
      await screen.findByText("Ngày bắt đầu hiệu lực không được sau ngày kết thúc.")
    ).toBeInTheDocument()
    expect(createSpy).not.toHaveBeenCalled()
  })

  it("creates an agreement with no validity period at all", async () => {
    const user = userEvent.setup()
    const createSpy = vi
      .spyOn(healthAgreementsApi, "createHealthExaminationAgreement")
      .mockResolvedValueOnce(createdAgreement)
    renderDialog()
    await screen.findByText("Khám nội tổng quát")
    await user.type(screen.getByLabelText(/Tên thỏa thuận/), "Thỏa thuận mở")
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1))
    expect(createSpy.mock.calls[0][0]).toMatchObject({ validFrom: null, validTo: null })
  })

  it("sends the agreement contract with the validity and the negotiated prices, then closes and navigates", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement").mockResolvedValueOnce(createdAgreement)
    const onOpenChange = renderDialog()
    await fillBasicInfo(user)
    for (const [name, price] of [["Khám nội tổng quát", "180000"], ["Xét nghiệm máu", "220000"]]) {
      await user.click(serviceCheckbox(name))
      const input = screen.getByRole("textbox", { name: `Giá thỏa thuận cho ${name}` })
      await user.clear(input)
      await user.type(input, price)
    }
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1))
    expect(createSpy.mock.calls[0][0]).toEqual({
      organizationId: "org-2", agreementName: createdAgreement.name,
      validFrom: "2026-09-15",
      validTo: "2026-09-16",
      services: [
        { serviceId: "item-kntq", negotiatedPrice: 180000 },
        { serviceId: "item-xnm", negotiatedPrice: 220000 },
      ],
    })
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(mockPush).toHaveBeenCalledWith("/organizations/org-2/agreements/agreement-mock-123")
    })
  })

  it("sends the reference price when the user keeps the default", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement").mockResolvedValueOnce(createdAgreement)
    renderDialog()
    await fillBasicInfo(user)
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1))
    expect(createSpy.mock.calls[0][0].services).toEqual([{ serviceId: "item-kntq", negotiatedPrice: 100000 }])
  })

  it("does not show a agreement code, because the system generates it", async () => {
    renderDialog()
    await screen.findByText("Khám nội tổng quát")
    expect(screen.queryByLabelText(/Mã thỏa thuận/)).not.toBeInTheDocument()
  })

  it("keeps the form and offers no auto-resend when creation is rejected with a conflict", async () => {
    const user = userEvent.setup()
    const createSpy = vi
      .spyOn(healthAgreementsApi, "createHealthExaminationAgreement")
      .mockRejectedValueOnce(new ApiClientError("Dữ liệu đã thay đổi.", 409))
    const onOpenChange = renderDialog()
    await fillBasicInfo(user)
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    expect(await screen.findByText(/Không thể tạo thỏa thuận: đơn vị đã ngừng hoạt động/)).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByLabelText(/Tên thỏa thuận/)).toHaveValue(createdAgreement.name)
    expect(createSpy).toHaveBeenCalledTimes(1)
  })

  it("preserves entered data when creation fails", async () => {
    const user = userEvent.setup()
    vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement").mockRejectedValueOnce(new Error("Lỗi kết nối máy chủ phòng khám (500)"))
    const onOpenChange = renderDialog()
    await fillBasicInfo(user, "Thỏa thuận thử nghiệm lỗi")
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    await user.click(screen.getByRole("button", { name: "Tạo thỏa thuận" }))
    expect(await screen.findByText("Lỗi kết nối máy chủ phòng khám (500)")).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByLabelText(/Tên thỏa thuận/)).toHaveValue("Thỏa thuận thử nghiệm lỗi")
  })

  it("prevents repeated submissions while creation is pending", async () => {
    const user = userEvent.setup()
    let resolve!: (agreement: HealthExaminationAgreement) => void
    const pending = new Promise<HealthExaminationAgreement>((done) => { resolve = done })
    const createSpy = vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement").mockReturnValueOnce(pending)
    renderDialog()
    await fillBasicInfo(user)
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    const submit = screen.getByRole("button", { name: "Tạo thỏa thuận" })
    await user.click(submit)
    expect(submit).toBeDisabled()
    await user.click(submit)
    expect(createSpy).toHaveBeenCalledTimes(1)
    await act(async () => { resolve(createdAgreement) })
  })
  describe("service search", () => {
    const rowNames = () =>
      screen
        .getAllByRole("checkbox")
        .map((box) => box.closest("tr")?.querySelector("label")?.textContent)

    it("filters by name without diacritics and by code, and offers to clear", async () => {
      const user = userEvent.setup()
      renderDialog()
      await screen.findByText("Xét nghiệm máu")
      const search = screen.getByRole("textbox", { name: "Tìm hạng mục khám" })

      await user.type(search, "xet nghiem")
      expect(rowNames()).toEqual(["Xét nghiệm máu", "Xét nghiệm nước tiểu"])

      await user.clear(search)
      await user.type(search, "khong co hang muc nay")
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0)
      await user.click(screen.getByRole("button", { name: "Xóa tìm kiếm" }))
      expect(search).toHaveValue("")
      expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(2)
    })

    it("does not submit the form on Enter and clears on the first Escape without closing", async () => {
      const user = userEvent.setup()
      const createSpy = vi.spyOn(healthAgreementsApi, "createHealthExaminationAgreement")
      const onOpenChange = renderDialog()
      await screen.findByText("Xét nghiệm máu")
      const search = screen.getByRole("textbox", { name: "Tìm hạng mục khám" })
      await user.type(search, "mau{Enter}")
      expect(createSpy).not.toHaveBeenCalled()
      expect(screen.queryByText("Vui lòng chọn ít nhất một hạng mục khám.")).not.toBeInTheDocument()
      await user.keyboard("{Escape}")
      expect(search).toHaveValue("")
      expect(onOpenChange).not.toHaveBeenCalledWith(false)
    })

    it("keeps checked services selected while filtering and lists them first once the search changes", async () => {
      const user = userEvent.setup()
      renderDialog()
      await screen.findByText("Xét nghiệm máu")
      await user.click(serviceCheckbox("Tai mũi họng"))
      // No reorder while ticking boxes.
      expect(rowNames().at(-1)).toBe("Tai mũi họng")
      expect(screen.getByText(/Đã chọn/).textContent).toContain("1")

      const search = screen.getByRole("textbox", { name: "Tìm hạng mục khám" })
      await user.type(search, "x")
      await user.clear(search)
      expect(rowNames()[0]).toBe("Tai mũi họng")
      expect(serviceCheckbox("Tai mũi họng")).toBeChecked()
    })
  })
})
