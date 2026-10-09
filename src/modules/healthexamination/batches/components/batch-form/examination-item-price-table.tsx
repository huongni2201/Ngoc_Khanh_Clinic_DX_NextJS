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
    <div className="space-y-3">
      {/* Section 2 Header */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
            2
          </span>
          <h3 className="text-base font-bold text-foreground">
            Chọn hạng mục & giá
          </h3>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          Giá thỏa thuận mặc định bằng giá tham chiếu của danh mục.
        </p>
      </div>

      {/* Search + selection summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={setQuery}
          onKeyDown={handleSearchKeyDown}
          placeholder="Tìm theo tên hoặc mã hạng mục…"
          label="Tìm hạng mục khám"
          className="sm:max-w-xs"
        />
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          Đã chọn{" "}
          <span className="font-semibold text-foreground">{selectedCount}</span>
          /{fields.length} hạng mục
          {normalizedQuery && ` · ${visibleIndexes.length} kết quả`}
        </p>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-border/80 overflow-hidden bg-card">
        <div className="max-h-[min(24rem,45vh)] overflow-auto overscroll-contain">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-muted shadow-[0_1px_0_0_var(--color-border)]">
              <tr className="text-foreground/80 font-semibold text-xs">
                <th scope="col" className="py-2.5 px-4 text-center w-14 font-semibold">
                  Chọn
                </th>
                <th scope="col" className="py-2.5 px-4 text-left font-semibold">
                  Hạng mục
                </th>
                <th scope="col" className="py-2.5 px-4 text-right font-semibold w-36">
                  Giá tham chiếu
                </th>
                <th scope="col" className="py-2.5 px-4 text-left font-semibold w-48 sm:w-56">
                  Giá thỏa thuận
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Đang tải danh mục hạng mục khám…
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Không có hạng mục khám nào.
                  </td>
                </tr>
              ) : visibleIndexes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">
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
        <p className="text-xs text-destructive font-medium pt-0.5">
          {servicesError}
        </p>
      )}
    </div>
  )
}

