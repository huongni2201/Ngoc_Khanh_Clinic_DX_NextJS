"use client"

import {
  HealthExaminationAgreementFormDialog,
  type HealthExaminationAgreementFormDialogProps,
} from "./health-examination-agreement-form-dialog"

type CreateHealthExaminationAgreementDialogProps = Omit<
  HealthExaminationAgreementFormDialogProps,
  "mode" | "agreement"
>

export function CreateHealthExaminationAgreementDialog(props: CreateHealthExaminationAgreementDialogProps) {
  return <HealthExaminationAgreementFormDialog mode="create" {...props} />
}
