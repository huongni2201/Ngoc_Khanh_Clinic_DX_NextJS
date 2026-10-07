import type {
  ParticipantAttendanceStatus,
  ParticipantReconciliationStatus,
  ParticipantRosterStatus,
  ParticipantSex,
} from "../types"

export const PARTICIPANT_SEX_LABELS: Record<ParticipantSex, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
  UNKNOWN: "Chưa xác định",
}

export const PARTICIPANT_ROSTER_STATUS_LABELS: Record<ParticipantRosterStatus, string> = {
  ACTIVE: "Đang trong danh sách",
  CANCELLED: "Đã hủy",
}

export const PARTICIPANT_ATTENDANCE_STATUS_LABELS: Record<ParticipantAttendanceStatus, string> = {
  UNCONFIRMED: "Chưa xác nhận",
  ATTENDED: "Đã đến khám",
  ABSENT: "Vắng mặt",
}

export const PARTICIPANT_RECONCILIATION_STATUS_LABELS: Record<
  ParticipantReconciliationStatus,
  string
> = {
  PENDING: "Chờ đối soát",
  RECONCILED: "Đã đối soát",
}

/** Batch states in which the backend still accepts new Participants. */
export function isParticipantImportAllowed(batchStatus: string) {
  return batchStatus === "DRAFT" || batchStatus === "READY"
}

/** Batch states in which the backend still accepts adding, editing and cancelling a Participant. */
export function isParticipantChangeAllowed(batchStatus: string) {
  return batchStatus === "DRAFT" || batchStatus === "READY"
}

/** Why a Participant cannot be cancelled, or `null` when it can (the backend decides in the end). */
export function getParticipantCancelBlockReason(participant: {
  preparedAt?: string
  attendanceStatus: ParticipantAttendanceStatus
  reconciliationStatus: ParticipantReconciliationStatus
}): string | null {
  if (
    participant.preparedAt ||
    participant.attendanceStatus === "ATTENDED" ||
    participant.reconciliationStatus === "RECONCILED"
  ) {
    return "Không thể hủy người khám đã được chuẩn bị lượt khám, đã đến khám hoặc đã đối soát."
  }
  return null
}
