"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Loader2, Upload } from "@/shared/ui/product-icon"
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
import { formatFileSize } from "@/lib/format-file-size"

interface ParticipantImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** The batch `rowVersion` the workbook must have been prepared for. */
  rowVersion: number
  onDownloadTemplate?: () => void
  isDownloadingTemplate: boolean
  /** Called with the result of a successful import just before the dialog closes. */
  onImported?: (result: ParticipantImportResult) => void
}

/**
 * Uploads a roster workbook. The import is all-or-nothing, so a rejected file adds nobody. A new
 * Idempotency-Key is created for each chosen file and reused while the same file is resent, so a
 * retry after a dropped connection never imports twice. A successful import closes the dialog.
 */
export function ParticipantImportDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  rowVersion,
  onDownloadTemplate,
  isDownloadingTemplate,
  onImported,
}: ParticipantImportDialogProps) {
  const queryClient = useQueryClient()
  const importMutation = useImportHealthExaminationBatchParticipants()
  const [file, setFile] = React.useState<File | null>(null)
  const [idempotencyKey, setIdempotencyKey] = React.useState<string | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [failure, setFailure] = React.useState<ParticipantImportFailure | null>(null)
  const [inputKey, setInputKey] = React.useState(0)
  const pending = importMutation.isPending

  const reset = React.useCallback(() => {
    setFile(null)
    setIdempotencyKey(null)
    setFileError(null)
    setFailure(null)
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
      reset()
      onImported?.(imported)
      onOpenChange(false)
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
            {onDownloadTemplate
              ? "Tải tệp mẫu của đợt khám, điền dữ liệu rồi tải lên."
              : "Chọn tệp Excel theo mẫu của đợt khám rồi tải lên."} {" "}
            Hệ thống chỉ thêm người khám mới và nhập toàn bộ hoặc không nhập dòng nào.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {onDownloadTemplate && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <span className="text-muted-foreground">
                Tệp mẫu gắn với phiên bản hiện tại của đợt khám. Tải lại nếu đợt khám vừa được sửa.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDownloadTemplate}
                disabled={isDownloadingTemplate || pending}
              >
                {isDownloadingTemplate ? "Đang tải..." : "Tải tệp mẫu"}
              </Button>
            </div>
          )}

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
                {file.name} · {formatFileSize(file.size)}
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
                  <p className="mt-1 text-xs">Hãy tải lại tệp mẫu mới nhất rồi nhập lại.</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
              Hủy
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
