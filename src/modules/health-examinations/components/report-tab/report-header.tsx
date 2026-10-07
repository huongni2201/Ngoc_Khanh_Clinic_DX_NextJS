import * as React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import {
  ReportExportActions,
  ReportExportActionsProps,
} from "./report-export-actions"

export interface ReportHeaderProps extends ReportExportActionsProps {
  title?: string
  /** The batch is not finalized yet, so the figures may still change. */
  provisional?: boolean
}

export function ReportHeader({
  title = "Tổng hợp số lượng khám theo từng hạng mục để thanh toán",
  provisional = false,
  ...actionProps
}: ReportHeaderProps) {
  return (
    <CardHeader className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle className="text-sm font-bold text-foreground sm:text-base">{title}</CardTitle>
        {provisional && (
          <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning">
            Tạm tính
          </span>
        )}
      </div>
      <ReportExportActions {...actionProps} />
    </CardHeader>
  )
}
