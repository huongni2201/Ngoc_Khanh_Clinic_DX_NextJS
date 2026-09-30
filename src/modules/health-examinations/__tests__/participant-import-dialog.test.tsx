import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"

const state = vi.hoisted(() => ({
  upload: { mutateAsync: vi.fn(), reset: vi.fn(), isPending: false },
  validate: { mutateAsync: vi.fn(), reset: vi.fn(), isPending: false },
  confirm: { mutateAsync: vi.fn(), reset: vi.fn(), isPending: false },
  cancel: { mutateAsync: vi.fn(), reset: vi.fn(), isPending: false },
  rows: { data: undefined as unknown, isLoading: false, isError: false, error: null },
}))

vi.mock("../hooks/use-participant-imports", () => ({
  useUploadParticipantImport: () => state.upload,
  useValidateParticipantImport: () => state.validate,
  useConfirmParticipantImport: () => state.confirm,
  useCancelParticipantImport: () => state.cancel,
  useParticipantImportRows: () => state.rows,
}))

import { ParticipantImportDialog } from "../components/participants-tab/participant-import-dialog"

const uploadResponse = {
  importId: "job-1",
  status: "UPLOADED",
  headerRowNumber: 2,
  headers: ["STT", "Họ và tên", "Giới tính", "Ngày sinh", "CCCD"],
  suggestedMapping: {
    FULL_NAME: 1,
    SEX: 2,
    DATE_OF_BIRTH: 3,
    IDENTIFICATION_NUMBER: 4,
  },
}

function validatedSummary(overrides: Record<string, unknown> = {}) {
  return {
    importId: "job-1",
    status: "VALIDATED",
    totalRows: 1,
    validRows: 1,
    warningRows: 0,
    errorRows: 0,
    confirmAllowed: true,
    columnMapping: uploadResponse.suggestedMapping,
    headers: uploadResponse.headers,
    ...overrides,
  }
}

function renderDialog() {
  const onOpenChange = vi.fn()
  render(
    <ParticipantImportDialog
      open
      organizationId="org-1"
      batchId="batch-1"
      onOpenChange={onOpenChange}
    />
  )
  return onOpenChange
}

async function uploadXls(user: ReturnType<typeof userEvent.setup>) {
  state.upload.mutateAsync.mockResolvedValue(uploadResponse)
  const file = new File(["fixture"], "roster.xls", { type: "application/vnd.ms-excel" })
  await user.upload(screen.getByLabelText(/file excel/i), file)
  await user.click(screen.getByRole("button", { name: "Tải file lên" }))
  await screen.findByText("Kiểm tra mapping cột")
  expect(state.upload.mutateAsync).toHaveBeenCalledWith({
    organizationId: "org-1",
    batchId: "batch-1",
    file,
  })
}

describe("participant import dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.rows = { data: undefined, isLoading: false, isError: false, error: null }
  })

  it("uploads .xls, allows mapping review, and blocks confirmation when any row is invalid", async () => {
    const user = userEvent.setup()
    renderDialog()
    await uploadXls(user)

    expect(screen.getByLabelText("Cột Họ và tên")).toHaveValue("1")
    state.validate.mutateAsync.mockResolvedValue(validatedSummary({
      validRows: 0,
      errorRows: 1,
      confirmAllowed: false,
    }))
    state.rows = {
      data: {
        importId: "job-1",
        page: 1,
        size: 50,
        totalRows: 1,
        rows: [{
          rowNumber: 19,
          fullName: "Nguyen An",
          dateOfBirth: null,
          sex: "Nam",
          maskedIdentificationNumber: null,
          phone: null,
          rosterNote: null,
          action: null,
          errors: [{ field: "dateOfBirth", code: "MISSING_DATE_OF_BIRTH", message: "Thiếu ngày sinh." }],
          warnings: [],
        }],
      },
      isLoading: false,
      isError: false,
      error: null,
    }

    await user.click(screen.getByRole("button", { name: "Kiểm tra dữ liệu" }))

    expect(await screen.findByText("Có lỗi chặn. Sửa file rồi tải lên lại; Confirm sẽ không ghi dòng nào.")).toBeInTheDocument()
    expect(screen.getByText("Hàng 19 · dateOfBirth: Thiếu ngày sinh.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Xác nhận import" })).toBeDisabled()
    expect(state.validate.mutateAsync).toHaveBeenCalledWith({
      organizationId: "org-1",
      batchId: "batch-1",
      importId: "job-1",
      columns: uploadResponse.suggestedMapping,
    })
  })

  it("keeps a stale preview open for revalidation and shows re-import counts after success", async () => {
    const user = userEvent.setup()
    renderDialog()
    await uploadXls(user)
    state.validate.mutateAsync.mockResolvedValue(validatedSummary())
    state.rows = {
      data: {
        importId: "job-1",
        page: 1,
        size: 50,
        totalRows: 1,
        rows: [{
          rowNumber: 4,
          fullName: "Nguyen An",
          dateOfBirth: "1990-01-01",
          sex: "Nam",
          maskedIdentificationNumber: "••••••8901",
          phone: null,
          rosterNote: null,
          action: "UPDATE",
          errors: [],
          warnings: [],
        }],
      },
      isLoading: false,
      isError: false,
      error: null,
    }
    await user.click(screen.getByRole("button", { name: "Kiểm tra dữ liệu" }))
    expect(await screen.findByText("Cập nhật")).toBeInTheDocument()

    state.confirm.mutateAsync
      .mockRejectedValueOnce(new ApiClientError("stale", 409, 409))
      .mockResolvedValueOnce({ importedRows: 1, createdRows: 0, updatedRows: 1, unchangedRows: 0 })
    await user.click(screen.getByRole("button", { name: "Xác nhận import" }))
    expect(await screen.findByText(/Preview đã cũ/)).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Kiểm tra lại dữ liệu" }))
    await waitFor(() => expect(state.validate.mutateAsync).toHaveBeenCalledTimes(2))
    await user.click(screen.getByRole("button", { name: "Xác nhận import" }))

    expect(await screen.findByText(/tạo mới 0, cập nhật 1, giữ nguyên 0/)).toBeInTheDocument()
    expect(state.confirm.mutateAsync).toHaveBeenCalledTimes(2)
  })
})
