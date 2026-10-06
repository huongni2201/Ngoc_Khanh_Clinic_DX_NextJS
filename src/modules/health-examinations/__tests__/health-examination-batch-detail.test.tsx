import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as batchApi from "@/modules/health-examinations/api"
import { ApiClientError } from "@/shared/api/api-client"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"
import { healthExaminationKeys } from "../query-keys"
import type { HealthExaminationBatch } from "../types"

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: vi.fn() }),
  usePathname: () => "/organizations/org-1/health-examination-batches/batch-1",
  useSearchParams: () => new URLSearchParams(nav.search),
}))

const batch: HealthExaminationBatch = {
  id: "batch-1",
  organizationId: "org-1",
  code: "DK001",
  name: "Khám định kỳ 2026",
  status: "DRAFT",
  startDate: "2026-10-01",
  endDate: "2026-10-03",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-02T00:00:00Z",
  rowVersion: 4,
  examinationDates: ["2026-10-01", "2026-10-03"],
  examinationSiteType: "ORGANIZATION_SITE",
  examinationSiteName: "Trụ sở FPT",
  examinationSiteAddress: "Hà Nội",
  createdBy: "staff-1",
  services: [
    {
      id: "s1", serviceId: "item-kntq", code: "HM001", name: "Khám nội tổng quát",
      referencePrice: 100000, negotiatedPrice: 90000, displayOrder: 1,
    },
    {
      id: "s2", serviceId: "gone", code: null, name: null,
      referencePrice: 50000, negotiatedPrice: 40000, displayOrder: 2,
    },
  ],
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <HealthExaminationBatchDetailPage organizationId="org-1" batchId="batch-1" />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

describe("HealthExaminationBatchDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    nav.search = ""
  })

  it("shows the batch with site, dates and services, using the placeholder for an unresolved name", async () => {
    const get = vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
    renderPage()

    expect(await screen.findByRole("heading", { name: "Khám định kỳ 2026" })).toBeInTheDocument()
    expect(get.mock.calls[0].slice(0, 2)).toEqual(["org-1", "batch-1"])
    expect(screen.getByText("Nháp")).toBeInTheDocument()
    expect(screen.getByText("Tại đơn vị")).toBeInTheDocument()
    expect(screen.getAllByText("Trụ sở FPT").length).toBeGreaterThan(0)
    const dates = within(screen.getByRole("list", { name: "Ngày khám" }))
    expect(dates.getByText("01/10/2026")).toBeInTheDocument()
    expect(dates.getByText("03/10/2026")).toBeInTheDocument()
    expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    expect(screen.getByText("90.000 đ")).toBeInTheDocument()
    expect(screen.getByText("Dịch vụ không còn trong danh mục")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Chỉnh sửa" })).toBeInTheDocument()
  })

  it("explains a missing batch and links back to the organization's batches", async () => {
    vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockRejectedValue(
      new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
    )
    renderPage()

    expect(await screen.findByText("Không tìm thấy đợt khám")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Về danh sách đợt khám/ })).toHaveAttribute(
      "href",
      "/organizations/org-1?tab=batches"
    )
    expect(screen.queryByRole("button", { name: "Thử lại" })).not.toBeInTheDocument()
  })

  it("offers a retry for other load errors", async () => {
    const get = vi
      .spyOn(batchApi, "fetchHealthExaminationBatchById")
      .mockRejectedValueOnce(new ApiClientError("Máy chủ gặp lỗi. Vui lòng thử lại sau.", 500))
      .mockResolvedValueOnce(batch)
    renderPage()

    expect(await screen.findByText("Không thể tải dữ liệu đợt khám")).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole("button", { name: "Thử lại" }))
    expect(await screen.findByRole("heading", { name: "Khám định kỳ 2026" })).toBeInTheDocument()
    expect(get).toHaveBeenCalledTimes(2)
  })

  it("hides edit and delete for a batch that is no longer a draft", async () => {
    vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue({ ...batch, status: "READY" })
    renderPage()

    await screen.findByRole("heading", { name: "Khám định kỳ 2026" })
    expect(screen.queryByRole("button", { name: "Chỉnh sửa" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Xóa đợt khám" })).not.toBeInTheDocument()
    expect(screen.getByText(/Chỉ đợt khám ở trạng thái Nháp/)).toBeInTheDocument()
  })

  describe("delete", () => {
    it("sends the read row version, leaves the page and refreshes the list", async () => {
      vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
      const remove = vi.spyOn(batchApi, "deleteHealthExaminationBatch").mockResolvedValue()
      const { queryClient } = renderPage()
      const invalidate = vi.spyOn(queryClient, "invalidateQueries")
      const user = userEvent.setup()

      await user.click(await screen.findByRole("button", { name: "Xóa đợt khám" }))
      await user.click(await screen.findByRole("button", { name: "Xác nhận xóa" }))

      await waitFor(() =>
        expect(remove).toHaveBeenCalledWith({ organizationId: "org-1", batchId: "batch-1", rowVersion: 4 })
      )
      await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/organizations/org-1?tab=batches"))
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: [...healthExaminationKeys.batches("org-1"), "list"],
      })
      expect(queryClient.getQueryData(healthExaminationKeys.batch("org-1", "batch-1"))).toBeUndefined()
    })

    it("does not delete when the user cancels", async () => {
      vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
      const remove = vi.spyOn(batchApi, "deleteHealthExaminationBatch").mockResolvedValue()
      renderPage()
      const user = userEvent.setup()

      await user.click(await screen.findByRole("button", { name: "Xóa đợt khám" }))
      await user.click(await screen.findByRole("button", { name: "Hủy" }))

      expect(remove).not.toHaveBeenCalled()
      expect(nav.push).not.toHaveBeenCalled()
    })

    it("explains a 409, reloads on request and never resends the delete by itself", async () => {
      const get = vi
        .spyOn(batchApi, "fetchHealthExaminationBatchById")
        .mockResolvedValueOnce(batch)
        .mockResolvedValueOnce({ ...batch, status: "READY", rowVersion: 5 })
      const remove = vi
        .spyOn(batchApi, "deleteHealthExaminationBatch")
        .mockRejectedValue(new ApiClientError("Dữ liệu đã thay đổi.", 409))
      renderPage()
      const user = userEvent.setup()

      await user.click(await screen.findByRole("button", { name: "Xóa đợt khám" }))
      await user.click(await screen.findByRole("button", { name: "Xác nhận xóa" }))

      expect(await screen.findByText(/đã có người khám, không còn ở trạng thái Nháp/)).toBeInTheDocument()
      expect(nav.push).not.toHaveBeenCalled()
      expect(remove).toHaveBeenCalledTimes(1)

      await user.click(screen.getByRole("button", { name: "Tải lại dữ liệu mới nhất" }))
      await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Xóa đợt khám" })).not.toBeInTheDocument()
      )
      expect(remove).toHaveBeenCalledTimes(1)
    })
  })

  describe("edit", () => {
    it("sends the batch's row version and shows the saved values", async () => {
      vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
      const update = vi
        .spyOn(batchApi, "updateHealthExaminationBatch")
        .mockResolvedValue({ ...batch, name: "Tên mới", rowVersion: 5 })
      renderPage()
      const user = userEvent.setup()

      await user.click(await screen.findByRole("button", { name: "Chỉnh sửa" }))
      const dialog = await screen.findByRole("dialog")
      expect(
        await within(dialog).findByRole("checkbox", { name: "Khám nội tổng quát" })
      ).toBeChecked()
      const name = within(dialog).getByLabelText(/Tên đợt khám/)
      await waitFor(() => expect(name).toHaveValue("Khám định kỳ 2026"))
      expect(within(dialog).getByLabelText(/Mã đợt khám/)).toHaveAttribute("readonly")
      expect(within(dialog).getByRole("textbox", { name: "Giá thỏa thuận cho Khám nội tổng quát" })).toHaveValue("90.000 đ")

      await user.clear(name)
      await user.type(name, "Tên mới")
      await user.click(within(dialog).getByRole("button", { name: "Lưu thay đổi" }))

      await waitFor(() => expect(update).toHaveBeenCalledTimes(1))
      expect(update.mock.calls[0][0]).toMatchObject({
        organizationId: "org-1",
        batchId: "batch-1",
        rowVersion: 4,
        batchCode: "DK001",
        batchName: "Tên mới",
        examinationDates: ["2026-10-01", "2026-10-03"],
      })
      expect(update.mock.calls[0][0].services).toEqual(
        expect.arrayContaining([{ serviceId: "item-kntq", negotiatedPrice: 90000 }])
      )
      expect(await screen.findByRole("heading", { name: "Tên mới" })).toBeInTheDocument()
    })

    it("keeps the typed values on 409 and only reloads when asked", async () => {
      const get = vi
        .spyOn(batchApi, "fetchHealthExaminationBatchById")
        .mockResolvedValueOnce(batch)
        .mockResolvedValueOnce({ ...batch, name: "Tên từ máy chủ", rowVersion: 9 })
      const update = vi
        .spyOn(batchApi, "updateHealthExaminationBatch")
        .mockRejectedValueOnce(
          new ApiClientError("Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.", 409)
        )
        .mockResolvedValueOnce({ ...batch, name: "Tên tôi sửa", rowVersion: 10 })
      renderPage()
      const user = userEvent.setup()

      await user.click(await screen.findByRole("button", { name: "Chỉnh sửa" }))
      const dialog = await screen.findByRole("dialog")
      await within(dialog).findByRole("checkbox", { name: "Khám nội tổng quát" })
      const name = within(dialog).getByLabelText(/Tên đợt khám/)
      await waitFor(() => expect(name).toHaveValue("Khám định kỳ 2026"))
      await user.clear(name)
      await user.type(name, "Tên tôi sửa")
      await user.click(within(dialog).getByRole("button", { name: "Lưu thay đổi" }))

      expect(await within(dialog).findByText(/Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ/)).toBeInTheDocument()
      expect(name).toHaveValue("Tên tôi sửa")
      expect(update).toHaveBeenCalledTimes(1)
      expect(get).toHaveBeenCalledTimes(1)

      await user.click(within(dialog).getByRole("button", { name: "Tải lại dữ liệu mới nhất" }))
      await waitFor(() => expect(name).toHaveValue("Tên từ máy chủ"))
      expect(update).toHaveBeenCalledTimes(1)

      await user.click(within(dialog).getByRole("button", { name: "Lưu thay đổi" }))
      await waitFor(() => expect(update).toHaveBeenCalledTimes(2))
      expect(update.mock.calls[1][0]).toMatchObject({ rowVersion: 9 })
    })
  })

  describe("tabs the backend cannot serve yet", () => {
    it.each([
      ["Người khám", "participants", "Danh sách người khám"],
      ["Chi tiết khám", "examination", "Chi tiết khám"],
      ["Báo cáo", "report", "Báo cáo đợt khám"],
    ])("%s shows 'Chưa hỗ trợ' and sends no request for it", async (label, tab, feature) => {
      nav.search = `tab=${tab}`
      vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
      const fetchMock = vi.fn()
      vi.stubGlobal("fetch", fetchMock)
      const matrix = vi.spyOn(batchApi, "fetchHealthExaminationBatchMatrix")
      const report = vi.spyOn(batchApi, "fetchHealthExaminationBatchReport")
      const participants = vi.spyOn(batchApi, "fetchHealthExaminationBatchParticipants")
      renderPage()

      const notice = (await screen.findByText("Chưa hỗ trợ")).parentElement
      expect(notice).toHaveTextContent(feature)
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument()
      expect(fetchMock).not.toHaveBeenCalled()
      expect(matrix).not.toHaveBeenCalled()
      expect(report).not.toHaveBeenCalled()
      expect(participants).not.toHaveBeenCalled()
      vi.unstubAllGlobals()
    })

    it("switches tabs through the URL", async () => {
      vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
      renderPage()
      await userEvent.setup().click(await screen.findByRole("button", { name: "Báo cáo" }))
      expect(nav.push).toHaveBeenCalledWith(
        "/organizations/org-1/health-examination-batches/batch-1?tab=report",
        { scroll: false }
      )
    })
  })
})
