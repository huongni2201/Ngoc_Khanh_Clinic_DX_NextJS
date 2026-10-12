"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { MoneyInput, formatVND } from "@/shared/ui"
import { cn } from "@/lib/utils"

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
    <tr
      className={cn(
        "border-b border-border/70 transition-colors last:border-b-0",
        selected ? "bg-selected" : "hover:bg-hover"
      )}
    >
      <td
        className={cn(
          "relative w-11 px-1 py-2.5 text-center align-middle sm:w-12 sm:px-3",
          selected &&
            "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary"
        )}
      >
        <div className="flex items-center justify-center">
          <Checkbox
            id={checkboxId}
            checked={selected}
            onCheckedChange={(checked) => onToggle(Boolean(checked))}
            aria-label={`Chọn hạng mục ${name}`}
          />
        </div>
      </td>

      <td className="px-2 py-2.5 text-left align-middle sm:px-3">
        <label
          htmlFor={checkboxId}
          className="block cursor-pointer select-none text-sm font-medium text-foreground"
        >
          {name}
        </label>
        {code && (
          <div className="mt-0.5 break-all text-xs tabular-nums text-muted-foreground">Mã: {code}</div>
        )}
        {/* Desktop shows the reference price in its own column; phones show it here instead. */}
        <div className="mt-0.5 text-xs tabular-nums text-muted-foreground sm:hidden">
          Giá tham chiếu {formatVND(referencePrice)}
        </div>
      </td>

      <td className="hidden w-32 px-3 py-2.5 text-right align-middle text-sm tabular-nums text-muted-foreground sm:table-cell">
        {formatVND(referencePrice)}
      </td>

      <td className="w-32 px-2 py-2.5 align-middle sm:w-52 sm:px-3">
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
          {selected && error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
      </td>
    </tr>
  )
}
