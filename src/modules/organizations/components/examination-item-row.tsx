"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { MoneyInput } from "@/shared/ui"

interface ExaminationItemRowProps {
  index: number
  name: string
  selected: boolean
  unitPrice: number
  defaultPrice: number
  onToggle: (checked: boolean) => void
  onPriceChange: (price: number) => void
  error?: string
}

export function ExaminationItemRow({
  index,
  name,
  selected,
  unitPrice,
  defaultPrice,
  onToggle,
  onPriceChange,
  error,
}: ExaminationItemRowProps) {
  const checkboxId = `exam-item-checkbox-${index}`

  const handleCheckedChange = (checked: boolean) => {
    onToggle(checked)
    if (checked) {
      // If turning ON, fill default price if current price is 0
      if (unitPrice === 0) {
        onPriceChange(defaultPrice > 0 ? defaultPrice : 0)
      }
    } else {
      // If turning OFF, strictly reset price to 0
      onPriceChange(0)
    }
  }

  return (
    <tr className="border-b border-divider hover:bg-hover/50 transition-colors">
      {/* Checkbox column */}
      <td className="py-2.5 px-4 text-center align-middle w-14">
        <div className="flex items-center justify-center">
          <Checkbox
            id={checkboxId}
            checked={selected}
            onCheckedChange={handleCheckedChange}
            aria-label={`Chọn hạng mục ${name}`}
          />
        </div>
      </td>

      {/* Item name column */}
      <td className="py-2.5 px-4 text-left align-middle">
        <label
          htmlFor={checkboxId}
          className="text-xs sm:text-sm font-medium text-foreground cursor-pointer select-none"
        >
          {name}
        </label>
      </td>

      {/* Price input column */}
      <td className="py-2.5 px-4 align-middle w-48 sm:w-56">
        <div className="space-y-1">
          <MoneyInput
            value={selected ? unitPrice : 0}
            onChange={(val) => {
              if (selected) {
                onPriceChange(val)
              }
            }}
            disabled={!selected}
            error={Boolean(error)}
            aria-label={`Đơn giá cho ${name}`}
          />
          {selected && error && (
            <p className="text-[11px] text-destructive font-medium">{error}</p>
          )}
        </div>
      </td>
    </tr>
  )
}
