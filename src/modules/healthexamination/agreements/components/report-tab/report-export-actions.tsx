import { Download, FileSpreadsheet, Loader2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"

export interface ReportExportActionsProps {
  onExportWord: () => void
  /** Omitted when the account cannot read the examination details. */
  onExportDetails?: () => void
  disabled?: boolean
  isExportingWord?: boolean
  isExportingDetails?: boolean
}

const BUTTON_CLASS =
  "h-9 px-3.5 text-xs font-medium border-primary/50 text-primary hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"

export function ReportExportActions({
  onExportWord,
  onExportDetails,
  disabled = false,
  isExportingWord = false,
  isExportingDetails = false,
}: ReportExportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isExportingWord}
        onClick={onExportWord}
        className={BUTTON_CLASS}
      >
        {isExportingWord ? (
          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 size-3.5 stroke-[2]" />
        )}
        Xuất Word
      </Button>
      {onExportDetails && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isExportingDetails}
          onClick={onExportDetails}
          className={BUTTON_CLASS}
        >
          {isExportingDetails ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="mr-1.5 size-3.5 stroke-[2]" />
          )}
          Xuất Excel chi tiết
        </Button>
      )}
    </div>
  )
}
