"use client"

import { type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AGREEMENT_NAME_MAX_LENGTH,
  type HealthExaminationAgreementFormValues,
  type ValidatedHealthExaminationAgreementFormValues,
} from "../../schemas/health-examination-agreement.schema"
import { AgreementFormStepHeader } from "./agreement-form-step-header"

interface HealthExaminationAgreementBasicInfoSectionProps {
  form: UseFormReturn<
    HealthExaminationAgreementFormValues,
    unknown,
    ValidatedHealthExaminationAgreementFormValues
  >
}

const LABEL_CLASS = "text-sm font-medium text-foreground"
const ERROR_CLASS = "text-xs font-medium text-destructive"

export function HealthExaminationAgreementBasicInfoSection({
  form,
}: HealthExaminationAgreementBasicInfoSectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <section aria-labelledby="agreement-form-info-heading" className="space-y-5 pb-6 pt-6">
      <AgreementFormStepHeader
        step={1}
        headingId="agreement-form-info-heading"
        title="Thông tin thỏa thuận"
        description="Tên thỏa thuận và thời gian áp dụng. Ngày khám và địa điểm được xếp ở Lịch khám."
      />

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="agreement-name" className={LABEL_CLASS}>
            Tên thỏa thuận <span className="text-destructive">*</span>
          </Label>
          <Input
            id="agreement-name"
            maxLength={AGREEMENT_NAME_MAX_LENGTH}
            aria-invalid={Boolean(errors.agreementName)}
            {...register("agreementName")}
          />
          {errors.agreementName && (
            <p className={ERROR_CLASS} role="alert">
              {errors.agreementName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="agreement-valid-from" className={LABEL_CLASS}>
            Áp dụng từ ngày
          </Label>
          <Input
            id="agreement-valid-from"
            type="date"
            aria-invalid={Boolean(errors.validFrom)}
            {...register("validFrom")}
          />
          {errors.validFrom && (
            <p className={ERROR_CLASS} role="alert">
              {errors.validFrom.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="agreement-valid-to" className={LABEL_CLASS}>
            Áp dụng đến ngày
          </Label>
          <Input
            id="agreement-valid-to"
            type="date"
            aria-invalid={Boolean(errors.validTo)}
            {...register("validTo")}
          />
          {errors.validTo && (
            <p className={ERROR_CLASS} role="alert">
              {errors.validTo.message}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
