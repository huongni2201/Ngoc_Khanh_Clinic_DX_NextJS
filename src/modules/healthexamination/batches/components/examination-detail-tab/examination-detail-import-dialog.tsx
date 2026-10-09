"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Loader2, Upload } from "@/shared/ui/product-icon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EXAMINATION_DETAIL_IMPORT_MAX_BYTES } from "../../api/examination-details"
import { useImportExaminationDetails } from "../../hooks/use-examination-details"
import type { ExaminationDetailImportResult } from "../../types"
import {
  describeExaminationDetailImportError,
  type ExaminationDetailImportFailure,
} from "../../utils/examination-detail-import-errors"
import { validateParticipantImportFile } from "../../utils/participant-import-errors"
import { formatFileSize } from "@/lib/format-file-size"

interface ExaminationDetailImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** Downloads the current workbook; offered when the chosen file is out of date. */
  onExport: () => void
  isExporting: boolean
}

/**
 * Uploads the exported examination detail workbook. The import is all-or-nothing: a rejected file
 * changes nobody. A new Idempotency-Key is created for each chosen file and reused while the same
 * file is resent, so a retry after a dropped connection never writes twice.
 */
export function ExaminationDetailImportDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  onExport,
  isExporting,
}: ExaminationDetailImportDialogProps) {
  const importMutation = useImportExaminationDetails()
  const [file, setFile] = React.useState<File | null>(null)
  const [idempotencyKey, setIdempotencyKey] = React.useState<string | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [failure, setFailure] = React.useState<ExaminationDetailImportFailure | null>(null)
  const [result, setResult] = React.useState<ExaminationDetailImportResult | null>(null)
  const [inputKey, setInputKey] = React.useState(0)
  const pending = importMutation.isPending

  const reset = React.useCallback(() => {
    setFile(null)
    setIdempotencyKey(null)
    setFileError(null)
    setFailure(null)
    setResult(null)
    setInputKey((value) => value + 1)
    importMutation.reset()
  }, [importMutation])

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setFailure(null)
    setResult(null)
    importMutation.reset()
    if (!selected) {
      setFile(null)
      setIdempotencyKey(null)
      setFileError(null)
      return
    }
    const problem = validateParticipantImportFile(selected, EXAMINATION_DETAIL_IMPORT_MAX_BYTES)
    setFileError(problem)
    setFile(problem ? null : selected)
    setIdempotencyKey(problem ? null : crypto.randomUUID())
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file || !idempotencyKey || pending) return
    setFailure(null)
    try {
      const imported = await importMutation.mutateAsync({
        organizationId,
        batchId,
        file,
        idempotencyKey,
      })
      setResult(imported)
      setFile(null)
      setIdempotencyKey(null)
      setInputKey((value) => value + 1)
    } catch (error) {
      setFailure(describeExaminationDetailImportError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập chi tiết khám từ Excel</DialogTitle>
          <DialogDescription>
            Xuất file chi tiết khám, đánh dấu X vào các hạng mục đã khám rồi tải lên. Người khám có
            X được ghi nhận là đã đến. Ô trống nghĩa là chưa khám hạng mục đó. Người khám không có
            trong file được giữ nguyên. Hệ thống nhập toàn bộ hoặc không nhập dòng nào.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
            <span className="text-muted-foreground">
              File gắn với danh sách và các hạng mục hiện tại. Xuất lại nếu danh sách người khám hoặc
              đợt khám vừa thay đổi.
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isExporting || pending}
            >
              {isExporting ? "Đang xuất..." : "Xuất file Excel"}
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="examination-detail-import-file" className="text-xs font-medium">
              Tệp Excel (.xlsx, tối đa 5 MB)
            </Label>
            <Input
              key={inputKey}
              id="examination-detail-import-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              disabled={pending}
              aria-invalid={fileError ? true : undefined}
              aria-describedby={fileError ? "examination-detail-import-file-error" : undefined}
              className="h-auto py-1.5 text-xs"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {formatFileSize(file.size)}
              </p>
            )}
            {fileError && (
              <p
                id="examination-detail-import-file-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {fileError}
              </p>
            )}
          </div>

          {failure && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Không thể nhập chi tiết khám</AlertTitle>
              <AlertDescription>
                <p>{failure.message}</p>
                <p className="mt-1 text-xs">Chưa có thay đổi nào được ghi vào đợt khám.</p>
                {failure.needsNewExport && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs">Hãy xuất lại file mới nhất rồi nhập lại.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onExport}
                      disabled={isExporting}
                    >
                      {isExporting ? "Đang xuất..." : "Xuất lại file"}
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Nhập chi tiết khám thành công</AlertTitle>
              <AlertDescription>
                <p role="status">
                  Đã cập nhật {result.updatedParticipants} người khám, {result.unchangedParticipants}{" "}
                  người không thay đổi (tổng {result.totalRows} dòng, {result.performedItems} hạng
                  mục đã khám).
                </p>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              {result ? "Đóng" : "Hủy"}
            </Button>
            <Button type="submit" disabled={!file || pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Đang nhập...
                </>
              ) : failure?.retryable ? (
                <>
                  <Upload className="mr-1.5 size-3.5" />
                  Thử lại
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 size-3.5" />
                  Nhập chi tiết khám
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
