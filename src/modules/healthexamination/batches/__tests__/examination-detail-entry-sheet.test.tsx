import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ExaminationDetailEntrySheet } from "../components/examination-detail-tab/examination-detail-entry-sheet"
import type { ExaminationDetailRow, HealthExaminationBatchService } from "../types"
import { getBusinessToday } from "../utils/examination-detail-entry-defaults"

const START_DATE = "2026-01-02"

const services: HealthExaminationBatchService[] = [
  { id: "s1", serviceId: "c1", code: "KNTQ", name: "Khám nội", referencePrice: 1, negotiatedPrice: 1, displayOrder: 1 },
  { id: "s2", serviceId: "c2", code: "XNM", name: "Xét nghiệm máu", referencePrice: 1, negotiatedPrice: 1, displayOrder: 2 },
  { id: "s3", serviceId: "c3", code: "SA", name: "Siêu âm", referencePrice: 1, negotiatedPrice: 1, displayOrder: 3, active: false },
]

const baseRow: ExaminationDetailRow = {
  id: "p-1",
  participantCode: "NV001",
  fullName: "Nguyễn Văn A",
  identificationNumberMasked: "********8901",
  departmentName: "Phòng Kế toán",
  positionName: "Kế toán viên",
  examinationDate: "2026-01-02",
  attendanceStatus: "UNCONFIRMED",
  reconciliationStatus: "PENDING",
  performedBatchServiceIds: [],
  rowVersion: 4,
}

const storedRow = {
  id: "p-1",
  participantCode: "NV001",
  fullName: "Nguyễn Văn A",
  identificationNumberMasked: "********8901",
  departmentName: "Phòng Kế toán",
  positionName: "Kế toán viên",
  examinationDate: "2026-01-02",
  attendanceStatus: "ATTENDED",
  actualExaminationDate: "2026-01-02",
  reconciliationStatus: "PENDING",
  performedBatchServiceIds: ["s1"],
  rowVersion: 5,
}

const envelope = (data: unknown) => ({ result: "OK" as const, code: 200, message: "ok", data })

function renderSheet(
  row: ExaminationDetailRow | null = baseRow,
  props: Partial<React.ComponentProps<typeof ExaminationDetailEntrySheet>> = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const handlers = {
    onOpenChange: vi.fn(),
    onSaved: vi.fn(),
    onSaveAndNext: vi.fn(),
    onReload: vi.fn().mockResolvedValue(undefined),
  }
  render(
    <QueryClientProvider client={queryClient}>
      <ExaminationDetailEntrySheet
        open
        organizationId="org-1"
        batchId="batch-1"
        startDate={START_DATE}
        services={services}
        row={row}
        {...handlers}
        {...props}
      />
    </QueryClientProvider>
  )
  return handlers
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe("ExaminationDetailEntrySheet", () => {
  it("opens as attended with the planned date and nothing ticked, and cannot save yet", () => {
    renderSheet()

    expect(screen.getByRole("radio", { name: "Đã đến" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByLabelText("Ngày khám thực tế")).toHaveValue("2026-01-02")
    expect(screen.getByRole("checkbox", { name: "Khám nội" })).not.toBeChecked()
    expect(screen.getByRole("button", { name: "Lưu" })).toBeDisabled()
  })

  it("ticks the services of the row it opens with", () => {
    renderSheet({
      ...baseRow,
      attendanceStatus: "ATTENDED",
      actualExaminationDate: "2026-01-03",
      performedBatchServiceIds: ["s2"],
    })

    expect(screen.getByRole("checkbox", { name: "Xét nghiệm máu" })).toBeChecked()
    expect(screen.getByLabelText("Ngày khám thực tế")).toHaveValue("2026-01-03")
  })

  it("does not call the API when an attended Participant has no service", async () => {
    const put = vi.spyOn(apiClient, "put")
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    await user.clear(screen.getByLabelText("Ngày khám thực tế"))
    await user.click(screen.getByRole("button", { name: "Lưu" }))

    expect((await screen.findAllByRole("alert")).length).toBeGreaterThan(0)
    expect(put).not.toHaveBeenCalled()
  })

  it("rejects a date after today without calling the API", async () => {
    const put = vi.spyOn(apiClient, "put")
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    const tomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const input = screen.getByLabelText("Ngày khám thực tế")
    await user.clear(input)
    await user.type(input, tomorrow)
    await user.click(screen.getByRole("button", { name: "Lưu" }))

    expect(put).not.toHaveBeenCalled()
    expect(await screen.findAllByRole("alert")).not.toHaveLength(0)
    expect(getBusinessToday() < tomorrow).toBe(true)
  })

  it("saves an attended Participant with the date, the ticked services and the row version", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(envelope(storedRow))
    const user = userEvent.setup()
    const { onSaved } = renderSheet()

    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    await user.click(screen.getByRole("button", { name: "Lưu" }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
    expect(put).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/examination-details/p-1",
      {
        attendanceStatus: "ATTENDED",
        actualExaminationDate: "2026-01-02",
        performedBatchServiceIds: ["s1"],
        rowVersion: 4,
      }
    )
    expect(onSaved.mock.calls[0][0]).toMatchObject({ id: "p-1", rowVersion: 5 })
  })

  it("marks a Participant absent without a date or services", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(
      envelope({ ...storedRow, attendanceStatus: "ABSENT", actualExaminationDate: null, performedBatchServiceIds: [] })
    )
    const user = userEvent.setup()
    const { onSaved } = renderSheet()

    await user.click(screen.getByRole("radio", { name: "Vắng" }))
    expect(screen.queryByLabelText("Ngày khám thực tế")).not.toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Khám nội" })).toHaveAttribute("aria-disabled", "true")
    await user.click(screen.getByRole("button", { name: "Lưu" }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
    expect(put.mock.calls[0][1]).toEqual({
      attendanceStatus: "ABSENT",
      actualExaminationDate: undefined,
      performedBatchServiceIds: [],
      rowVersion: 4,
    })
  })

  it("does not offer to mark absent a Participant that already has performed services", () => {
    renderSheet({
      ...baseRow,
      attendanceStatus: "ATTENDED",
      actualExaminationDate: "2026-01-02",
      performedBatchServiceIds: ["s1"],
    })

    expect(screen.getByRole("radio", { name: "Vắng" })).toBeDisabled()
    expect(screen.getByText(/Không thể đánh vắng người khám đã có hạng mục được ghi nhận/)).toBeInTheDocument()
  })

  it("keeps a service that is no longer offered unavailable unless it was already performed", () => {
    renderSheet()

    expect(screen.getByRole("checkbox", { name: /Siêu âm/ })).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByText("Không còn áp dụng")).toBeInTheDocument()
  })

  it("selects every offered service at once", async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole("button", { name: "Chọn tất cả" }))

    expect(screen.getByRole("checkbox", { name: "Khám nội" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Xét nghiệm máu" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: /Siêu âm/ })).not.toBeChecked()
  })

  it("explains a stale version in Vietnamese and reloads the data on request", async () => {
    vi.spyOn(apiClient, "put").mockRejectedValue(
      new ApiClientError("generic", 409, 409, "Participant was changed by another request; reload and try again")
    )
    const user = userEvent.setup()
    const { onReload } = renderSheet()

    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    await user.click(screen.getByRole("button", { name: "Lưu" }))

    const alert = await screen.findByText("Không thể lưu chi tiết khám")
    expect(within(alert.closest('[role="alert"]') as HTMLElement).getByText(/vừa được cập nhật ở nơi khác/)).toBeInTheDocument()
    expect(screen.queryByText(/reload and try again/)).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Tải lại dữ liệu" }))
    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it("saves and moves on to the next Participant", async () => {
    vi.spyOn(apiClient, "put").mockResolvedValue(envelope(storedRow))
    const user = userEvent.setup()
    const { onSaveAndNext, onSaved } = renderSheet()

    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    await user.click(screen.getByRole("button", { name: "Lưu & người tiếp theo" }))

    await waitFor(() => expect(onSaveAndNext).toHaveBeenCalledTimes(1))
    expect(onSaved).not.toHaveBeenCalled()
  })

  it("hides the save and next action on the last Participant", () => {
    renderSheet(baseRow, { onSaveAndNext: undefined })

    expect(screen.queryByRole("button", { name: "Lưu & người tiếp theo" })).not.toBeInTheDocument()
  })

  it("asks before discarding unsaved changes", async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderSheet()

    await user.click(screen.getByRole("checkbox", { name: "Khám nội" }))
    await user.click(screen.getByRole("button", { name: "Hủy" }))

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(await screen.findByText("Bỏ thay đổi chưa lưu?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Bỏ thay đổi" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("closes at once when nothing changed", async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderSheet()

    await user.click(screen.getByRole("button", { name: "Hủy" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
