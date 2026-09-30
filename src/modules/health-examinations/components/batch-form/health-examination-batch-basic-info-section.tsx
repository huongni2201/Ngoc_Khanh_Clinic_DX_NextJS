"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  CreateHealthExaminationBatchFormValues,
  ValidatedHealthExaminationBatchFormValues,
} from "../../schemas/health-examination-batch.schema"

interface HealthExaminationBatchBasicInfoSectionProps {
  form: UseFormReturn<
    CreateHealthExaminationBatchFormValues,
    unknown,
    ValidatedHealthExaminationBatchFormValues
  >
}

export function HealthExaminationBatchBasicInfoSection({
  form,
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
          <Label htmlFor="batch-code">
            Mã đợt khám <span className="text-destructive">*</span>
          </Label>
          <Input
            id="batch-code"
            maxLength={40}
            aria-invalid={Boolean(errors.batchCode)}
            {...register("batchCode")}
          />
          {errors.batchCode && (
            <p className="text-xs text-destructive" role="alert">
              {errors.batchCode.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-name">
            Tên đợt khám <span className="text-destructive">*</span>
          </Label>
          <Input
            id="batch-name"
            maxLength={250}
            aria-invalid={Boolean(errors.batchName)}
            {...register("batchName")}
          />
          {errors.batchName && (
            <p className="text-xs text-destructive" role="alert">
              {errors.batchName.message}
            </p>
          )}
        </div>

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
                <option value="COMPANY">Tại đơn vị</option>
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
            maxLength={250}
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
          <Label htmlFor="examination-site-address">Địa chỉ địa điểm khám</Label>
          <Input
            id="examination-site-address"
            maxLength={500}
            aria-invalid={Boolean(errors.examinationSiteAddress)}
            {...register("examinationSiteAddress")}
          />
          {errors.examinationSiteAddress && (
            <p className="text-xs text-destructive" role="alert">
              {errors.examinationSiteAddress.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-start-date">Ngày bắt đầu</Label>
          <Input
            id="batch-start-date"
            type="date"
            aria-invalid={Boolean(errors.startDate)}
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-xs text-destructive" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-end-date">Ngày kết thúc</Label>
          <Input
            id="batch-end-date"
            type="date"
            aria-invalid={Boolean(errors.endDate)}
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-xs text-destructive" role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="batch-reason">Lý do khám</Label>
          <Textarea
            id="batch-reason"
            maxLength={300}
            rows={3}
            aria-invalid={Boolean(errors.reason)}
            {...register("reason")}
          />
          {errors.reason && (
            <p className="text-xs text-destructive" role="alert">
              {errors.reason.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
