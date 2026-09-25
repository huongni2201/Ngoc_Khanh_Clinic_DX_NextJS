import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { HealthExaminationBatchReportItem } from "../../types"
import { ExaminationSummaryRow } from "./examination-summary-row"
import { ReportTotalRow } from "./report-total-row"

export interface ExaminationSummaryTableProps {
  items: HealthExaminationBatchReportItem[]
  totalAmount: number
  isLoading?: boolean
}

export function ExaminationSummaryTable({
  items,
  totalAmount,
  isLoading = false,
}: ExaminationSummaryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card  overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-36" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card  overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
              <th className="py-3.5 px-5 text-left font-semibold">Hạng mục</th>
              <th className="py-3.5 px-4 text-center font-semibold w-40">
                Số người khám
              </th>
              <th className="py-3.5 px-5 text-right font-semibold w-48">
                Đơn giá
              </th>
              <th className="py-3.5 px-5 text-right font-semibold w-56">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-divider">
            {items.map((item) => (
              <ExaminationSummaryRow
                key={item.examinationItemId}
                item={item}
              />
            ))}
          </tbody>
          <tfoot>
            <ReportTotalRow totalAmount={totalAmount} />
          </tfoot>
        </table>
      </div>
    </div>
  )
}
