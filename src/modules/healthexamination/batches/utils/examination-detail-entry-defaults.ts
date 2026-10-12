import type { ExaminationDetailRow, RecordableAttendanceStatus } from "../types"

const BUSINESS_TIME_ZONE = "Asia/Ho_Chi_Minh"

/** Today as `yyyy-MM-dd` in business time, the same day the backend uses as the upper limit. */
export function getBusinessToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export interface ExaminationEntryValues {
  attendanceStatus: RecordableAttendanceStatus
  /** `yyyy-MM-dd`; empty while the Participant is absent. */
  actualExaminationDate: string
  performedBatchServiceIds: string[]
}

/**
 * The values the sheet opens with. The recorded date wins; otherwise the planned date when it is
 * not in the future; otherwise today. An absent Participant opens as absent, everybody else as
 * attended (the common case when entering by hand).
 */
export function buildExaminationEntryDefaults(
  row: Pick<
    ExaminationDetailRow,
    "attendanceStatus" | "actualExaminationDate" | "examinationDate" | "performedBatchServiceIds"
  >,
  options: { today?: string; startDate?: string } = {}
): ExaminationEntryValues {
  const today = options.today ?? getBusinessToday()
  const absent = row.attendanceStatus === "ABSENT"
  let date = row.actualExaminationDate ?? (row.examinationDate <= today ? row.examinationDate : today)
  if (options.startDate && date < options.startDate) date = options.startDate
  return {
    attendanceStatus: absent ? "ABSENT" : "ATTENDED",
    actualExaminationDate: absent ? "" : date,
    performedBatchServiceIds: absent ? [] : [...row.performedBatchServiceIds],
  }
}

export function areExaminationEntryValuesEqual(a: ExaminationEntryValues, b: ExaminationEntryValues) {
  if (a.attendanceStatus !== b.attendanceStatus) return false
  if (a.actualExaminationDate !== b.actualExaminationDate) return false
  if (a.performedBatchServiceIds.length !== b.performedBatchServiceIds.length) return false
  const left = new Set(a.performedBatchServiceIds)
  return b.performedBatchServiceIds.every((id) => left.has(id))
}
