import type { EncounterStatus, DiagnosticWorkflowStatus } from "@/modules/encounters/types"
import type { PaymentStatus } from "@/modules/billing/types"

export type ReceptionWorklistStage =
  | "WAITING_CHECK_IN"
  | "WAITING_EXAMINATION"
  | "IN_EXAMINATION"
  | "WAITING_PAYMENT"
  | "WAITING_DIAGNOSTIC_RESULTS"
  | "READY_FOR_CONCLUSION"
  | "COMPLETED"
  | "CANCELLED"

export interface ReceptionWorklistStageInput {
  checkInStatus: "NOT_CHECKED_IN" | "CHECKED_IN"
  encounterStatus?: EncounterStatus
  paymentStatus?: PaymentStatus
  diagnosticWorkflowStatus?: DiagnosticWorkflowStatus
}

export function deriveReceptionWorklistStage(
  input: ReceptionWorklistStageInput,
): ReceptionWorklistStage {
  if (input.checkInStatus === "NOT_CHECKED_IN") {
    return "WAITING_CHECK_IN"
  }

  if (input.encounterStatus === "CANCELLED") {
    return "CANCELLED"
  }

  if (input.encounterStatus === "IN_PROGRESS") {
    return "IN_EXAMINATION"
  }

  if (input.encounterStatus === "PLANNED" || input.encounterStatus === "ON_HOLD" || !input.encounterStatus) {
    return "WAITING_EXAMINATION"
  }

  if (input.paymentStatus === "PENDING") {
    return "WAITING_PAYMENT"
  }

  if (input.diagnosticWorkflowStatus === "ORDERED" || input.diagnosticWorkflowStatus === "IN_PROGRESS") {
    return "WAITING_DIAGNOSTIC_RESULTS"
  }

  if (input.diagnosticWorkflowStatus === "RESULTS_AVAILABLE") {
    return "READY_FOR_CONCLUSION"
  }

  return "COMPLETED"
}
