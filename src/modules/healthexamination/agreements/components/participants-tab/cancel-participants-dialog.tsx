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
import {
  useCancelParticipants,
  type CancelParticipantsResult,
} from "../../hooks/use-agreements"
import type { ParticipantSelectionEntry } from "../../types"

/** Names shown before the list is cut to "và N người khác". */
const MAX_LISTED_NAMES = 3

interface CancelParticipantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  agreementId: string
  /** The ticked Participants when the dialog was opened; their `rowVersion` is what each cancellation is based on. */
  participants: ParticipantSelectionEntry[]
  /** Called once the run ends, so the caller can untick those that were cancelled. */
  onProcessed?: (result: CancelParticipantsResult, participants: ParticipantSelectionEntry[]) => void
}

/**
 * Confirms cancelling the ticked Participants. It is a cancellation, not a deletion: the rows, their
 * history and their CCCD stay in the agreement, and a Participant cancelled by mistake can be reactivated.
 * Participants already prepared, attended or reconciled are skipped; the backend decides in the end.
 */
export function CancelParticipantsDialog({
  open,
  onOpenChange,
  organizationId,
  agreementId,
  participants,
  onProcessed,
}: CancelParticipantsDialogProps) {
  const cancelMutation = useCancelParticipants()
  const [result, setResult] = React.useState<CancelParticipantsResult | null>(null)
  const pending = cancelMutation.isPending

  const eligible = participants.filter((participant) => participant.cancelBlockReason === null)
  const blockedCount = participants.length - eligible.length
  const names = eligible.slice(0, MAX_LISTED_NAMES).map((participant) => participant.fullName)
  const others = eligible.length - names.length
  const nameById = new Map(participants.map((participant) => [participant.id, participant.fullName]))
  const confirmLabel = eligible.length > 1 ? `Hủy ${eligible.length} người khám` : "Hủy người khám"

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      setResult(null)
      cancelMutation.reset()
    }
    onOpenChange(next)
  }

  const confirm = async () => {
    if (eligible.length === 0) return
    let outcome: CancelParticipantsResult
    try {
      outcome = await cancelMutation.mutateAsync({
        organizationId,
        agreementId,
        participants: eligible.map(({ id, rowVersion }) => ({ id, rowVersion })),
      })
    } catch {
      return
    }
    onProcessed?.(outcome, participants)
    if (outcome.failed.length === 0 && outcome.notAttempted.length === 0) {
      handleOpenChange(false)
      return
    }
    setResult(outcome)
  }

  const failedMessages = result ? [...new Set(result.failed.map((failure) => failure.message))] : []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Hủy người khám</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {eligible.length > 0 ? (
              <>
                Bạn muốn hủy{" "}
                <span className="font-medium text-foreground">
                  {names.join(", ")}
                  {others > 0 ? ` và ${others.toLocaleString("vi-VN")} người khác` : ""}
                </span>{" "}
                khỏi danh sách thỏa thuận?
              </>
            ) : (
              "Những người khám đã chọn đều không thể hủy."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            Đây là thao tác hủy, không phải xóa: người khám vẫn nằm trong danh sách với trạng thái
            Đã hủy và lịch sử được giữ nguyên.
          </p>
          <p>
            CCCD vẫn được giữ trong thỏa thuận; có thể khôi phục{" "}
            {eligible.length > 1 ? "những người khám này" : "người khám này"} sau nếu hủy nhầm.
          </p>
          {blockedCount > 0 && (
            <p role="note" className="text-foreground">
              {blockedCount.toLocaleString("vi-VN")} người đã được chuẩn bị lượt khám, đã đến khám
              hoặc đã đối soát nên không thể hủy và sẽ được bỏ qua.
            </p>
          )}
        </div>

        {result && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="space-y-1 text-xs">
              <p>
                Đã hủy {result.cancelled.length.toLocaleString("vi-VN")} người; không hủy được{" "}
                {(result.failed.length + result.notAttempted.length).toLocaleString("vi-VN")} người
                (vẫn đang được chọn):{" "}
                {[...result.failed.map((failure) => failure.id), ...result.notAttempted]
                  .map((id) => nameById.get(id) ?? id)
                  .slice(0, MAX_LISTED_NAMES)
                  .join(", ")}
                .
              </p>
              {failedMessages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {result ? (
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Xong
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
                Giữ lại
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void confirm()}
                disabled={pending || eligible.length === 0}
              >
                {pending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                {pending ? "Đang hủy..." : confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
