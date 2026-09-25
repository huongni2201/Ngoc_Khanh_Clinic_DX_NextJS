import * as React from "react"
import { formatVND } from "@/shared/ui"
import { HealthExaminationBatchReportItem } from "../../types"

export interface ExaminationSummaryRowProps {
  item: HealthExaminationBatchReportItem
}

export function ExaminationSummaryRow({ item }: ExaminationSummaryRowProps) {
  return (
    <tr className="border-b border-divider transition-colors hover:bg-hover/50">
      <td className="py-3 px-5 font-medium text-foreground text-left">
        {item.name}
      </td>
      <td className="py-3 px-4 text-center font-medium text-foreground">
        {item.examinedCount}
      </td>
      <td className="py-3 px-5 text-right text-secondary-foreground font-medium">
        {formatVND(item.unitPrice)}
      </td>
      <td className="py-3 px-5 text-right font-medium text-foreground">
        {formatVND(item.totalAmount)}
      </td>
    </tr>
  )
}
