"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CatalogMutationError } from "./catalog-mutation-error"

interface CatalogStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "deactivate" | "reactivate"
  entityLabel: string
  entityName: string
  extraDescription?: string
  isPending: boolean
  onConfirm: () => void
  error?: unknown
  onReload?: () => Promise<void>
  isReloading?: boolean
}

/**
 * Shared confirm dialog for "Ngừng sử dụng" and "Bật lại" actions across all 5 catalog resources.
 */
export function CatalogStatusDialog({
  open,
  onOpenChange,
  mode,
  entityLabel,
  entityName,
  extraDescription,
  isPending,
  onConfirm,
  error,
  onReload,
  isReloading = false,
}: CatalogStatusDialogProps) {
  const isDeactivate = mode === "deactivate"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isDeactivate ? `Ngừng sử dụng ${entityLabel}` : `Bật lại ${entityLabel}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isDeactivate ? (
              <>
                Bạn đang ngừng sử dụng{" "}
                <span className="font-medium text-foreground">{entityName}</span>.{" "}
                {extraDescription ??
                  `${entityLabel} này sẽ không còn xuất hiện trong các lựa chọn mới. Bạn có thể bật lại sau.`}
              </>
            ) : (
              <>
                Bạn đang bật lại{" "}
                <span className="font-medium text-foreground">{entityName}</span>. {entityLabel} này
                sẽ trở về trạng thái đang sử dụng.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <CatalogMutationError error={error} entityLabel={entityLabel} onReload={onReload} discardDraft={false} />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending || isReloading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={isDeactivate ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending || isReloading}
          >
            {isPending
              ? isDeactivate
                ? "Đang ngừng..."
                : "Đang bật lại..."
              : isDeactivate
              ? "Ngừng sử dụng"
              : "Bật lại"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
