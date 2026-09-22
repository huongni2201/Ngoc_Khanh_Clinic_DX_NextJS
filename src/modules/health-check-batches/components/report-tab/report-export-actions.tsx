import * as React from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface ReportExportActionsProps {
  onExportDetailHorizontal: () => void
  onExportSummaryVertical: () => void
  disabled?: boolean
  isExportingDetail?: boolean
  isExportingSummary?: boolean
  disabledTooltip?: string
}

export function ReportExportActions({
  onExportDetailHorizontal,
  onExportSummaryVertical,
  disabled = false,
  isExportingDetail = false,
  isExportingSummary = false,
  disabledTooltip,
}: ReportExportActionsProps) {
  const detailButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isExportingDetail}
      onClick={onExportDetailHorizontal}
      className="h-9 px-3.5 text-xs font-medium border-primary/50 text-primary hover:bg-primary/5 hover:text-primary transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExportingDetail ? (
        <Loader2 className="size-3.5 mr-1.5 animate-spin" />
      ) : (
        <Download className="size-3.5 mr-1.5 stroke-[2]" />
      )}
      Xuất Excel chi tiết (ngang)
    </Button>
  )

  const summaryButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isExportingSummary}
      onClick={onExportSummaryVertical}
      className="h-9 px-3.5 text-xs font-medium border-primary/50 text-primary hover:bg-primary/5 hover:text-primary transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExportingSummary ? (
        <Loader2 className="size-3.5 mr-1.5 animate-spin" />
      ) : (
        <Download className="size-3.5 mr-1.5 stroke-[2]" />
      )}
      Xuất Excel tổng hợp (dọc)
    </Button>
  )

  if (disabled && disabledTooltip) {
    return (
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-2.5">
          <Tooltip>
            <TooltipTrigger className="inline-block cursor-not-allowed">
              {detailButton}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="inline-block cursor-not-allowed">
              {summaryButton}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {detailButton}
      {summaryButton}
    </div>
  )
}
