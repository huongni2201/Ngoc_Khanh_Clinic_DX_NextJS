import type { HealthExaminationBatchStatus } from "../types"
import { HEALTH_EXAMINATION_BATCH_STATUSES } from "../types"

export const HEALTH_EXAMINATION_BATCH_STATUS_LABELS: Record<
  HealthExaminationBatchStatus,
  string
> = {
  DRAFT: "Nháp",
  READY: "Sẵn sàng",
  IN_PROGRESS: "Đang khám",
  RESULT_PROCESSING: "Đang xử lý kết quả",
  FINALIZED: "Đã chốt",
  CLOSED: "Đã đóng",
  CANCELED: "Đã hủy",
  DELETED: "Đã xóa",
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
