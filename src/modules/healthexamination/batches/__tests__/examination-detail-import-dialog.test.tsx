import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ExaminationDetailImportDialog } from "../components/examination-detail-tab/examination-detail-import-dialog"
import { healthExaminationKeys } from "../query-keys"

const KEY_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const KEY_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

const result = {
  importJobId: "job-1",
  batchId: "batch-1",
  totalRows: 5,
  updatedParticipants: 3,
  unchangedParticipants: 2,
  performedItems: 9,
  completedAt: "2026-10-07T03:00:00Z",
}

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")
  const onExport = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <QueryClientProvider client={queryClient}>
      <ExaminationDetailImportDialog
        open
        onOpenChange={onOpenChange}
        organizationId="org-1"
        batchId="batch-1"
        onExport={onExport}
        isExporting={false}
      />
    </QueryClientProvider>
  )
  return { invalidate, onExport, onOpenChange }
}

const workbook = (name = "chi-tiet-kham.xlsx") =>
  new File(["xlsx"], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

beforeEach(() => {
  vi.clearAllMocks()
  const uuids = [KEY_A, KEY_B]
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    () => uuids.shift() as ReturnType<typeof crypto.randomUUID>
  )
})
afterEach(() => vi.restoreAllMocks())

describe("ExaminationDetailImportDialog", () => {
  it("rejects a file that is not .xlsx without sending anything", async () => {
    const post = vi.spyOn(apiClient, "post")
    const user = userEvent.setup({ applyAccept: false })
    renderDialog()

    await user.upload(screen.getByLabelText(/Tệp Excel/), new File(["a,b"], "du-lieu.csv"))

    expect(screen.getByRole("alert")).toHaveTextContent("Chỉ chấp nhận tệp Excel định dạng .xlsx.")
    expect(screen.getByRole("button", { name: "Nhập chi tiết khám" })).toBeDisabled()
    expect(post).not.toHaveBeenCalled()
  })

  it("imports the file with one idempotency key, reports the counts and refreshes the batch data", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ result: "OK", code: 201, message: "ok", data: result })
    const user = userEvent.setup()
    const { invalidate } = renderDialog()

    await user.upload(screen.getByLabelText(/Tệp Excel/), workbook())
    await user.click(screen.getByRole("button", { name: "Nhập chi tiết khám" }))

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Đã cập nhật 3 người khám, 2 người không thay đổi (tổng 5 dòng, 9 hạng mục đã khám)."
    )
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][2]).toEqual({ headers: { "Idempotency-Key": KEY_A } })
    const invalidated = invalidate.mock.calls.map(([filters]) => filters?.queryKey)
    expect(invalidated).toContainEqual(healthExaminationKeys.examinationDetailsRoot("org-1", "batch-1"))
    expect(invalidated).toContainEqual(healthExaminationKeys.paymentReport("org-1", "batch-1"))
    expect(invalidated).toContainEqual(healthExaminationKeys.participantsRoot("org-1", "batch-1"))
  })

  it("explains a rejected row in Vietnamese and states that nothing was written", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("generic", 400, 400, 'Row 7: column "Xét nghiệm máu" accepts only X or blank')
    )
    const user = userEvent.setup()
    renderDialog()

    await user.upload(screen.getByLabelText(/Tệp Excel/), workbook())
    await user.click(screen.getByRole("button", { name: "Nhập chi tiết khám" }))

    expect(await screen.findByText(/Dòng 7: cột “Xét nghiệm máu” chỉ nhận chữ X/)).toBeInTheDocument()
    expect(screen.getByText("Chưa có thay đổi nào được ghi vào đợt khám.")).toBeInTheDocument()
    expect(screen.queryByText(/accepts only/)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Xuất lại file" })).not.toBeInTheDocument()
  })

  it("offers exporting again when a Participant changed after the export", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError(
        "generic",
        409,
        409,
        "Row 9: participant was changed after export; export again"
      )
    )
    const user = userEvent.setup()
    const { onExport } = renderDialog()

    await user.upload(screen.getByLabelText(/Tệp Excel/), workbook())
    await user.click(screen.getByRole("button", { name: "Nhập chi tiết khám" }))

    expect(await screen.findByText(/Dòng 9: người khám đã được thay đổi sau khi xuất file/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Xuất lại file" }))
    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it("retries a lost connection with the same key and uses a new key for a new file", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockRejectedValueOnce(new ApiClientError("offline", 0))
      .mockResolvedValue({ result: "OK", code: 201, message: "ok", data: result })
    const user = userEvent.setup()
    renderDialog()

    await user.upload(screen.getByLabelText(/Tệp Excel/), workbook())
    await user.click(screen.getByRole("button", { name: "Nhập chi tiết khám" }))
    await user.click(await screen.findByRole("button", { name: "Thử lại" }))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    expect(post.mock.calls[0][2]).toEqual({ headers: { "Idempotency-Key": KEY_A } })
    expect(post.mock.calls[1][2]).toEqual({ headers: { "Idempotency-Key": KEY_A } })

    await user.upload(screen.getByLabelText(/Tệp Excel/), workbook("khac.xlsx"))
    await user.click(screen.getByRole("button", { name: "Nhập chi tiết khám" }))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(3))
    expect(post.mock.calls[2][2]).toEqual({ headers: { "Idempotency-Key": KEY_B } })
  })
})
