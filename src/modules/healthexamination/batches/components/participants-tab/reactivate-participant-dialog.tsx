"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { Label } from "@/components/ui/label"
import { useReactivateParticipant } from "../../hooks/use-health-examination-batches"
import { healthExaminationKeys } from "../../query-keys"
import type { HealthExaminationBatchDay, HealthExaminationParticipant } from "../../types"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import {
  describeParticipantWriteError,
  type ParticipantWriteFailure,
} from "../../utils/participant-write-errors"

const DAY_SELECT_ID = "reactivate-participant-day"
const STALE_NOTICE =
  "Dữ liệu người khám đã thay đổi. Danh sách đã được tải lại, vui lòng kiểm tra rồi thử lại."

interface ReactivateParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** The cancelled row; its `rowVersion` is the version the reactivation is based on. */
  participant: HealthExaminationParticipant | null
  /** The days of the batch the Participant can be put back on. */
  days: HealthExaminationBatchDay[]
  onReactivated?: (participant: HealthExaminationParticipant) => void
  onNotice?: (message: string) => void
}

/**
 * Confirms returning a cancelled Participant to the active roster. The same row becomes active
 * again (nothing is added), keeps its information and can be put on another examination day. The
 * backend stays the judge of every rule.
 */
export function ReactivateParticipantDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  participant,
  days,
  onReactivated,
  onNotice,
}: ReactivateParticipantDialogProps) {
  const queryClient = useQueryClient()
  const reactivateMutation = useReactivateParticipant()
  const [failure, setFailure] = React.useState<ParticipantWriteFailure | null>(null)
  const pending = reactivateMutation.isPending

  // Starts on the day the Participant had when it was cancelled; `null` means "not changed yet".
  // The choice is dropped whenever the dialog's Participant changes (the parent clears it on close).
  const participantId = participant?.id
  const [pickedDayId, setPickedDayId] = React.useState<string | null>(null)
  const [pickedFor, setPickedFor] = React.useState(participantId)
  if (pickedFor !== participantId) {
    setPickedFor(participantId)
    setPickedDayId(null)
  }
  const dayId = pickedDayId ?? participant?.batchDayId ?? ""

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      setFailure(null)
      reactivateMutation.reset()
    }
    onOpenChange(next)
  }

  const reloadList = () =>
    queryClient.invalidateQueries({
      queryKey: healthExaminationKeys.participantsRoot(organizationId, batchId),
    })

  const confirm = async () => {
    if (!participant) return
    setFailure(null)
    try {
      await reactivateMutation.mutateAsync({
        organizationId,
        batchId,
        participantId: participant.id,
        rowVersion: participant.rowVersion,
        batchDayId: dayId || undefined,
      })
      onReactivated?.(participant)
      onOpenChange(false)
    } catch (error) {
      const described = describeParticipantWriteError(error, "reactivate")
      switch (described.kind) {
        case "stale-version":
          void reloadList()
          onNotice?.(STALE_NOTICE)
          onOpenChange(false)
          return
        case "not-cancelled":
          void reloadList()
          onNotice?.(described.message)
          onOpenChange(false)
          return
        case "forbidden":
        case "not-found":
          onNotice?.(described.message)
          onOpenChange(false)
          return
        default:
          setFailure(described)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Khôi phục người khám</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bạn muốn khôi phục{" "}
            <span className="font-medium text-foreground">{participant?.fullName}</span> vào danh
            sách đợt khám?
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          Người khám sẽ trở lại danh sách đợt khám (trạng thái Đang trong danh sách); thông tin cũ
          được giữ nguyên, có thể sửa sau.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor={DAY_SELECT_ID}>Ngày khám</Label>
          <select
            id={DAY_SELECT_ID}
            value={dayId}
            onChange={(event) => setPickedDayId(event.target.value)}
            disabled={pending}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {formatHealthExaminationDate(day.examinationDate)}
              </option>
            ))}
          </select>
        </div>

        {failure && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{failure.message}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Để sau
          </Button>
          <Button type="button" onClick={() => void confirm()} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {pending ? "Đang khôi phục..." : "Khôi phục người khám"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
