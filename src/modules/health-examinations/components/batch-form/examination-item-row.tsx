"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { MoneyInput, formatVND } from "@/shared/ui"

interface ExaminationItemRowProps {
  index: number
  name: string
  code: string
  referencePrice: number
  selected: boolean
  negotiatedPrice: number
  onToggle: (checked: boolean) => void
  onPriceChange: (price: number) => void
  error?: string
}

export function ExaminationItemRow({
  index,
  name,
  code,
  referencePrice,
  selected,
  negotiatedPrice,
  onToggle,
  onPriceChange,
  error,
}: ExaminationItemRowProps) {
  const checkboxId = `exam-item-checkbox-${index}`

  return (
    <tr className="border-b border-divider hover:bg-hover/50 transition-colors">
      <td className="py-2.5 px-4 text-center align-middle w-14">
        <div className="flex items-center justify-center">
          <Checkbox
            id={checkboxId}
            checked={selected}
            onCheckedChange={(checked) => onToggle(Boolean(checked))}
            aria-label={`Chọn hạng mục ${name}`}
          />
        </div>
      </td>

      <td className="py-2.5 px-4 text-left align-middle">
        <label
          htmlFor={checkboxId}
          className="text-xs sm:text-sm font-medium text-foreground cursor-pointer select-none"
        >
          {name}
        </label>
        {code && <div className="text-[11px] text-muted-foreground">Mã: {code}</div>}
      </td>

      <td className="py-2.5 px-4 text-right align-middle text-xs text-muted-foreground w-36">
        {formatVND(referencePrice)}
      </td>

      <td className="py-2.5 px-4 align-middle w-48 sm:w-56">
        <div className="space-y-1">
          <MoneyInput
            value={selected ? negotiatedPrice : 0}
            onChange={(value) => {
              if (selected) onPriceChange(value)
            }}
            disabled={!selected}
            error={Boolean(error)}
            aria-label={`Giá thỏa thuận cho ${name}`}
          />
          {selected && error && (
            <p className="text-[11px] text-destructive font-medium">{error}</p>
          )}
        </div>
      </td>
    </tr>
  )
}
