import type { ExaminationDetailRow } from "../types"

/** The values the manual entry sheet edits: only the services performed (attendance is not part of it). */
export interface ExaminationEntryValues {
  performedAgreementServiceIds: string[]
}

/** The values the sheet opens with: what the backend holds for the Participant. */
export function buildExaminationEntryDefaults(
  row: Pick<ExaminationDetailRow, "performedAgreementServiceIds">
): ExaminationEntryValues {
  return { performedAgreementServiceIds: [...row.performedAgreementServiceIds] }
}

export function areExaminationEntryValuesEqual(a: ExaminationEntryValues, b: ExaminationEntryValues) {
  if (a.performedAgreementServiceIds.length !== b.performedAgreementServiceIds.length) return false
  const left = new Set(a.performedAgreementServiceIds)
  return b.performedAgreementServiceIds.every((id) => left.has(id))
}
