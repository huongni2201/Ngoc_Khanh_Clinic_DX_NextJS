"use client"

import {
  HealthExaminationBatchFormDialog,
  type HealthExaminationBatchFormDialogProps,
} from "./health-examination-batch-form-dialog"

type EditHealthExaminationBatchDialogProps = Omit<HealthExaminationBatchFormDialogProps, "mode"> & {
  batch: NonNullable<HealthExaminationBatchFormDialogProps["batch"]>
}

export function EditHealthExaminationBatchDialog(props: EditHealthExaminationBatchDialogProps) {
  return <HealthExaminationBatchFormDialog mode="edit" {...props} />
}
