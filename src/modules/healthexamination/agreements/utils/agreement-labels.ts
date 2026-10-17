import type { ExaminationSiteType } from "../types/transport"

export const EXAMINATION_SITE_TYPE_LABELS: Record<ExaminationSiteType, string> = {
  CLINIC: "Tại phòng khám",
  ORGANIZATION_SITE: "Tại đơn vị",
}

/** Only a draft agreement (not yet started) can change its name, validity and services, or be deleted. */
export function isAgreementEditable(status: string) {
  return status === "DRAFT"
}

/** The roster, the schedule and the performed services change only while the agreement is open. */
export function isAgreementOpen(status: string) {
  return status === "DRAFT" || status === "ACTIVE"
}
