"use client"

import * as React from "react"
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
  useActivateHealthExaminationAgreement,
  useEndHealthExaminationAgreement,
  useReloadHealthExaminationAgreement,
} from "../hooks/use-agreements"
import type { HealthExaminationAgreement } from "../types"

type TransitionAgreement = Pick<HealthExaminationAgreement, "id" | "name" | "rowVersion">

interface TransitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  agreement: TransitionAgreement
}

interface BaseProps extends TransitionDialogProps {
  title: string
  description: React.ReactNode
  consequences: string[]
  confirmLabel: string
  pendingLabel: string
  conflictMessage: string
  fallbackMessage: string
  mutation: {
    error: Error | null
    isPending: boolean
    reset: () => void
    mutateAsync: (request: {
      organizationId: string
      agreementId: string
      rowVersion: number
    }) => Promise<HealthExaminationAgreement>
  }
  onDone?: (agreement: HealthExaminationAgreement) => void
}

/**
 * Confirms a lifecycle change of an agreement. The change is never resent automatically: after a
 * conflict the user reloads the agreement and decides again.
 */
function AgreementTransitionDialog({
  open,
  onOpenChange,
  organizationId,
  agreement,
  title,
  description,
  consequences,
  confirmLabel,
  pendingLabel,
  conflictMessage,
  fallbackMessage,
  mutation,
  onDone,
}: BaseProps) {
  const reloadMutation = useReloadHealthExaminationAgreement(organizationId, agreement.id)
  const pending = mutation.isPending
  const conflict = isApiErrorStatus(mutation.error, 409)

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) {
      mutation.reset()
      reloadMutation.reset()
    }
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    try {
      const done = await mutation.mutateAsync({
        organizationId,
        agreementId: agreement.id,
        rowVersion: agreement.rowVersion,
      })
      onDone?.(done)
      mutation.reset()
      onOpenChange(false)
    } catch {
      // Rendered below.
    }
  }

  const handleReload = async () => {
    try {
      await reloadMutation.mutateAsync()
      mutation.reset()
    } catch {
      // Rendered below.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {consequences.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>

        {mutation.error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="space-y-2">
              <p>{conflict ? conflictMessage : mutation.error.message || fallbackMessage}</p>
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
            {reloadMutation.error.message || "Không thể tải lại dữ liệu thỏa thuận."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Hủy
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={pending}>
            {pending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ActivateDialogProps extends TransitionDialogProps {
  onActivated?: (agreement: HealthExaminationAgreement) => void
}

/** Confirms activating a draft agreement (DRAFT to ACTIVE). */
export function ActivateHealthExaminationAgreementDialog({
  onActivated,
  ...props
}: ActivateDialogProps) {
  const mutation = useActivateHealthExaminationAgreement()
  return (
    <AgreementTransitionDialog
      {...props}
      title="Kích hoạt thỏa thuận"
      description={`Thỏa thuận “${props.agreement.name}” sẽ chuyển sang trạng thái Đang áp dụng.`}
      consequences={[
        "Không sửa lại tên, thời gian áp dụng và danh sách dịch vụ ban đầu, không xóa được thỏa thuận nữa.",
        "Vẫn thêm hoặc ngừng dịch vụ, thêm, sửa, hủy người khám và xếp lịch khám như trước.",
        "Có thể in phiếu khám cho từng người hoặc hàng loạt.",
      ]}
      confirmLabel="Kích hoạt thỏa thuận"
      pendingLabel="Đang kích hoạt..."
      conflictMessage="Thỏa thuận không còn ở trạng thái Nháp, đơn vị đã ngừng hoạt động hoặc dữ liệu đã thay đổi. Vui lòng tải lại."
      fallbackMessage="Không thể kích hoạt thỏa thuận."
      mutation={mutation}
      onDone={onActivated}
    />
  )
}

interface EndDialogProps extends TransitionDialogProps {
  onEnded?: (agreement: HealthExaminationAgreement) => void
}

/** Confirms ending an active agreement (ACTIVE to ENDED). */
export function EndHealthExaminationAgreementDialog({ onEnded, ...props }: EndDialogProps) {
  const mutation = useEndHealthExaminationAgreement()
  return (
    <AgreementTransitionDialog
      {...props}
      title="Kết thúc thỏa thuận"
      description={`Thỏa thuận “${props.agreement.name}” sẽ chuyển sang trạng thái Đã kết thúc.`}
      consequences={[
        "Không thêm, sửa hay hủy người khám, không đổi dịch vụ và không xếp lịch khám mới nữa.",
        "Danh sách người khám, lịch sử khám, đối soát và báo cáo vẫn xem và xuất được.",
        "Báo cáo thanh toán không còn là tạm tính.",
      ]}
      confirmLabel="Kết thúc thỏa thuận"
      pendingLabel="Đang kết thúc..."
      conflictMessage="Thỏa thuận không còn ở trạng thái Đang áp dụng hoặc dữ liệu đã thay đổi. Vui lòng tải lại."
      fallbackMessage="Không thể kết thúc thỏa thuận."
      mutation={mutation}
      onDone={onEnded}
    />
  )
}
