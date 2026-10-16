"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteHealthExaminationAgreementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agreementName: string
  deleteError: Error | null
  /** The backend refused the delete because the agreement changed (HTTP 409). */
  isDeleteConflict: boolean
  isDeleting: boolean
  reloadError: Error | null
  isReloading: boolean
  onConfirm: () => void
  /** Reads the latest version after a conflict; the deletion is never resent automatically. */
  onReload: () => void
}

export function DeleteHealthExaminationAgreementDialog({
  open,
  onOpenChange,
  agreementName,
  deleteError,
  isDeleteConflict,
  isDeleting,
  reloadError,
  isReloading,
  onConfirm,
  onReload,
}: DeleteHealthExaminationAgreementDialogProps) {
  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Xác nhận xóa thỏa thuận</DialogTitle>
        <DialogDescription>
          Thỏa thuận “{agreementName}” sẽ bị xóa và không còn xuất hiện trong danh sách. Chỉ đợt
          khám ở trạng thái Nháp và chưa có người khám mới xóa được.
        </DialogDescription>
      </DialogHeader>
      {deleteError && (
        <div role="alert" className="space-y-2 text-xs text-destructive">
          <p>
            {isDeleteConflict
              ? "Thỏa thuận đã có người khám, không còn ở trạng thái Nháp hoặc dữ liệu đã thay đổi. Vui lòng tải lại."
              : deleteError.message || "Không thể xóa thỏa thuận."}
          </p>
          {isDeleteConflict && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReload}
              disabled={isReloading}
            >
              {isReloading ? "Đang tải..." : "Tải lại dữ liệu mới nhất"}
            </Button>
          )}
        </div>
      )}
      {reloadError && (
        <p role="alert" className="text-xs text-destructive">
          {reloadError.message || "Không thể tải lại dữ liệu thỏa thuận."}
        </p>
      )}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}
