"use client"

import * as React from "react"
import { Calculator } from "@/shared/ui/product-icon"
import { formatVND } from "@/shared/ui"
import { HealthExaminationBatchReportItem } from "../../types"

interface ReportSummaryTableProps {
  items: HealthExaminationBatchReportItem[]
  totalAmount: number
}

export function ReportSummaryTable({
  items,
  totalAmount,
}: ReportSummaryTableProps) {
  return (
    <div className="space-y-5">
      {/* Summary Table */}
      <div className="rounded-lg border border-border bg-card  overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
                <th className="py-3 px-4 text-left font-semibold">Hạng mục</th>
                <th className="py-3 px-4 text-center font-semibold w-36">
                  Số người khám
                </th>
                <th className="py-3 px-4 text-right font-semibold w-44">
                  Đơn giá
                </th>
                <th className="py-3 px-4 text-right font-semibold w-48">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {items.map((item) => (
                <tr
                  key={item.examinationItemId}
                  className="transition-colors hover:bg-hover/50"
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-foreground">
                    {item.examinedCount}
                  </td>
                  <td className="py-3 px-4 text-right text-secondary-foreground font-medium">
                    {formatVND(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-foreground">
                    {formatVND(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/40 border-t-2 border-border font-bold text-xs sm:text-sm">
                <td className="py-3.5 px-4 text-foreground">Tổng tiền</td>
                <td className="py-3.5 px-4 text-center text-muted-foreground">—</td>
                <td className="py-3.5 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3.5 px-4 text-right font-bold text-primary text-sm sm:text-base">
                  {formatVND(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Calculation Formula Callout Box */}
      <div className="rounded-lg border border-border/80 bg-muted/20 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
          <Calculator className="size-4 stroke-[2]" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Ví dụ cách tính
          </span>
          <p className="text-xs sm:text-sm font-medium text-foreground">
            Khám nội tổng quát: 100.000 x 50 = 5.000.000 đ
          </p>
          <p className="text-xs text-muted-foreground pt-0.5">
            Tổng tiền được tính từ số người thực tế khám từng hạng mục nhân với đơn giá, không lấy tổng số nhân sự nhân với tổng các hạng mục.
          </p>
        </div>
      </div>
    </div>
  )
}
