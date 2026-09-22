"use client"

import * as React from "react"
import { FileSpreadsheet, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportActionsProps {
  onExportDetailHorizontal: () => void
  onExportSummaryVertical: () => void
}

export function ReportActions({
  onExportDetailHorizontal,
  onExportSummaryVertical,
}: ReportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onExportDetailHorizontal}
        className="h-8 sm:h-9 px-3 text-xs font-medium border-border/90 hover:bg-muted/60 text-secondary-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer"
      >
        <FileSpreadsheet className="size-3.5 mr-1.5 text-primary stroke-[2]" />
        Xuất Excel chi tiết (ngang)
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onExportSummaryVertical}
        className="h-8 sm:h-9 px-3 text-xs font-medium border-border/90 hover:bg-muted/60 text-secondary-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer"
      >
        <Download className="size-3.5 mr-1.5 text-primary stroke-[2]" />
        Xuất Excel tổng hợp (dọc)
      </Button>
    </div>
  )
}
