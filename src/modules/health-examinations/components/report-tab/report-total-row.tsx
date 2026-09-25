import * as React from "react"
import { formatVND } from "@/shared/ui"

export interface ReportTotalRowProps {
  totalAmount: number
}

export function ReportTotalRow({ totalAmount }: ReportTotalRowProps) {
  return (
    <tr className="bg-primary/[0.04] border-t border-border font-bold">
      <td className="py-4 px-5 text-left text-base text-foreground font-bold">
        Tổng tiền
      </td>
      <td className="py-4 px-4 text-center"></td>
      <td className="py-4 px-5 text-right"></td>
      <td className="py-4 px-5 text-right text-base sm:text-lg font-bold text-primary">
        {formatVND(totalAmount)}
      </td>
    </tr>
  )
}
