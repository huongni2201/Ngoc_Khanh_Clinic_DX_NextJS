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
import { useCancelExaminationSession } from "../../hooks/use-sessions"
import type { ExaminationSession } from "../../types"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import { describeSchedulingError } from "../../utils/session-errors"

interface CancelSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  /** The session as last read; its version is the one the cancellation is based on. */
  session: ExaminationSession | null
}

/**
 * Cancels a session nobody is assigned to; the backend refuses while people are still in it, and
 * the message says to move or cancel them first. The slot is free again afterwards.
 */
export function CancelSessionDialog({
  open,
  onOpenChange,
  organizationId,
  session,
}: CancelSessionDialogProps) {
  const mutation = useCancelExaminationSession()
  const [failure, setFailure] = React.useState<string | null>(null)
  const pending = mutation.isPending

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      setFailure(null)
      mutation.reset()
    }
    onOpenChange(next)
  }

  const confirm = async () => {
    if (!session) return
    setFailure(null)
    try {
      await mutation.mutateAsync({
        organizationId,
        sessionId: session.id,
        rowVersion: session.rowVersion,
      })
      toast.success(`Đã hủy lịch khám ngày ${formatHealthExaminationDate(session.sessionDate)}.`)
      handleOpenChange(false)
    } catch (error) {
      setFailure(describeSchedulingError(error, "cancel-session").message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Hủy lịch khám</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Hủy lịch khám ngày{" "}
            <span className="font-medium text-foreground">
              {formatHealthExaminationDate(session?.sessionDate)}
            </span>
            ? Chỉ hủy được khi không còn người nào được xếp vào lịch này.
          </DialogDescription>
        </DialogHeader>

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
            {pending ? "Đang hủy..." : "Hủy lịch khám"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
