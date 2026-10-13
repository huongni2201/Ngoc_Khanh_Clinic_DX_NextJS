"use client"

import {
  isRenderJobActive,
  RENDER_JOB_STATUS_LABELS,
  useRenderJob,
} from "@/modules/document"
import { FileText, Loader2, Printer } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS } from "../../api/examination-forms"

interface ParticipantPrintSelectionBarProps {
  selectedCount: number
  onSelectAllMatching: () => void
  isSelectingAll: boolean
  onClear: () => void
  onPrint: () => void
  /** The last print job created on this tab, to reopen its progress and files. */
  trackedJobId?: string
  onOpenTrackedJob: () => void
}

/** Selection summary and bulk print actions above the Participant table. */
export function ParticipantPrintSelectionBar({
  selectedCount,
  onSelectAllMatching,
  isSelectingAll,
  onClear,
  onPrint,
  trackedJobId,
  onOpenTrackedJob,
}: ParticipantPrintSelectionBarProps) {
  const tooMany = selectedCount > EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS

  return (
    <div
      role="region"
      aria-label="In phiếu khám hàng loạt"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
    >
      <span className="font-medium text-foreground" aria-live="polite">
        {selectedCount > 0
          ? `Đã chọn ${selectedCount.toLocaleString("vi-VN")} người khám`
          : "Chọn người khám để in phiếu hàng loạt"}
      </span>
      <Button
        type="button"
        variant="link"
        size="xs"
        className="h-auto px-0"
        onClick={onSelectAllMatching}
        disabled={isSelectingAll}
      >
        {isSelectingAll && <Loader2 aria-hidden="true" className="animate-spin" />}
        Chọn tất cả người khớp bộ lọc
      </Button>
      {selectedCount > 0 && (
        <Button type="button" variant="link" size="xs" className="h-auto px-0" onClick={onClear}>
          Bỏ chọn
        </Button>
      )}
      {tooMany && (
        <span role="alert" className="text-destructive">
          Tối đa {EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS.toLocaleString("vi-VN")} người mỗi lệnh in.
        </span>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {trackedJobId && <TrackedJobButton jobId={trackedJobId} onOpen={onOpenTrackedJob} />}
        <Button
          type="button"
          size="sm"
          onClick={onPrint}
          disabled={selectedCount === 0 || tooMany}
        >
          <Printer className="size-3.5" />
          In phiếu khám{selectedCount > 0 ? ` (${selectedCount.toLocaleString("vi-VN")})` : ""}
        </Button>
      </div>
    </div>
  )
}

/** Reopens the last print job; its label follows the job while it runs. */
function TrackedJobButton({ jobId, onOpen }: { jobId: string; onOpen: () => void }) {
  const { data } = useRenderJob(jobId)
  const active = isRenderJobActive(data?.status)
  const status = data
    ? active
      ? `${data.processedCount.toLocaleString("vi-VN")}/${data.totalCount.toLocaleString("vi-VN")}`
      : RENDER_JOB_STATUS_LABELS[data.status]
    : undefined

  return (
    <Button type="button" variant="outline" size="sm" onClick={onOpen}>
      {active ? (
        <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        <FileText aria-hidden="true" className="size-3.5" />
      )}
      Lệnh in gần nhất{status ? ` · ${status}` : ""}
    </Button>
  )
}
