"use client"

import * as React from "react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Info } from "@/shared/ui/product-icon"
import { ClinicalService } from "@/modules/health-examinations"
import { CreateHealthExaminationBatchFormValues } from "../schemas"
import { ExaminationItemRow } from "./examination-item-row"

interface ExaminationItemPriceTableProps {
  form: UseFormReturn<CreateHealthExaminationBatchFormValues>
  masterItems: ClinicalService[]
  isLoading?: boolean
}

export function ExaminationItemPriceTable({
  form,
  masterItems,
  isLoading = false,
}: ExaminationItemPriceTableProps) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form

  const { fields } = useFieldArray({
    control,
    name: "services",
  })

  // Watch current services to get reactive selected and unitPrice states
  const watchedItems = watch("services") || []

  // Global services error (e.g. at least 1 item selected)
  const servicesError =
    errors.services?.message ||
    (errors.services as unknown as { root?: { message?: string } })?.root?.message

  return (
    <div className="space-y-3">
      {/* Section 2 Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
            2
          </span>
          <h3 className="text-base font-bold text-foreground">
            Chọn hạng mục & giá
          </h3>
        </div>

        {/* Helper text with info icon */}
        <div className="flex items-center gap-1.5 text-xs text-primary/85 font-normal">
          <Info className="size-3.5 shrink-0" />
          <span className="italic">
            Chỉ hạng mục được chọn mới được nhập giá.
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-border/80 overflow-hidden bg-card ">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-foreground/80 font-semibold text-xs">
                <th className="py-2.5 px-4 text-center w-14 font-semibold">
                  Chọn
                </th>
                <th className="py-2.5 px-4 text-left font-semibold">
                  Hạng mục
                </th>
                <th className="py-2.5 px-4 text-left font-semibold w-48 sm:w-56">
                  Đơn giá
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Đang tải danh mục hạng mục khám...
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Không có hạng mục khám nào.
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => {
                  const currentItem = watchedItems[index] || field
                  const defaultPrice =
                    masterItems.find(
                      (m) => m.id === currentItem.serviceId
                    )?.defaultPrice || 0

                  // Check for field-specific error for this row's unitPrice
                  const rowError =
                    errors.services?.[index]?.unitPrice?.message

                  return (
                    <ExaminationItemRow
                      key={field.id}
                      index={index}
                      name={currentItem.name}
                      selected={Boolean(currentItem.selected)}
                      unitPrice={currentItem.unitPrice || 0}
                      defaultPrice={defaultPrice}
                      onToggle={(checked) => {
                        setValue(`services.${index}.selected`, checked, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }}
                      onPriceChange={(price) => {
                        setValue(`services.${index}.unitPrice`, price, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }}
                      error={rowError}
                    />
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation message if no services are selected */}
      {servicesError && typeof servicesError === "string" && (
        <p className="text-xs text-destructive font-medium pt-0.5">
          {servicesError}
        </p>
      )}
    </div>
  )
}

