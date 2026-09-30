import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CreateHealthExaminationBatchDialog } from "@/modules/health-examinations/components/batch-form/create-health-examination-batch-dialog"
import type { HealthExaminationBatch } from "@/modules/health-examinations"
import * as healthBatchesApi from "@/modules/health-examinations/api"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/organizations/org-2",
  useSearchParams: () => new URLSearchParams(),
}))

const createdBatch: HealthExaminationBatch = {
  id: "batch-mock-123", organizationId: "org-2", code: "DK001",
  name: "Khám sức khỏe CBNV 2026", status: "IN_PROGRESS",
  startDate: "2026-09-15", endDate: "2026-09-16",
  createdAt: "2026-09-15T00:00:00Z", updatedAt: "2026-09-15T00:00:00Z",
}

function renderDialog(onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <CreateHealthExaminationBatchDialog
        open onOpenChange={onOpenChange} organizationId="org-2"
        organizationName="Công ty Cổ phần FPT" organizationAddress="Hà Nội"
      />
    </QueryClientProvider>
  )
  return onOpenChange
}

async function fillBasicInfo(user: ReturnType<typeof userEvent.setup>, name = createdBatch.name) {
  await screen.findByText("Khám nội tổng quát")
  await user.type(screen.getByLabelText(/Mã đợt khám/), "DK001")
  await user.type(screen.getByLabelText(/Tên đợt khám/), name)
  await user.selectOptions(screen.getByLabelText(/Loại địa điểm/), "COMPANY")
  await user.type(screen.getByLabelText(/Tên địa điểm/), "Trụ sở FPT")
  fireEvent.change(screen.getByLabelText(/Ngày bắt đầu/), { target: { value: "2026-09-15" } })
  fireEvent.change(screen.getByLabelText(/Ngày kết thúc/), { target: { value: "2026-09-16" } })
}

function serviceCheckbox(name: string) {
  return screen.getByRole("checkbox", { name })
}

describe("CreateHealthExaminationBatchDialog", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("shows the organization and both form sections", async () => {
    renderDialog()
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Tạo đợt khám cho Công ty Cổ phần FPT")).toBeInTheDocument()
    expect(screen.getByText("Thông tin đợt khám")).toBeInTheDocument()
    expect(screen.getByText("Chọn hạng mục & giá")).toBeInTheDocument()
  })

  it("requires at least one selected service", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthBatchesApi, "createHealthExaminationBatch")
    renderDialog()
    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Tạo đợt khám" }))
    expect(await screen.findByText("Vui lòng chọn ít nhất một hạng mục khám.")).toBeInTheDocument()
    expect(createSpy).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("enables negotiated pricing without inventing a catalog price", async () => {
    const user = userEvent.setup()
    renderDialog()
    await screen.findByText("Khám nội tổng quát")
    const input = screen.getByRole("textbox", { name: "Đơn giá cho Khám nội tổng quát" })
    expect(input).toBeDisabled()
    expect(input).toHaveValue("0 đ")
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    expect(input).toBeEnabled()
    expect(input).toHaveValue("0 đ")
  })

  it("resets negotiated pricing when a service is deselected", async () => {
    const user = userEvent.setup()
    renderDialog()
    await screen.findByText("Xét nghiệm máu")
    const input = screen.getByRole("textbox", { name: "Đơn giá cho Xét nghiệm máu" })
    await user.click(serviceCheckbox("Xét nghiệm máu"))
    await user.clear(input)
    await user.type(input, "220000")
    await user.click(serviceCheckbox("Xét nghiệm máu"))
    expect(input).toBeDisabled()
    expect(input).toHaveValue("0 đ")
  })

  it("accepts a zero negotiated price supported by the current contract", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthBatchesApi, "createHealthExaminationBatch").mockResolvedValueOnce(createdBatch)
    renderDialog()
    await fillBasicInfo(user)
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    await user.click(screen.getByRole("button", { name: "Tạo đợt khám" }))
    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1))
    expect(createSpy.mock.calls[0][0].services).toEqual([{ serviceId: "item-kntq", negotiatedUnitPrice: 0 }])
  })

  it("sends current batch fields and selected services, then closes and navigates", async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(healthBatchesApi, "createHealthExaminationBatch").mockResolvedValueOnce(createdBatch)
    const onOpenChange = renderDialog()
    await fillBasicInfo(user)
    for (const [name, price] of [["Khám nội tổng quát", "180000"], ["Xét nghiệm máu", "220000"]]) {
      await user.click(serviceCheckbox(name))
      const input = screen.getByRole("textbox", { name: `Đơn giá cho ${name}` })
      await user.clear(input)
      await user.type(input, price)
    }
    await user.click(screen.getByRole("button", { name: "Tạo đợt khám" }))
    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1))
    expect(createSpy.mock.calls[0][0]).toMatchObject({
      organizationId: "org-2", batchCode: "DK001", batchName: createdBatch.name,
      startDate: "2026-09-15", endDate: "2026-09-16",
      examinationSiteType: "COMPANY", examinationSiteName: "Trụ sở FPT",
      examinationSiteAddress: "Hà Nội",
      services: [
        { serviceId: "item-kntq", negotiatedUnitPrice: 180000 },
        { serviceId: "item-xnm", negotiatedUnitPrice: 220000 },
      ],
    })
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(mockPush).toHaveBeenCalledWith("/organizations/org-2/health-examination-batches/batch-mock-123")
    })
  })

  it("preserves entered data when creation fails", async () => {
    const user = userEvent.setup()
    vi.spyOn(healthBatchesApi, "createHealthExaminationBatch").mockRejectedValueOnce(new Error("Lỗi kết nối máy chủ phòng khám (500)"))
    const onOpenChange = renderDialog()
    await fillBasicInfo(user, "Đợt khám thử nghiệm lỗi")
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    await user.click(screen.getByRole("button", { name: "Tạo đợt khám" }))
    expect(await screen.findByText("Lỗi kết nối máy chủ phòng khám (500)")).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByLabelText(/Tên đợt khám/)).toHaveValue("Đợt khám thử nghiệm lỗi")
  })

  it("prevents repeated submissions while creation is pending", async () => {
    const user = userEvent.setup()
    let resolve!: (batch: HealthExaminationBatch) => void
    const pending = new Promise<HealthExaminationBatch>((done) => { resolve = done })
    const createSpy = vi.spyOn(healthBatchesApi, "createHealthExaminationBatch").mockReturnValueOnce(pending)
    renderDialog()
    await fillBasicInfo(user)
    await user.click(serviceCheckbox("Khám nội tổng quát"))
    const submit = screen.getByRole("button", { name: "Tạo đợt khám" })
    await user.click(submit)
    expect(submit).toBeDisabled()
    await user.click(submit)
    expect(createSpy).toHaveBeenCalledTimes(1)
    await act(async () => { resolve(createdBatch) })
  })
})
