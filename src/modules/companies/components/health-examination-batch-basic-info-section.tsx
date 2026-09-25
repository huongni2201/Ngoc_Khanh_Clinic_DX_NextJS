"use client"

import * as React from "react"
import { UseFormReturn, Controller } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { vi } from "date-fns/locale/vi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CreateHealthExaminationBatchFormValues } from "../schemas"

interface HealthExaminationBatchBasicInfoSectionProps {
  form: UseFormReturn<CreateHealthExaminationBatchFormValues>
}

export function HealthExaminationBatchBasicInfoSection({
  form,
}: HealthExaminationBatchBasicInfoSectionProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
          1
        </span>
        <h3 className="text-base font-bold text-foreground">
          Thông tin đợt khám
        </h3>
      </div>

      {/* Fields */}
      <div className="space-y-4 pt-1">
        {/* Row 1: Tên đợt khám | Địa điểm khám */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="batch-name"
              className="text-xs font-medium text-foreground"
            >
              Tên đợt khám <span className="text-destructive">*</span>
            </Label>
            <Input
              id="batch-name"
              placeholder="Nhập tên đợt khám"
              {...register("name")}
              className={cn(
                "h-9 text-xs sm:text-sm",
                errors.name && "border-destructive focus-visible:ring-destructive/20"
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="batch-location"
              className="text-xs font-medium text-foreground"
            >
              Địa điểm khám <span className="text-destructive">*</span>
            </Label>
            <Input
              id="batch-location"
              placeholder="Nhập địa điểm khám"
              {...register("location")}
              className={cn(
                "h-9 text-xs sm:text-sm",
                errors.location &&
                  "border-destructive focus-visible:ring-destructive/20"
              )}
            />
            {errors.location && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Ngày khám (half-width column) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="batch-examDate"
              className="text-xs font-medium text-foreground"
            >
              Ngày khám <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="examDate"
              render={({ field }) => {
                let parsedDate: Date | undefined
                if (field.value) {
                  try {
                    parsedDate = parse(field.value, "dd/MM/yyyy", new Date())
                    if (isNaN(parsedDate.getTime())) {
                      parsedDate = new Date(field.value)
                    }
                  } catch {
                    parsedDate = undefined
                  }
                }

                return (
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          id="batch-examDate"
                          aria-label="Chọn ngày khám"
                          className={cn(
                            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-2xs transition-colors hover:border-input focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20",
                            !field.value && "text-muted-foreground",
                            errors.examDate &&
                              "border-destructive focus-visible:ring-destructive/20"
                          )}
                        />
                      }
                    >
                      <span>
                        {field.value ? field.value : "Chọn ngày khám"}
                      </span>
                      <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto p-0 z-[60] bg-popover"
                    >
                      <Calendar
                        mode="single"
                        selected={parsedDate}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "dd/MM/yyyy"))
                          } else {
                            field.onChange("")
                          }
                          setIsCalendarOpen(false)
                        }}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                )
              }}
            />
            {errors.examDate && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.examDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Ghi chú (full width) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="batch-note"
            className="text-xs font-medium text-foreground"
          >
            Ghi chú
          </Label>
          <Textarea
            id="batch-note"
            placeholder="Nhập ghi chú (nếu có)"
            rows={3}
            {...register("note")}
            className="resize-y text-xs sm:text-sm min-h-[72px]"
          />
        </div>
      </div>
    </div>
  )
}
