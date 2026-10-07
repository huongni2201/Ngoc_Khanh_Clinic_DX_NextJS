import * as React from "react"
import { Info } from "@/shared/ui/product-icon"
import { formatVND } from "@/shared/ui"
import type { PaymentSummaryItem } from "../../types"
import { MISSING_SERVICE_NAME } from "../../utils/batch-form-values"

export interface CalculationExampleProps {
  /** A real line of the report; the example is never made up. */
  item?: PaymentSummaryItem
}

/** The first line somebody was examined for, otherwise the first line. */
export function pickCalculationExample(items: PaymentSummaryItem[]): PaymentSummaryItem | undefined {
  return items.find((item) => item.examinedCount > 0) ?? items[0]
}

export function CalculationExample({ item }: CalculationExampleProps) {
  if (!item) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.05] p-4">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Info className="size-3.5 stroke-[2.5]" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-semibold text-foreground">Ví dụ cách tính</h4>
        <p className="text-xs text-foreground/80 sm:text-sm">
          {item.serviceName ?? MISSING_SERVICE_NAME}: {formatVND(item.unitPrice)} x{" "}
          {item.examinedCount} = {formatVND(item.amount)}
        </p>
      </div>
    </div>
  )
}
