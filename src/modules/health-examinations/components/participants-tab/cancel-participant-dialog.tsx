"use client"

import * as React from "react"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
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
import { useCancelParticipant } from "../../hooks/use-health-examination-batches"
import type { HealthExaminationParticipant } from "../../types"
import {
  describeParticipantWriteError,
  type ParticipantWriteFailure,
} from "../../utils/participant-write-errors"

interface CancelParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** The row the user chose; its `rowVersion` is the version the cancellation is based on. */
  participant: HealthExaminationParticipant | null
  onCancelled?: (participant: HealthExaminationParticipant) => void
  onNotice?: (message: string) => void
}

/**
 * Confirms cancelling a Participant. It is a cancellation, not a deletion: the row, its history
 * and its CCCD stay in the batch, and the Participant can be reactivated later if cancelled by mistake.
 */
export function CancelParticipantDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  participant,
  onCancelled,
  onNotice,
}: CancelParticipantDialogProps) {
  const cancelMutation = useCancelParticipant()
  const [failure, setFailure] = React.useState<ParticipantWriteFailure | null>(null)
  const pending = cancelMutation.isPending

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      setFailure(null)
      cancelMutation.reset()
    }
    onOpenChange(next)
  }

  const confirm = async () => {
    if (!participant) return
    setFailure(null)
    try {
      await cancelMutation.mutateAsync({
        organizationId,
        batchId,
        participantId: participant.id,
        rowVersion: participant.rowVersion,
      })
      onCancelled?.(participant)
      onOpenChange(false)
    } catch (error) {
      const described = describeParticipantWriteError(error, "cancel")
      if (described.kind === "forbidden" || described.kind === "not-found") {
        onNotice?.(described.message)
        onOpenChange(false)
        return
      }
      setFailure(described)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Hủy người khám</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bạn muốn hủy <span className="font-medium text-foreground">{participant?.fullName}</span>{" "}
            khỏi danh sách đợt khám?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            Đây là thao tác hủy, không phải xóa: người khám vẫn nằm trong danh sách với trạng thái
            Đã hủy và lịch sử được giữ nguyên.
          </p>
          <p>
            CCCD vẫn được giữ trong đợt khám; có thể khôi phục người khám này sau nếu hủy nhầm.
          </p>
        </div>

        {failure && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{failure.message}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Giữ lại
          </Button>
          <Button type="button" variant="destructive" onClick={() => void confirm()} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {pending ? "Đang hủy..." : "Hủy người khám"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
