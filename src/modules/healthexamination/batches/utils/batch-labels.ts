import type { ExaminationSiteType } from "../types/transport"

export const EXAMINATION_SITE_TYPE_LABELS: Record<ExaminationSiteType, string> = {
  CLINIC: "Tại phòng khám",
  ORGANIZATION_SITE: "Tại đơn vị",
}

export function isBatchEditable(status: string) {
  return status === "DRAFT"
}
