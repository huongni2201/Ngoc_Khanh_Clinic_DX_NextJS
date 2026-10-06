"use client"

import {
  HealthExaminationBatchFormDialog,
  type HealthExaminationBatchFormDialogProps,
} from "./health-examination-batch-form-dialog"

type CreateHealthExaminationBatchDialogProps = Omit<
  HealthExaminationBatchFormDialogProps,
  "mode" | "batch"
>

export function CreateHealthExaminationBatchDialog(props: CreateHealthExaminationBatchDialogProps) {
  return <HealthExaminationBatchFormDialog mode="create" {...props} />
}
