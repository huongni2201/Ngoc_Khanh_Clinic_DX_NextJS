"use client"

import * as React from "react"
import { SESSION_ASSIGN_MAX_PARTICIPANTS } from "../../api/sessions"
import { useAssignParticipantsToSession } from "../../hooks/use-sessions"
import type { AssignParticipantsResult, ExaminationSession } from "../../types"
import { describeSchedulingError } from "../../utils/session-errors"
import { SessionSelectDialog } from "./session-select-dialog"

export interface AssignSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  agreement: { id: string; name: string }
  /** The ticked Participants, in the order they were ticked. */
  participantIds: readonly string[]
  canCreateSession?: boolean
  onAssigned?: (result: AssignParticipantsResult, session: ExaminationSession) => void
}

/**
 * Puts the ticked Participants into a session. People already in the session are skipped by the
 * backend and reported, not treated as an error. Nothing is resent automatically.
 */
export function AssignSessionDialog({
  open,
  onOpenChange,
  organizationId,
  agreement,
  participantIds,
  canCreateSession = false,
  onAssigned,
}: AssignSessionDialogProps) {
  const mutation = useAssignParticipantsToSession()
  const [failure, setFailure] = React.useState<string | null>(null)
  const tooMany = participantIds.length > SESSION_ASSIGN_MAX_PARTICIPANTS

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFailure(null)
      mutation.reset()
    }
    onOpenChange(next)
  }

  const handleConfirm = async (session: ExaminationSession) => {
    setFailure(null)
    try {
      const result = await mutation.mutateAsync({
        organizationId,
        sessionId: session.id,
        participantIds: [...participantIds],
      })
      onAssigned?.(result, session)
      handleOpenChange(false)
    } catch (error) {
      setFailure(describeSchedulingError(error, "assign").message)
    }
  }

  return (
    <SessionSelectDialog
      open={open}
      onOpenChange={handleOpenChange}
      organizationId={organizationId}
      agreement={agreement}
      title="Xếp lịch khám"
      description={`Chọn lịch khám cho ${participantIds.length.toLocaleString("vi-VN")} người khám đã chọn. Người đã có trong lịch đó sẽ được bỏ qua.`}
      confirmLabel="Xếp lịch"
      pendingLabel="Đang xếp lịch..."
      pending={mutation.isPending}
      errorMessage={
        tooMany
          ? `Mỗi lần chỉ xếp tối đa ${SESSION_ASSIGN_MAX_PARTICIPANTS.toLocaleString("vi-VN")} người. Hãy bỏ bớt người đã chọn.`
          : failure
      }
      canCreateSession={canCreateSession}
      onConfirm={(session) => {
        if (!tooMany) void handleConfirm(session)
      }}
    />
  )
}
