import * as React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import {
  ReportExportActions,
  ReportExportActionsProps,
} from "./report-export-actions"

export interface ReportHeaderProps extends ReportExportActionsProps {
  title?: string
}

export function ReportHeader({
  title = "Tổng hợp số lượng khám theo từng hạng mục để thanh toán",
  ...actionProps
}: ReportHeaderProps) {
  return (
    <CardHeader className="py-4 px-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <CardTitle className="text-sm sm:text-base font-bold text-foreground">
        {title}
      </CardTitle>
      <ReportExportActions {...actionProps} />
    </CardHeader>
  )
}
