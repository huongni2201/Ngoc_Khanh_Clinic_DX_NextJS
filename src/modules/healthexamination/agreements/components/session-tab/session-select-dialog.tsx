"use client"

import * as React from "react"
import { AlertCircle, Loader2, Plus } from "@/shared/ui/product-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useExaminationSessions } from "../../hooks/use-sessions"
import type { ExaminationSession } from "../../types"
import { formatSessionOption } from "../../utils/session-labels"
import { SessionFormDialog } from "./session-form-dialog"

/** Most sessions the picker lists; more than this means the organization should cancel old ones. */
const PICKER_PAGE_SIZE = 100

export interface SessionSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  /** Lists the sessions of this agreement and the shared ones; omitted lists every open session. */
  agreement?: { id: string; name: string }
  /** The session the choice starts from (a move cannot target it). */
  excludeSessionId?: string
  title: string
  description: React.ReactNode
  confirmLabel: string
  pendingLabel: string
  pending: boolean
  /** Vietnamese text of the last failure; shown above the list. */
  errorMessage?: string | null
  /** Offers "Tạo lịch khám mới" inside the picker (needs the create permission). */
  canCreateSession?: boolean
  onConfirm: (session: ExaminationSession) => void
}

/**
 * Chooses an open session as the target of an assignment, a move or a whole-session move. Only the
 * backend decides whether the choice is valid (dates, agreement scope, duplicates).
 */
export function SessionSelectDialog({
  open,
  onOpenChange,
  organizationId,
  agreement,
  excludeSessionId,
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending,
  errorMessage,
  canCreateSession = false,
  onConfirm,
}: SessionSelectDialogProps) {
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const { data, isLoading, isError, error, refetch } = useExaminationSessions(
    organizationId,
    {
      agreementId: agreement?.id,
      status: "OPEN",
      page: 1,
      pageSize: PICKER_PAGE_SIZE,
      sortKey: "sessionDate",
      sortBy: "ASC",
    },
    { enabled: open }
  )
  const sessions = (data?.data ?? []).filter((session) => session.id !== excludeSessionId)
  const picked = sessions.find((session) => session.id === pickedId) ?? null

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) setPickedId(null)
    onOpenChange(next)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[560px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div role="alert" className="space-y-2 text-xs text-destructive">
              <p>{error instanceof Error ? error.message : "Không thể tải danh sách lịch khám."}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Chưa có lịch khám nào đang mở để chọn.
              {canCreateSession ? " Hãy tạo lịch khám mới." : ""}
            </p>
          ) : (
            <ul aria-label="Lịch khám đang mở" className="max-h-72 space-y-1.5 overflow-y-auto">
              {sessions.map((session) => (
                <li key={session.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                      pickedId === session.id
                        ? "border-primary bg-selected"
                        : "border-border hover:bg-hover/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="target-session"
                      value={session.id}
                      checked={pickedId === session.id}
                      onChange={() => setPickedId(session.id)}
                      disabled={pending}
                    />
                    <span>{formatSessionOption(session)}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {canCreateSession && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setIsCreateOpen(true)}
              disabled={pending}
            >
              <Plus aria-hidden="true" className="mr-1.5 size-3.5" />
              Tạo lịch khám mới
            </Button>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
              Để sau
            </Button>
            <Button type="button" onClick={() => picked && onConfirm(picked)} disabled={pending || !picked}>
              {pending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canCreateSession && (
        <SessionFormDialog
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          organizationId={organizationId}
          agreement={agreement}
          onSaved={(session) => setPickedId(session.id)}
        />
      )}
    </>
  )
}
