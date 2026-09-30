"use client"

import * as React from "react"
import { ApiClientError } from "@/shared/api/api-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useCancelParticipantImport,
  useConfirmParticipantImport,
  useParticipantImportRows,
  useUploadParticipantImport,
  useValidateParticipantImport,
} from "../../hooks/use-participant-imports"
import type {
  ParticipantImportField,
  ParticipantImportMapping,
  ParticipantImportSummary,
  ParticipantImportUploadResponse,
} from "../../api/participant-imports"

const fields: { field: ParticipantImportField; label: string; required: boolean }[] = [
  { field: "FULL_NAME", label: "Họ và tên", required: true },
  { field: "SEX", label: "Giới tính", required: true },
  { field: "DATE_OF_BIRTH", label: "Ngày sinh", required: true },
  { field: "IDENTIFICATION_NUMBER", label: "CCCD", required: true },
  { field: "PHONE", label: "Số điện thoại", required: false },
  { field: "IDENTIFICATION_NUMBER_ISSUE_DATE", label: "Ngày cấp", required: false },
  { field: "IDENTIFICATION_NUMBER_ISSUE_PLACE", label: "Nơi cấp", required: false },
  { field: "ETHNICITY", label: "Dân tộc", required: false },
  { field: "SUBJECT_TYPE", label: "Đối tượng", required: false },
  { field: "BLOOD_GROUP", label: "Nhóm máu", required: false },
  { field: "OCCUPATION", label: "Nghề nghiệp", required: false },
  { field: "WORKPLACE_OR_SCHOOL", label: "Nơi làm việc", required: false },
  { field: "ADDRESS_DETAIL", label: "Chỗ ở hiện tại", required: false },
  { field: "PAYER_SOURCE", label: "Nguồn chi trả", required: false },
  { field: "ROSTER_NOTE", label: "Ghi chú", required: false },
]

const pageSize = 50

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại."
}

function actionLabel(action: string | null) {
  if (action === "CREATE") return "Tạo mới"
  if (action === "UPDATE") return "Cập nhật"
  if (action === "UNCHANGED") return "Không thay đổi"
  return "—"
}

function warningLabel(code: string) {
  if (code === "HEALTH_RECORD_SNAPSHOT_UNCHANGED") {
    return "Roster cập nhật; snapshot hồ sơ khám đã chuẩn bị sẽ được giữ nguyên."
  }
  return code
}

interface ParticipantImportDialogProps {
  open: boolean
  organizationId: string
  batchId: string
  onOpenChange: (open: boolean) => void
}

export function ParticipantImportDialog({
  open,
  organizationId,
  batchId,
  onOpenChange,
}: ParticipantImportDialogProps) {
  const upload = useUploadParticipantImport()
  const validate = useValidateParticipantImport()
  const confirm = useConfirmParticipantImport()
  const cancel = useCancelParticipantImport()
  const [file, setFile] = React.useState<File | null>(null)
  const [uploaded, setUploaded] = React.useState<ParticipantImportUploadResponse | null>(null)
  const [mapping, setMapping] = React.useState<ParticipantImportMapping>({})
  const [summary, setSummary] = React.useState<ParticipantImportSummary | null>(null)
  const [confirmResult, setConfirmResult] = React.useState<{
    importedRows: number
    createdRows: number
    updatedRows: number
    unchangedRows: number
  } | null>(null)
  const [rowFilter, setRowFilter] = React.useState("INVALID")
  const [rowPage, setRowPage] = React.useState(1)
  const [localError, setLocalError] = React.useState("")
  const [stalePreview, setStalePreview] = React.useState(false)
  const sessionId = React.useRef(0)

  const importId = uploaded?.importId ?? ""
  const preview = useParticipantImportRows(
    organizationId,
    batchId,
    importId,
    { page: rowPage, size: pageSize, status: rowFilter },
    Boolean(summary && !confirmResult)
  )

  const reset = React.useCallback(() => {
    sessionId.current += 1
    setFile(null)
    setUploaded(null)
    setMapping({})
    setSummary(null)
    setConfirmResult(null)
    setRowFilter("INVALID")
    setRowPage(1)
    setLocalError("")
    setStalePreview(false)
    upload.reset()
    validate.reset()
    confirm.reset()
    cancel.reset()
  }, [cancel, confirm, upload, validate])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && (upload.isPending || confirm.isPending)) return
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const mappedIndexes = Object.values(mapping).filter((value): value is number => Number.isInteger(value))
  const mappingComplete = fields.filter((field) => field.required)
    .every(({ field }) => Number.isInteger(mapping[field]))
  const mappingUnique = new Set(mappedIndexes).size === mappedIndexes.length

  const handleUpload = async () => {
    const currentSession = sessionId.current
    setLocalError("")
    if (!file) {
      setLocalError("Chọn file .xls hoặc .xlsx trước khi tải lên.")
      return
    }
    if (!/\.xlsx?$/i.test(file.name)) {
      setLocalError("Chỉ nhận file .xls hoặc .xlsx.")
      return
    }
    if (file.size < 1 || file.size > 10 * 1024 * 1024) {
      setLocalError("File phải nhỏ hơn hoặc bằng 10 MiB.")
      return
    }
    try {
      const response = await upload.mutateAsync({ organizationId, batchId, file })
      if (currentSession !== sessionId.current) return
      setUploaded(response)
      setMapping(response.suggestedMapping)
    } catch (error) {
      if (currentSession !== sessionId.current) return
      setLocalError(errorMessage(error))
    }
  }

  const handleMapField = (field: ParticipantImportField, value: string) => {
    setSummary(null)
    setConfirmResult(null)
    setRowPage(1)
    setMapping((current) => {
      const next = { ...current }
      if (value === "") delete next[field]
      else next[field] = Number(value)
      return next
    })
  }

  const handleValidate = async () => {
    if (!uploaded || !mappingComplete || !mappingUnique) return
    const currentSession = sessionId.current
    setLocalError("")
    setSummary(null)
    setStalePreview(false)
    setConfirmResult(null)
    try {
      const response = await validate.mutateAsync({
        organizationId,
        batchId,
        importId: uploaded.importId,
        columns: mapping,
      })
      if (currentSession !== sessionId.current) return
      setSummary(response)
      setRowFilter(response.errorRows > 0 ? "INVALID" : response.warningRows > 0 ? "WARNING" : "ALL")
      setRowPage(1)
    } catch (error) {
      if (currentSession !== sessionId.current) return
      setLocalError(errorMessage(error))
    }
  }

  const handleConfirm = async () => {
    if (!uploaded || !summary?.confirmAllowed || stalePreview || summary.errorRows > 0 || summary.totalRows < 1) return
    const currentSession = sessionId.current
    setLocalError("")
    setStalePreview(false)
    try {
      const response = await confirm.mutateAsync({
        organizationId,
        batchId,
        importId: uploaded.importId,
      })
      if (currentSession !== sessionId.current) return
      setConfirmResult(response)
    } catch (error) {
      if (currentSession !== sessionId.current) return
      if (error instanceof ApiClientError && error.code === 409) {
        setStalePreview(true)
        return
      }
      setLocalError(errorMessage(error))
    }
  }

  const handleCancel = async () => {
    if (!uploaded || cancel.isPending || confirm.isPending) return
    const currentSession = sessionId.current
    setLocalError("")
    try {
      await cancel.mutateAsync({ organizationId, batchId, importId: uploaded.importId })
      if (currentSession !== sessionId.current) return
      handleOpenChange(false)
    } catch (error) {
      if (currentSession !== sessionId.current) return
      setLocalError(errorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!upload.isPending && !confirm.isPending}
        className="max-h-[calc(100dvh-2rem)] max-w-5xl overflow-y-auto sm:max-w-5xl"
      >
        <DialogHeader>
          <DialogTitle>Import danh sách người khám</DialogTitle>
          <DialogDescription>
            Dùng file roster 16 cột riêng. Một dòng lỗi sẽ chặn xác nhận toàn bộ file.
          </DialogDescription>
        </DialogHeader>

        {confirmResult ? (
          <div className="space-y-4 rounded-md border border-status-success/20 bg-status-success-bg p-4">
            <h3 className="font-semibold text-foreground">Đã import thành công</h3>
            <p className="text-sm text-muted-foreground">
              {confirmResult.importedRows} dòng: tạo mới {confirmResult.createdRows}, cập nhật {confirmResult.updatedRows}, giữ nguyên {confirmResult.unchangedRows}.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>Đóng</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-5">
            {!uploaded ? (
              <section className="space-y-3">
                <label htmlFor="participant-roster-file" className="block text-sm font-medium">
                  File Excel (.xls, .xlsx)
                </label>
                <input
                  id="participant-roster-file"
                  type="file"
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
                  className="block w-full rounded-md border border-input bg-background p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5"
                />
                <p className="text-xs text-muted-foreground">
                  Tối đa 10 MiB. Hàng 2 là tiêu đề cột; dữ liệu bắt đầu ở hàng 3. Định dạng CCCD và điện thoại là Text để giữ số 0 đầu.
                </p>
                <Button type="button" onClick={handleUpload} disabled={upload.isPending || !file}>
                  {upload.isPending ? "Đang tải lên…" : "Tải file lên"}
                </Button>
              </section>
            ) : (
              <>
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Kiểm tra mapping cột</h3>
                    <p className="text-xs text-muted-foreground">
                      Header được đọc ở hàng {uploaded.headerRowNumber}. Xác nhận trường CCCD và các cột cần dùng.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {fields.map(({ field, label, required }) => (
                      <label key={field} className="space-y-1 text-xs">
                        <span className="font-medium">{label}{required ? " *" : ""}</span>
                        <select
                          aria-label={`Cột ${label}`}
                          value={mapping[field] ?? ""}
                          onChange={(event) => handleMapField(field, event.currentTarget.value)}
                          disabled={validate.isPending || confirm.isPending}
                          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          {!required && <option value="">Không ánh xạ</option>}
                          {uploaded.headers.map((header, index) => (
                            <option key={index} value={index}>
                              Cột {String.fromCharCode(65 + index)}: {header || "(trống)"}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  {!mappingUnique && <p className="text-sm text-destructive">Mỗi trường phải dùng một cột riêng.</p>}
                  <Button
                    type="button"
                    onClick={handleValidate}
                    disabled={!mappingComplete || !mappingUnique || validate.isPending}
                  >
                    {validate.isPending ? "Đang kiểm tra…" : summary ? "Kiểm tra lại dữ liệu" : "Kiểm tra dữ liệu"}
                  </Button>
                </section>

                {summary && (
                  <section className="space-y-3 border-t border-border pt-4">
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span>Tổng: <strong>{summary.totalRows}</strong></span>
                      <span>Hợp lệ: <strong>{summary.validRows}</strong></span>
                      <span>Cảnh báo: <strong>{summary.warningRows}</strong></span>
                      <span>Lỗi: <strong className={summary.errorRows > 0 ? "text-destructive" : ""}>{summary.errorRows}</strong></span>
                    </div>
                    {summary.errorRows > 0 && (
                      <p className="text-sm text-destructive">Có lỗi chặn. Sửa file rồi tải lên lại; Confirm sẽ không ghi dòng nào.</p>
                    )}
                    {summary.warningRows > 0 && (
                      <p className="text-sm text-status-warning">Cảnh báo không chặn import, nhưng hãy xem trước khi xác nhận.</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor="participant-import-row-filter" className="text-sm font-medium">Hiển thị</label>
                      <select
                        id="participant-import-row-filter"
                        value={rowFilter}
                        onChange={(event) => { setRowFilter(event.currentTarget.value); setRowPage(1) }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="ALL">Tất cả dòng</option>
                        <option value="INVALID">Dòng lỗi</option>
                        <option value="WARNING">Dòng cảnh báo</option>
                        <option value="VALID">Dòng hợp lệ</option>
                      </select>
                      {preview.data && <span className="text-xs text-muted-foreground">{preview.data.totalRows} dòng</span>}
                    </div>

                    {preview.isLoading || preview.isFetching ? (
                      <p className="text-sm text-muted-foreground">Đang tải preview…</p>
                    ) : preview.isError ? (
                      <p role="alert" className="text-sm text-destructive">{errorMessage(preview.error)}</p>
                    ) : (
                      <div className="max-h-72 overflow-auto rounded-md border border-border">
                        <table className="w-full min-w-[700px] text-left text-xs">
                          <thead className="sticky top-0 bg-muted text-foreground">
                            <tr>
                              <th className="p-2">Hàng Excel</th>
                              <th className="p-2">Họ tên / CCCD</th>
                              <th className="p-2">Dự kiến</th>
                              <th className="p-2">Lỗi / cảnh báo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {(preview.data?.rows ?? []).map((row) => (
                              <tr key={row.rowNumber} className="align-top">
                                <td className="whitespace-nowrap p-2">{row.rowNumber}</td>
                                <td className="p-2">
                                  <div>{row.fullName || "—"}</div>
                                  <div className="text-muted-foreground">{row.maskedIdentificationNumber || "CCCD chưa đọc được"}</div>
                                </td>
                                <td className="whitespace-nowrap p-2">{actionLabel(row.action)}</td>
                                <td className="max-w-md p-2">
                                  {row.errors.map((error) => (
                                    <div key={`${error.code}-${error.field}`} className="text-destructive">
                                      Hàng {row.rowNumber} · {error.field}: {error.message}
                                    </div>
                                  ))}
                                  {row.warnings.map((warning) => (
                                    <div key={warning} className="text-status-warning">{warningLabel(warning)}</div>
                                  ))}
                                  {row.errors.length === 0 && row.warnings.length === 0 && <span>—</span>}
                                </td>
                              </tr>
                            ))}
                            {preview.data?.rows.length === 0 && (
                              <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Không có dòng phù hợp.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {preview.data && preview.data.totalRows > pageSize && (
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" disabled={rowPage <= 1} onClick={() => setRowPage((page) => page - 1)}>Trước</Button>
                        <span className="text-xs">Trang {rowPage} / {Math.ceil(preview.data.totalRows / pageSize)}</span>
                        <Button type="button" size="sm" variant="outline" disabled={rowPage * pageSize >= preview.data.totalRows} onClick={() => setRowPage((page) => page + 1)}>Sau</Button>
                      </div>
                    )}
                  </section>
                )}

                {stalePreview && (
                  <div role="alert" className="rounded-md border border-status-warning/30 bg-status-warning-bg p-3 text-sm">
                    Preview đã cũ vì roster thay đổi. Chạy kiểm tra lại dữ liệu trước khi xác nhận.
                  </div>
                )}
                <DialogFooter className="flex-wrap sm:justify-between">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={upload.isPending || validate.isPending || cancel.isPending || confirm.isPending}>
                    {cancel.isPending ? "Đang hủy…" : "Hủy import"}
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={upload.isPending || confirm.isPending}>Đóng</Button>
                    {summary && (
                      <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!summary.confirmAllowed || summary.errorRows > 0 || summary.totalRows === 0 || stalePreview || validate.isPending || confirm.isPending}
                      >
                        {confirm.isPending ? "Đang xác nhận…" : "Xác nhận import"}
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            )}
          </div>
        )}

        {localError && <p role="alert" className="text-sm text-destructive">{localError}</p>}
      </DialogContent>
    </Dialog>
  )
}
