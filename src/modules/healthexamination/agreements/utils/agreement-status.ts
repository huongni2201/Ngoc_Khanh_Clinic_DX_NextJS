import type { HealthExaminationAgreementStatus } from "../types/transport"
import { HEALTH_EXAMINATION_AGREEMENT_STATUSES } from "../types/transport"

const HEALTH_EXAMINATION_AGREEMENT_STATUS_LABELS: Record<
  HealthExaminationAgreementStatus,
  string
> = {
  DRAFT: "Nháp",
  ACTIVE: "Đang áp dụng",
  ENDED: "Đã kết thúc",
}

/** Status tone for StatusPill: draft is neutral, active is informational, ended is done. */
export const HEALTH_EXAMINATION_AGREEMENT_STATUS_TONES: Record<
  HealthExaminationAgreementStatus,
  "neutral" | "info" | "success"
> = {
  DRAFT: "neutral",
  ACTIVE: "info",
  ENDED: "success",
}

export function getHealthExaminationAgreementStatusLabel(
  status: HealthExaminationAgreementStatus
) {
  return HEALTH_EXAMINATION_AGREEMENT_STATUS_LABELS[status]
}

export function parseHealthExaminationAgreementStatusFilter(
  value: string
): HealthExaminationAgreementStatus | "ALL" {
  if (value === "ALL") return value
  return HEALTH_EXAMINATION_AGREEMENT_STATUSES.find((status) => status === value) ?? "ALL"
}
