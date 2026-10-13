"use client"

import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import { isApiErrorStatus } from "@/shared/api/api-client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useReloadHealthExaminationBatch,
  useStartHealthExaminationBatch,
} from "../hooks/use-health-examination-batches"
import type { HealthExaminationBatch } from "../types"

interface StartHealthExaminationBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batch: Pick<HealthExaminationBatch, "id" | "name" | "rowVersion">
  onStarted?: (batch: HealthExaminationBatch) => void
}

/**
 * Confirms starting a draft batch (DRAFT to READY). The start is never resent automatically: after
 * a conflict the user reloads the batch and decides again.
 */
export function StartHealthExaminationBatchDialog({
  open,
  onOpenChange,
  organizationId,
  batch,
  onStarted,
}: StartHealthExaminationBatchDialogProps) {
  const startMutation = useStartHealthExaminationBatch()
  const reloadMutation = useReloadHealthExaminationBatch(organizationId, batch.id)
  const pending = startMutation.isPending
  const conflict = isApiErrorStatus(startMutation.error, 409)

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      startMutation.reset()
      reloadMutation.reset()
    }
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    try {
      const started = await startMutation.mutateAsync({
        organizationId,
        batchId: batch.id,
        rowVersion: batch.rowVersion,
      })
      onStarted?.(started)
      startMutation.reset()
      onOpenChange(false)
    } catch {
      // Rendered below.
    }
  }

  const handleReload = async () => {
    try {
      await reloadMutation.mutateAsync()
      startMutation.reset()
    } catch {
      // Rendered below.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bắt đầu đợt khám</DialogTitle>
          <DialogDescription>
            Đợt khám “{batch.name}” sẽ chuyển sang trạng thái Sẵn sàng.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>Không sửa được ngày khám, dịch vụ, giá và không xóa được đợt khám nữa.</li>
          <li>Vẫn thêm, sửa, hủy người khám và nhập chi tiết khám như trước.</li>
          <li>Có thể in phiếu khám cho từng người hoặc hàng loạt.</li>
        </ul>

        {startMutation.error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="space-y-2">
              <p>
                {conflict
                  ? "Đợt khám không còn ở trạng thái Nháp, đơn vị đã ngừng hoạt động hoặc dữ liệu đã thay đổi. Vui lòng tải lại."
                  : startMutation.error.message || "Không thể bắt đầu đợt khám."}
              </p>
              {conflict && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleReload()}
                  disabled={reloadMutation.isPending}
                >
                  {reloadMutation.isPending ? "Đang tải..." : "Tải lại dữ liệu mới nhất"}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        {reloadMutation.error && (
          <p role="alert" className="text-xs text-destructive">
            {reloadMutation.error.message || "Không thể tải lại dữ liệu đợt khám."}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            Hủy
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={pending}>
            {pending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {pending ? "Đang bắt đầu..." : "Bắt đầu đợt khám"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
