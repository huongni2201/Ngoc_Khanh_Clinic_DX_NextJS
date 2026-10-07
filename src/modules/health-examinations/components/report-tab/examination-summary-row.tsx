import * as React from "react"
import { formatVND } from "@/shared/ui"
import type { PaymentSummaryItem } from "../../types"
import { MISSING_SERVICE_NAME } from "../../utils/batch-form-values"

export interface ExaminationSummaryRowProps {
  item: PaymentSummaryItem
}

export function ExaminationSummaryRow({ item }: ExaminationSummaryRowProps) {
  return (
    <tr className="border-b border-divider transition-colors hover:bg-hover/50">
      <td className="px-5 py-3 text-left font-medium text-foreground">
        {item.serviceName ?? MISSING_SERVICE_NAME}
      </td>
      <td className="px-4 py-3 text-center font-medium text-foreground">{item.examinedCount}</td>
      <td className="px-5 py-3 text-right font-medium text-secondary-foreground">
        {formatVND(item.unitPrice)}
      </td>
      <td className="px-5 py-3 text-right font-medium text-foreground">{formatVND(item.amount)}</td>
    </tr>
  )
}
