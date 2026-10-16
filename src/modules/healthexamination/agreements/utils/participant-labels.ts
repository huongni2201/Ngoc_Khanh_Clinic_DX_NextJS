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
  NO_SHOW: "Không đến",
}

/**
 * The schedule choices of the Participant list. Each is one `unscheduledFor` value of the backend:
 * the Participants with no live session that covers the activity (an "all" session covers both).
 */
export type ParticipantScheduleFilter = "UNSCHEDULED" | "NO_SAMPLING" | "NO_EXAMINATION"

export const PARTICIPANT_SCHEDULE_FILTER_LABELS: Record<ParticipantScheduleFilter, string> = {
  UNSCHEDULED: "Chưa xếp lịch",
  NO_SAMPLING: "Chưa có lịch lấy mẫu",
  NO_EXAMINATION: "Chưa có lịch khám",
}

const SCHEDULE_FILTER_TO_ACTIVITY = {
  UNSCHEDULED: "ANY",
  NO_SAMPLING: "SAMPLING",
  NO_EXAMINATION: "EXAMINATION",
} as const

/** The `unscheduledFor` query value of a schedule choice; nothing when no choice is made. */
export function toUnscheduledFor(schedule: ParticipantScheduleFilter | undefined) {
  return schedule ? SCHEDULE_FILTER_TO_ACTIVITY[schedule] : undefined
}

/** Agreement states in which the backend still accepts new Participants. */
export function isParticipantImportAllowed(agreementStatus: string) {
  return agreementStatus === "DRAFT" || agreementStatus === "ACTIVE"
}

/** Agreement states in which the backend still accepts adding, editing and cancelling a Participant. */
export function isParticipantChangeAllowed(agreementStatus: string) {
  return agreementStatus === "DRAFT" || agreementStatus === "ACTIVE"
}

/** The schedule changes while the agreement is open, like the roster. */
export function isParticipantSchedulingAllowed(agreementStatus: string) {
  return agreementStatus === "DRAFT" || agreementStatus === "ACTIVE"
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
