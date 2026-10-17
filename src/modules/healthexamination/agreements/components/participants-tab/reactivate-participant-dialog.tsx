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
import { useReactivateParticipant } from "../../hooks/use-agreements"
import { healthExaminationKeys } from "../../query-keys"
import type { HealthExaminationParticipant } from "../../types"
import {
  describeParticipantWriteError,
  type ParticipantWriteFailure,
} from "../../utils/participant-write-errors"

const STALE_NOTICE =
  "Dữ liệu người khám đã thay đổi. Danh sách đã được tải lại, vui lòng kiểm tra rồi thử lại."

interface ReactivateParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  agreementId: string
  /** The cancelled row; its `rowVersion` is the version the reactivation is based on. */
  participant: HealthExaminationParticipant | null
  onReactivated?: (participant: HealthExaminationParticipant) => void
  onNotice?: (message: string) => void
}

/**
 * Confirms returning a cancelled Participant to the active roster. The same row becomes active
 * again (nothing is added) and keeps its information. The sessions it was released from are not
 * restored: it is scheduled again afterwards. The backend stays the judge of every rule.
 */
export function ReactivateParticipantDialog({
  open,
  onOpenChange,
  organizationId,
  agreementId,
  participant,
  onReactivated,
  onNotice,
}: ReactivateParticipantDialogProps) {
  const queryClient = useQueryClient()
  const reactivateMutation = useReactivateParticipant()
  const [failure, setFailure] = React.useState<ParticipantWriteFailure | null>(null)
  const pending = reactivateMutation.isPending

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
      queryKey: healthExaminationKeys.participantsRoot(organizationId, agreementId),
    })

  const confirm = async () => {
    if (!participant) return
    setFailure(null)
    try {
      await reactivateMutation.mutateAsync({
        organizationId,
        agreementId,
        participantId: participant.id,
        rowVersion: participant.rowVersion,
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
            sách thỏa thuận?
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          Người khám sẽ trở lại danh sách thỏa thuận (trạng thái Đang trong danh sách); thông tin cũ
          được giữ nguyên, có thể sửa sau. Lịch khám cũ không được khôi phục; hãy xếp lịch lại cho người này.
        </p>

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
