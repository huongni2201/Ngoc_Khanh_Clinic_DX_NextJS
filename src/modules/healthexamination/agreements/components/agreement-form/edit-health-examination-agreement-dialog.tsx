"use client"

import {
  HealthExaminationAgreementFormDialog,
  type HealthExaminationAgreementFormDialogProps,
} from "./health-examination-agreement-form-dialog"

type EditHealthExaminationAgreementDialogProps = Omit<HealthExaminationAgreementFormDialogProps, "mode"> & {
  agreement: NonNullable<HealthExaminationAgreementFormDialogProps["agreement"]>
}

export function EditHealthExaminationAgreementDialog(props: EditHealthExaminationAgreementDialogProps) {
  return <HealthExaminationAgreementFormDialog mode="edit" {...props} />
}
