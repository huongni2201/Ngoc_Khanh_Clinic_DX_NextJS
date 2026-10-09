"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BATCH_NAME_MAX_LENGTH,
  type HealthExaminationBatchFormValues,
  type ValidatedHealthExaminationBatchFormValues,
} from "../../schemas/health-examination-batch.schema"
import { ExaminationDatesField } from "./examination-dates-field"

interface HealthExaminationBatchBasicInfoSectionProps {
  form: UseFormReturn<
    HealthExaminationBatchFormValues,
    unknown,
    ValidatedHealthExaminationBatchFormValues
  >
  /**
   * The code the system generated. It is only shown, never typed: the backend generates it on
   * create and keeps it for the life of the batch. Absent while a new batch is being created.
   */
  batchCode?: string
}

export function HealthExaminationBatchBasicInfoSection({
  form,
  batchCode,
}: HealthExaminationBatchBasicInfoSectionProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-foreground">Thông tin đợt khám</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="batch-code">Mã đợt khám</Label>
          <Input
            id="batch-code"
            value={batchCode ?? ""}
            placeholder="Hệ thống tự sinh"
            readOnly
            aria-readonly
            aria-describedby="batch-code-hint"
            className="cursor-default bg-muted/60 font-mono text-foreground"
          />
          <p id="batch-code-hint" className="text-[11px] text-muted-foreground">
            {batchCode
              ? "Mã do hệ thống tự sinh, không thể thay đổi."
              : "Mã được hệ thống tự sinh khi tạo đợt khám."}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-name">
            Tên đợt khám <span className="text-destructive">*</span>
          </Label>
          <Input
            id="batch-name"
            maxLength={BATCH_NAME_MAX_LENGTH}
            aria-invalid={Boolean(errors.batchName)}
            {...register("batchName")}
          />
          {errors.batchName && (
            <p className="text-xs text-destructive" role="alert">
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

        <div className="space-y-1.5">
          <Label htmlFor="examination-site-type">
            Loại địa điểm <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="examinationSiteType"
            control={control}
            render={({ field }) => (
              <select
                id="examination-site-type"
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                aria-invalid={Boolean(errors.examinationSiteType)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">Chọn loại địa điểm</option>
                <option value="CLINIC">Tại phòng khám</option>
                <option value="ORGANIZATION_SITE">Tại đơn vị</option>
              </select>
            )}
          />
          {errors.examinationSiteType && (
            <p className="text-xs text-destructive" role="alert">
              {errors.examinationSiteType.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="examination-site-name">
            Tên địa điểm <span className="text-destructive">*</span>
          </Label>
          <Input
            id="examination-site-name"
            aria-invalid={Boolean(errors.examinationSiteName)}
            {...register("examinationSiteName")}
          />
          {errors.examinationSiteName && (
            <p className="text-xs text-destructive" role="alert">
              {errors.examinationSiteName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="examination-site-address">
            Địa chỉ địa điểm khám <span className="text-destructive">*</span>
          </Label>
          <Input
            id="examination-site-address"
            aria-invalid={Boolean(errors.examinationSiteAddress)}
            {...register("examinationSiteAddress")}
          />
          {errors.examinationSiteAddress && (
            <p className="text-xs text-destructive" role="alert">
              {errors.examinationSiteAddress.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
