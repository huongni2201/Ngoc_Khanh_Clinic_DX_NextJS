"use client"

import { Controller, useWatch, type UseFormReturn } from "react-hook-form"
import { ChevronDown } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BATCH_NAME_MAX_LENGTH,
  type HealthExaminationBatchFormValues,
  type ValidatedHealthExaminationBatchFormValues,
} from "../../schemas/health-examination-batch.schema"
import { BatchFormStepHeader } from "./batch-form-step-header"
import { ExaminationDatesField } from "./examination-dates-field"

interface HealthExaminationBatchBasicInfoSectionProps {
  form: UseFormReturn<
    HealthExaminationBatchFormValues,
    unknown,
    ValidatedHealthExaminationBatchFormValues
  >
}

const LABEL_CLASS = "text-sm font-medium text-foreground"
const ERROR_CLASS = "text-xs font-medium text-destructive"
const SELECT_CLASS =
  "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-background py-1.5 pl-3 pr-9 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/20"

export function HealthExaminationBatchBasicInfoSection({
  form,
}: HealthExaminationBatchBasicInfoSectionProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form
  const examinationSiteType = useWatch({ control, name: "examinationSiteType" })
  const needsSiteAddress = examinationSiteType === "ORGANIZATION_SITE"

  return (
    <section aria-labelledby="batch-form-info-heading" className="space-y-5 pb-6 pt-6">
      <BatchFormStepHeader
        step={1}
        headingId="batch-form-info-heading"
        title="Thông tin đợt khám"
        description="Tên, ngày và địa điểm tổ chức của đợt."
      />

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="batch-name" className={LABEL_CLASS}>
            Tên đợt khám <span className="text-destructive">*</span>
          </Label>
          <Input
            id="batch-name"
            maxLength={BATCH_NAME_MAX_LENGTH}
            aria-invalid={Boolean(errors.batchName)}
            {...register("batchName")}
          />
          {errors.batchName && (
            <p className={ERROR_CLASS} role="alert">
              {errors.batchName.message}
            </p>
          )}
        </div>

        <Controller
          name="examinationDates"
          control={control}
          render={({ field }) => (
            <ExaminationDatesField
              value={field.value ?? []}
              onChange={field.onChange}
              error={errors.examinationDates?.message ?? errors.examinationDates?.root?.message}
            />
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="examination-site-type" className={LABEL_CLASS}>
            Loại địa điểm <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="examinationSiteType"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <select
                  id="examination-site-type"
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  aria-invalid={Boolean(errors.examinationSiteType)}
                  className={SELECT_CLASS}
                >
                  <option value="">Chọn loại địa điểm</option>
                  <option value="CLINIC">Tại phòng khám</option>
                  <option value="ORGANIZATION_SITE">Tại đơn vị</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            )}
          />
          {errors.examinationSiteType && (
            <p className={ERROR_CLASS} role="alert">
              {errors.examinationSiteType.message}
            </p>
          )}
        </div>

        {needsSiteAddress && (
          <div className="space-y-2">
            <Label htmlFor="examination-site-address" className={LABEL_CLASS}>
              Địa chỉ địa điểm khám <span className="text-destructive">*</span>
            </Label>
            <Input
              id="examination-site-address"
              aria-invalid={Boolean(errors.examinationSiteAddress)}
              {...register("examinationSiteAddress")}
            />
            {errors.examinationSiteAddress && (
              <p className={ERROR_CLASS} role="alert">
                {errors.examinationSiteAddress.message}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
