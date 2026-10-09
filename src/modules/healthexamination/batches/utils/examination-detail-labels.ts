import type {
  ExaminationDetailRow,
  ExaminationStatusFilter,
  ParticipantAttendanceStatus,
  ParticipantReconciliationStatus,
} from "../types"

export const EXAMINATION_STATUS_FILTER_LABELS: Record<ExaminationStatusFilter, string> = {
  UNCONFIRMED: "Chưa đến",
  ABSENT: "Vắng",
  ATTENDED_PENDING: "Đã đến – chờ đối soát",
  RECONCILED: "Đã đối soát",
}

/**
 * The label of one Participant on the examination detail screen. It is derived here, from the
 * attendance and reconciliation values the backend returns; the backend has no such status.
 */
export function getExaminationStatusLabel(row: {
  attendanceStatus: ParticipantAttendanceStatus
  reconciliationStatus: ParticipantReconciliationStatus
}): string {
  return EXAMINATION_STATUS_FILTER_LABELS[getExaminationStatus(row)]
}

export function getExaminationStatus(row: {
  attendanceStatus: ParticipantAttendanceStatus
  reconciliationStatus: ParticipantReconciliationStatus
}): ExaminationStatusFilter {
  if (row.reconciliationStatus === "RECONCILED") return "RECONCILED"
  if (row.attendanceStatus === "ATTENDED") return "ATTENDED_PENDING"
  if (row.attendanceStatus === "ABSENT") return "ABSENT"
  return "UNCONFIRMED"
}

/** Whether a batch service was recorded as performed for the row (the "X" of the matrix). */
export function isServicePerformed(row: Pick<ExaminationDetailRow, "performedBatchServiceIds">, batchServiceId: string) {
  return row.performedBatchServiceIds.includes(batchServiceId)
}

/** Batch states in which the backend accepts an examination detail import. */
export function isExaminationImportAllowed(batchStatus: string) {
  return batchStatus === "DRAFT" || batchStatus === "READY"
}
