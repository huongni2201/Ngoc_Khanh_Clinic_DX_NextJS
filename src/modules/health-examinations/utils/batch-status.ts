import type { HealthExaminationBatchStatus } from "../types"
import { HEALTH_EXAMINATION_BATCH_STATUSES } from "../types"

export const HEALTH_EXAMINATION_BATCH_STATUS_LABELS: Record<
  HealthExaminationBatchStatus,
  string
> = {
  DRAFT: "Nháp",
  READY: "Sẵn sàng",
  FINALIZED: "Đã chốt",
  CLOSED: "Đã đóng",
}

/** Status tone for StatusPill: draft is neutral, ready is informational, finalized is done. */
export const HEALTH_EXAMINATION_BATCH_STATUS_TONES: Record<
  HealthExaminationBatchStatus,
  "neutral" | "info" | "success"
> = {
  DRAFT: "neutral",
  READY: "info",
  FINALIZED: "success",
  CLOSED: "neutral",
}

export function getHealthExaminationBatchStatusLabel(
  status: HealthExaminationBatchStatus
) {
  return HEALTH_EXAMINATION_BATCH_STATUS_LABELS[status]
}

export function parseHealthExaminationBatchStatusFilter(
  value: string
): HealthExaminationBatchStatus | "ALL" {
  if (value === "ALL") return value
  return HEALTH_EXAMINATION_BATCH_STATUSES.find((status) => status === value) ?? "ALL"
}
