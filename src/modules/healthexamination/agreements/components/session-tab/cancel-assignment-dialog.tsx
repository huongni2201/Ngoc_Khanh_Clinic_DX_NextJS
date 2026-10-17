"use client"

import * as React from "react"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import { toast } from "@/shared/ui/toaster"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCancelSessionAssignment } from "../../hooks/use-sessions"
import type { SessionAssignmentRow } from "../../types"
import { describeSchedulingError } from "../../utils/session-errors"

const NOTE_MAX_LENGTH = 1000

interface CancelAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  sessionId: string
  /** The row whose assignment is cancelled; its version is the one the request is based on. */
  row: SessionAssignmentRow | null
}

/**
 * Takes one Participant out of a session. The Participant stays on the roster and can be given
 * another session; only an assignment still waiting can be cancelled.
 */
export function CancelAssignmentDialog({
  open,
  onOpenChange,
  organizationId,
  sessionId,
  row,
}: CancelAssignmentDialogProps) {
  const mutation = useCancelSessionAssignment()
  const [note, setNote] = React.useState("")
  const [failure, setFailure] = React.useState<string | null>(null)
  const pending = mutation.isPending

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      setNote("")
      setFailure(null)
      mutation.reset()
    }
    onOpenChange(next)
  }

  const confirm = async () => {
    if (!row) return
    setFailure(null)
    try {
      await mutation.mutateAsync({
        organizationId,
        sessionId,
        assignmentId: row.assignmentId,
        rowVersion: row.assignmentRowVersion,
        note,
      })
      toast.success(`Đã hủy phân lịch của ${row.fullName}.`)
      handleOpenChange(false)
    } catch (error) {
      setFailure(describeSchedulingError(error, "cancel-assignment").message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Hủy phân lịch</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bỏ <span className="font-medium text-foreground">{row?.fullName}</span> khỏi lịch khám này?
            Người khám vẫn ở trong danh sách và có thể được xếp lịch khác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="cancel-assignment-note">Lý do (không bắt buộc)</Label>
          <Textarea
            id="cancel-assignment-note"
            rows={3}
            maxLength={NOTE_MAX_LENGTH}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={pending}
          />
        </div>

        {failure && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{failure}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Để sau
          </Button>
          <Button type="button" variant="destructive" onClick={() => void confirm()} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {pending ? "Đang hủy..." : "Hủy phân lịch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
