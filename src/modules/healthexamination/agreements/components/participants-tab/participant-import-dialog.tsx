"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Loader2, Plus, Upload } from "@/shared/ui/product-icon"
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
import { useImportHealthExaminationAgreementParticipants } from "../../hooks/use-agreements"
import { useExaminationSessions } from "../../hooks/use-sessions"
import { healthExaminationKeys } from "../../query-keys"
import type { ParticipantImportResult } from "../../types"
import {
  describeParticipantImportError,
  validateParticipantImportFile,
  type ParticipantImportFailure,
} from "../../utils/participant-import-errors"
import { formatSessionOption } from "../../utils/session-labels"
import { SessionFormDialog } from "../session-tab/session-form-dialog"
import { formatFileSize } from "@/lib/format-file-size"

/** Most open sessions the picker lists, as in the session picker used for scheduling. */
const SESSION_PICKER_PAGE_SIZE = 100
const NO_SESSION = ""

interface ParticipantImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  agreementId: string
  /** Shown as the default reservation when a session is created from the picker. */
  agreementName?: string
  /** The agreement `rowVersion` the workbook must have been prepared for. */
  rowVersion: number
  onDownloadTemplate?: () => void
  isDownloadingTemplate: boolean
  /**
   * UX only: the backend decides. Offers choosing the examination day so the imported people are
   * scheduled in the same step. Needs the assignment and session list permissions.
   */
  canAssign?: boolean
  /** UX only: the backend decides. Offers "Tạo lịch khám mới" next to the day picker. */
  canCreateSession?: boolean
  /** Called with the result of a successful import just before the dialog closes. */
  onImported?: (result: ParticipantImportResult) => void
}

/**
 * Uploads a roster workbook. The import is all-or-nothing, so a rejected file adds nobody. A new
 * Idempotency-Key is created for each chosen file and reused while the same file is resent, so a
 * retry after a dropped connection never imports twice. A successful import closes the dialog.
 *
 * Optionally the examination day (an open session) is chosen here too: the backend then puts every
 * imported person into it in the same commit. The day is part of the request identity, so choosing
 * another one starts a new Idempotency-Key.
 */
export function ParticipantImportDialog({
  open,
  onOpenChange,
  organizationId,
  agreementId,
  agreementName = "",
  rowVersion,
  onDownloadTemplate,
  isDownloadingTemplate,
  canAssign = false,
  canCreateSession = false,
  onImported,
}: ParticipantImportDialogProps) {
  const queryClient = useQueryClient()
  const importMutation = useImportHealthExaminationAgreementParticipants()
  const [file, setFile] = React.useState<File | null>(null)
  const [idempotencyKey, setIdempotencyKey] = React.useState<string | null>(null)
  const [sessionId, setSessionId] = React.useState(NO_SESSION)
  const [isCreateSessionOpen, setIsCreateSessionOpen] = React.useState(false)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [failure, setFailure] = React.useState<ParticipantImportFailure | null>(null)
  const [inputKey, setInputKey] = React.useState(0)
  const pending = importMutation.isPending
  const sessionsQuery = useExaminationSessions(
    organizationId,
    {
      agreementId,
      status: "OPEN",
      page: 1,
      pageSize: SESSION_PICKER_PAGE_SIZE,
      sortKey: "sessionDate",
      sortBy: "ASC",
    },
    { enabled: open && canAssign }
  )
  const sessions = sessionsQuery.data?.data ?? []
  const effectiveSessionId = canAssign ? sessionId : NO_SESSION

  const reset = React.useCallback(() => {
    setFile(null)
    setIdempotencyKey(null)
    setSessionId(NO_SESSION)
    setFileError(null)
    setFailure(null)
    setInputKey((value) => value + 1)
    importMutation.reset()
  }, [importMutation])

  const handleSessionChange = (next: string) => {
    setSessionId(next)
    setFailure(null)
    importMutation.reset()
    // Another day is another request: the same key with a different session is a conflict.
    if (file) setIdempotencyKey(crypto.randomUUID())
  }

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
        agreementId,
        file,
        rowVersion,
        idempotencyKey,
        ...(effectiveSessionId ? { sessionId: effectiveSessionId } : {}),
      })
      reset()
      onImported?.(imported)
      onOpenChange(false)
    } catch (error) {
      const described = describeParticipantImportError(error, {
        withSession: Boolean(effectiveSessionId),
      })
      setFailure(described)
      if (described.needsNewTemplate) {
        // The cached agreement version may be stale; reading it again makes the next template match.
        void queryClient.invalidateQueries({
          queryKey: healthExaminationKeys.agreement(organizationId, agreementId),
        })
      }
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập danh sách người khám từ Excel</DialogTitle>
          <DialogDescription>
            {onDownloadTemplate
              ? "Tải file mẫu của thỏa thuận, điền dữ liệu rồi tải lên."
              : "Chọn file Excel theo mẫu của thỏa thuận rồi tải lên."} {" "}
            Hệ thống chỉ thêm người khám mới và nhập toàn bộ hoặc không nhập dòng nào.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {onDownloadTemplate && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <span className="text-muted-foreground">
                File mẫu gắn với phiên bản hiện tại của thỏa thuận. Tải lại nếu thỏa thuận vừa được sửa.
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

          {canAssign && (
            <div className="space-y-1.5">
              <Label htmlFor="participant-import-session" className="text-xs font-medium">
                Ngày khám (không bắt buộc)
              </Label>
              <select
                id="participant-import-session"
                value={effectiveSessionId}
                onChange={(event) => handleSessionChange(event.target.value)}
                disabled={pending || sessionsQuery.isLoading}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value={NO_SESSION}>Chưa xếp lịch, xếp sau</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {formatSessionOption(session)}
                  </option>
                ))}
              </select>
              {sessionsQuery.isError && (
                <p role="alert" className="text-xs text-destructive">
                  Không thể tải danh sách lịch khám. Vẫn có thể nhập danh sách rồi xếp lịch sau.
                </p>
              )}
              {effectiveSessionId && (
                <p className="text-xs text-muted-foreground">
                  Mọi người trong file sẽ được xếp vào lịch này ngay khi nhập. Nếu không xếp được thì
                  không ai được thêm.
                </p>
              )}
              {canCreateSession && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setIsCreateSessionOpen(true)}
                  disabled={pending}
                >
                  <Plus aria-hidden="true" className="mr-1.5 size-3.5" />
                  Tạo lịch khám mới
                </Button>
              )}
            </div>
          )}

          {failure && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Không thể nhập danh sách</AlertTitle>
              <AlertDescription>
                <p>{failure.message}</p>
                <p className="mt-1 text-xs">Chưa có người khám nào được thêm vào thỏa thuận.</p>
                {failure.needsNewTemplate && (
                  <p className="mt-1 text-xs">Hãy tải lại file mẫu mới nhất rồi nhập lại.</p>
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

    {canAssign && canCreateSession && (
      <SessionFormDialog
        mode="create"
        open={isCreateSessionOpen}
        onOpenChange={setIsCreateSessionOpen}
        organizationId={organizationId}
        agreement={{ id: agreementId, name: agreementName }}
        onSaved={(session) => handleSessionChange(session.id)}
      />
    )}
    </>
  )
}
