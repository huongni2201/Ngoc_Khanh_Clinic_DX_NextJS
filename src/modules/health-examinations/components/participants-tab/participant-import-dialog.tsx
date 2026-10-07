"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { PARTICIPANT_IMPORT_MAX_BYTES } from "../../api/participants"
import { useImportHealthExaminationBatchParticipants } from "../../hooks/use-health-examination-batches"
import { healthExaminationKeys } from "../../query-keys"
import type { ParticipantImportResult } from "../../types"
import {
  describeParticipantImportError,
  validateParticipantImportFile,
  type ParticipantImportFailure,
} from "../../utils/participant-import-errors"

interface ParticipantImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** The batch `rowVersion` the workbook must have been prepared for. */
  rowVersion: number
  onDownloadTemplate: () => void
  isDownloadingTemplate: boolean
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Uploads a roster workbook. The import is all-or-nothing, so a rejected file adds nobody. A new
 * Idempotency-Key is created for each chosen file and reused while the same file is resent, so a
 * retry after a dropped connection never imports twice.
 */
export function ParticipantImportDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  rowVersion,
  onDownloadTemplate,
  isDownloadingTemplate,
}: ParticipantImportDialogProps) {
  const queryClient = useQueryClient()
  const importMutation = useImportHealthExaminationBatchParticipants()
  const [file, setFile] = React.useState<File | null>(null)
  const [idempotencyKey, setIdempotencyKey] = React.useState<string | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [failure, setFailure] = React.useState<ParticipantImportFailure | null>(null)
  const [result, setResult] = React.useState<ParticipantImportResult | null>(null)
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
    const problem = validateParticipantImportFile(selected, PARTICIPANT_IMPORT_MAX_BYTES)
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
        rowVersion,
        idempotencyKey,
      })
      setResult(imported)
      setFile(null)
      setIdempotencyKey(null)
      setInputKey((value) => value + 1)
    } catch (error) {
      const described = describeParticipantImportError(error)
      setFailure(described)
      if (described.needsNewTemplate) {
        // The cached batch version may be stale; reading it again makes the next template match.
        void queryClient.invalidateQueries({
          queryKey: healthExaminationKeys.batch(organizationId, batchId),
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập danh sách người khám từ Excel</DialogTitle>
          <DialogDescription>
            Tải file mẫu của đợt khám, điền dữ liệu rồi tải lên. Hệ thống chỉ thêm người khám mới và
            nhập toàn bộ hoặc không nhập dòng nào.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
            <span className="text-muted-foreground">
              File mẫu gắn với phiên bản hiện tại của đợt khám. Tải lại nếu đợt khám vừa được sửa.
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplate}
              disabled={isDownloadingTemplate || pending}
            >
              {isDownloadingTemplate ? "Đang tải..." : "Tải file mẫu"}
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="participant-import-file" className="text-xs font-medium">
              Tệp Excel (.xlsx, tối đa 5 MB)
            </Label>
            <Input
              key={inputKey}
              id="participant-import-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              disabled={pending}
              aria-invalid={fileError ? true : undefined}
              aria-describedby={fileError ? "participant-import-file-error" : undefined}
              className="h-auto py-1.5 text-xs"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {formatSize(file.size)}
              </p>
            )}
            {fileError && (
              <p id="participant-import-file-error" role="alert" className="text-xs text-destructive">
                {fileError}
              </p>
            )}
          </div>

          {failure && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Không thể nhập danh sách</AlertTitle>
              <AlertDescription>
                <p>{failure.message}</p>
                <p className="mt-1 text-xs">Chưa có người khám nào được thêm vào đợt khám.</p>
                {failure.needsNewTemplate && (
                  <p className="mt-1 text-xs">Hãy tải lại file mẫu mới nhất rồi nhập lại.</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Nhập danh sách thành công</AlertTitle>
              <AlertDescription>
                <p role="status">
                  Đã thêm {result.createdCount} người khám vào đợt khám (tổng {result.totalRows}{" "}
                  dòng).
                </p>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
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
                  Nhập danh sách
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
