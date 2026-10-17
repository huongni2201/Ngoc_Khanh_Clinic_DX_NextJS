import type { StatusTone } from "@/shared/ui"
import type {
  AssignmentStatus,
  ExaminationSession,
  ExaminationSiteType,
  SessionActivity,
  SessionStatus,
} from "../types"
import { formatHealthExaminationDate } from "./format-health-examination-date"
import { EXAMINATION_SITE_TYPE_LABELS } from "./agreement-labels"

export const SESSION_ACTIVITY_LABELS: Record<SessionActivity, string> = {
  ALL: "Lấy mẫu và khám",
  SAMPLING: "Lấy mẫu",
  EXAMINATION: "Khám",
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  OPEN: "Đang mở",
  CANCELLED: "Đã hủy",
}

export const SESSION_STATUS_TONES: Record<SessionStatus, StatusTone> = {
  OPEN: "info",
  CANCELLED: "neutral",
}

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ASSIGNED: "Chờ khám",
  ATTENDED: "Đã đến",
  NO_SHOW: "Không đến",
  MOVED: "Đã đổi lịch",
  CANCELLED: "Đã hủy",
}

export const ASSIGNMENT_STATUS_TONES: Record<AssignmentStatus, StatusTone> = {
  ASSIGNED: "info",
  ATTENDED: "success",
  NO_SHOW: "warning",
  MOVED: "neutral",
  CANCELLED: "neutral",
}

/** The place of a session: the clinic, or the address at the organization. */
export function formatSessionSite(session: {
  siteType: ExaminationSiteType
  siteAddress?: string
}) {
  if (session.siteType === "CLINIC") return EXAMINATION_SITE_TYPE_LABELS.CLINIC
  return session.siteAddress
    ? `${EXAMINATION_SITE_TYPE_LABELS.ORGANIZATION_SITE}: ${session.siteAddress}`
    : EXAMINATION_SITE_TYPE_LABELS.ORGANIZATION_SITE
}

/** One line that tells sessions apart in a picker: date, activity and place. */
export function formatSessionOption(session: ExaminationSession) {
  return `${formatHealthExaminationDate(session.sessionDate)} · ${
    SESSION_ACTIVITY_LABELS[session.activity]
  } · ${formatSessionSite(session)} · ${session.assignedCount.toLocaleString("vi-VN")} người`
}

/** An open session can be edited and takes new Participants; a cancelled one is history. */
export function isSessionOpen(status: SessionStatus) {
  return status === "OPEN"
}

/** The assignment states the user can still change: a missed or wrongly recorded one can be fixed. */
export function isAssignmentChangeable(status: AssignmentStatus) {
  return status === "ASSIGNED" || status === "NO_SHOW" || status === "ATTENDED"
}
