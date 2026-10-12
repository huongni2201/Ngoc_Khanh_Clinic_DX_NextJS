"use client"

import * as React from "react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Info } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { SearchField } from "@/shared/ui"
import {
  normalizeSearchText,
  orderServiceRows,
} from "../../utils/service-search"
import type {
  HealthExaminationBatchFormValues,
  ValidatedHealthExaminationBatchFormValues,
} from "../../schemas/health-examination-batch.schema"
import { BatchFormStepHeader } from "./batch-form-step-header"
import { ExaminationItemRow } from "./examination-item-row"

interface ExaminationItemPriceTableProps {
  form: UseFormReturn<
    HealthExaminationBatchFormValues,
    unknown,
    ValidatedHealthExaminationBatchFormValues
  >
  isLoading?: boolean
}

export function ExaminationItemPriceTable({
  form,
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

  const [query, setQuery] = React.useState("")
  const normalizedQuery = normalizeSearchText(query)

  // Checked services are pinned to the top. The pinned set is a snapshot taken when the catalog
  // loads and whenever the search changes, so a row never jumps away under the cursor while the
  // user is ticking boxes.
  const selectedIds = () =>
    new Set(
      fields
        .filter((field, index) => Boolean((watchedItems[index] ?? field).selected))
        .map((field) => field.id)
    )
  const orderKey = `${fields.map((field) => field.id).join("|")}::${normalizedQuery}`
  const [pinned, setPinned] = React.useState(() => ({
    key: orderKey,
    ids: selectedIds(),
  }))
  const pinnedIds = pinned.key === orderKey ? pinned.ids : selectedIds()
  if (pinned.key !== orderKey) setPinned({ key: orderKey, ids: pinnedIds })

  const visibleIndexes = orderServiceRows(
    fields.map((field, index) => {
      const item = watchedItems[index] ?? field
      return { id: field.id, name: item.name, code: item.code }
    }),
    query,
    pinnedIds
  )
  const selectedCount = watchedItems.filter((item) => item?.selected).length

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // The search box lives inside the form: Enter must not submit it.
    if (event.key === "Enter") event.preventDefault()
    // First Escape clears the search; the dialog only closes on the next one.
    if (event.key === "Escape" && query) {
      event.preventDefault()
      event.stopPropagation()
      setQuery("")
    }
  }

  // Global services error (e.g. at least 1 item selected)
  const rootError =
    errors.services && "root" in errors.services
      ? errors.services.root
      : undefined
  const rootErrorMessage =
    typeof rootError === "object" &&
    rootError !== null &&
    "message" in rootError &&
    typeof rootError.message === "string"
      ? rootError.message
      : undefined
  const servicesError = errors.services?.message || rootErrorMessage

  return (
    <section
      aria-labelledby="batch-form-services-heading"
      className="space-y-4 border-t border-border pb-6 pt-6"
    >
      <BatchFormStepHeader
        step={2}
        headingId="batch-form-services-heading"
        title="Chọn hạng mục & giá"
        description={
          <span className="flex items-center gap-1.5">
            <Info className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Giá thỏa thuận mặc định bằng giá tham chiếu của danh mục.
          </span>
        }
      />

      {/* Search and live selection count */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={setQuery}
          onKeyDown={handleSearchKeyDown}
          placeholder="Tìm theo tên hoặc mã hạng mục…"
          label="Tìm hạng mục khám"
          className="sm:max-w-xs"
        />
        <p aria-live="polite" className="text-xs tabular-nums text-muted-foreground">
          Đã chọn{" "}
          <span className="font-semibold text-foreground">{selectedCount}</span>
          /{fields.length} hạng mục
          {normalizedQuery && ` · ${visibleIndexes.length} kết quả`}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="max-h-[min(22rem,45vh)] overflow-auto overscroll-contain">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-alt">
              <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                <th scope="col" className="w-11 px-1 py-2.5 text-center font-medium sm:w-12 sm:px-3">
                  Chọn
                </th>
                <th scope="col" className="px-2 py-2.5 text-left font-medium sm:px-3">
                  Hạng mục
                </th>
                <th scope="col" className="hidden w-32 px-3 py-2.5 text-right font-medium sm:table-cell">
                  Giá tham chiếu
                </th>
                <th scope="col" className="w-32 px-2 py-2.5 text-left font-medium sm:w-52 sm:px-3">
                  Giá thỏa thuận
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Đang tải danh mục hạng mục khám…
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Không có hạng mục khám nào.
                  </td>
                </tr>
              ) : visibleIndexes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy hạng mục nào khớp với “{query.trim()}”.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => setQuery("")}
                    >
                      Xóa tìm kiếm
                    </Button>
                  </td>
                </tr>
              ) : (
                visibleIndexes.map((index) => {
                  const field = fields[index]
                  const currentItem = watchedItems[index] || field

                  // Check for field-specific error for this row's unitPrice
                  const rowError =
                    errors.services?.[index]?.negotiatedPrice?.message

                  return (
                    <ExaminationItemRow
                      key={field.id}
                      index={index}
                      name={currentItem.name}
                      code={currentItem.code}
                      referencePrice={currentItem.referencePrice}
                      selected={Boolean(currentItem.selected)}
                      negotiatedPrice={currentItem.negotiatedPrice || 0}
                      onToggle={(checked) => {
                        setValue(`services.${index}.selected`, checked, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                        if (checked && !currentItem.negotiatedPrice) {
                          setValue(
                            `services.${index}.negotiatedPrice`,
                            currentItem.referencePrice,
                            { shouldDirty: true }
                          )
                        }
                      }}
                      onPriceChange={(price) => {
                        setValue(`services.${index}.negotiatedPrice`, price, {
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
        <p role="alert" className="text-xs font-medium text-destructive">
          {servicesError}
        </p>
      )}
    </section>
  )
}
