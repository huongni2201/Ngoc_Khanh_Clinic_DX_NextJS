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
