"use client"

import type { ComponentType } from "react"
import { UserCheck, DoorOpen, Eye, CreditCard } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import type { Encounter } from "../../types"

type PrimaryActionHandler = "receive" | "assignRoom" | "view" | "payment"

interface PrimaryAction {
  label: string
  icon: ComponentType<{ className?: string }>
  handler: PrimaryActionHandler
}

const VIEW_DETAIL: PrimaryAction = { label: "Chi tiết", icon: Eye, handler: "view" }

/** The main row action depends on where the encounter is in the reception workflow. */
const PRIMARY_ACTION_BY_STAGE: Partial<Record<NonNullable<Encounter["worklistStage"]>, PrimaryAction>> = {
  WAITING_CHECK_IN: { label: "Tiếp nhận", icon: UserCheck, handler: "receive" },
  WAITING_EXAMINATION: { label: "Phân phòng", icon: DoorOpen, handler: "assignRoom" },
  IN_EXAMINATION: { label: "Xem lượt khám", icon: Eye, handler: "view" },
  WAITING_PAYMENT: { label: "Thu phí", icon: CreditCard, handler: "payment" },
  WAITING_DIAGNOSTIC_RESULTS: { label: "Xem tiến trình", icon: Eye, handler: "view" },
  READY_FOR_CONCLUSION: { label: "Xem tiến trình", icon: Eye, handler: "view" },
  COMPLETED: { label: "Xem hồ sơ", icon: Eye, handler: "view" },
}

interface ReceptionRowPrimaryActionProps {
  encounter: Encounter
  onReceivePatient: (encounter: Encounter) => void
  onAssignRoom: (encounter: Encounter) => void
  onViewEncounter: (encounter: Encounter) => void
  onProcessPayment: (encounter: Encounter) => void
}

export function ReceptionRowPrimaryAction({
  encounter,
  onReceivePatient,
  onAssignRoom,
  onViewEncounter,
  onProcessPayment,
}: ReceptionRowPrimaryActionProps) {
  const action =
    (encounter.worklistStage && PRIMARY_ACTION_BY_STAGE[encounter.worklistStage]) || VIEW_DETAIL
  const Icon = action.icon
  const handlers: Record<PrimaryActionHandler, (encounter: Encounter) => void> = {
    receive: onReceivePatient,
    assignRoom: onAssignRoom,
    view: onViewEncounter,
    payment: onProcessPayment,
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => handlers[action.handler](encounter)}
      className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
      title={`${action.label} - ${encounter.patientName}`}
      aria-label={action.label}
    >
      <Icon className="size-3.5" />
      <span className="sr-only">{action.label}</span>
    </Button>
  )
}
