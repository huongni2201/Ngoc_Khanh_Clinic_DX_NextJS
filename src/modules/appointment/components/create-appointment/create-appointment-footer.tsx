"use client"

import { Loader2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

interface CreateAppointmentFooterProps {
  isPending: boolean
  canSubmit: boolean
  onCancel: () => void
}

export function CreateAppointmentFooter({ isPending, canSubmit, onCancel }: CreateAppointmentFooterProps) {
  return (
    <DialogFooter className="px-6 py-3 border-t border-border bg-card flex items-center justify-between gap-2 sm:gap-2">
      <span className="text-[11px] text-muted-foreground hidden sm:inline">Nhấn ESC để đóng</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !canSubmit}
          className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Tạo lịch hẹn"
          )}
        </Button>
      </div>
    </DialogFooter>
  )
}
