import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DoctorEncounter } from "../types"
import {
  ClipboardList,
  Printer,
  FlaskConical,
  CheckCircle2,
  Clock,
} from "@/shared/ui/product-icon"
import { cn } from "@/lib/utils"

interface DoctorOrdersDialogProps {
  encounter: DoctorEncounter | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorOrdersDialog({
  encounter,
  open,
  onOpenChange,
}: DoctorOrdersDialogProps) {
  if (!encounter) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />
            <DialogTitle className="text-base font-bold text-foreground">
              Phiếu chỉ định cận lâm sàng
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Bệnh nhân: <span className="font-semibold text-foreground">{encounter.patientName}</span> ({encounter.birthYear}) • Mã LK: <span className="font-mono text-foreground font-semibold">{encounter.encounterCode}</span> • Phòng: {encounter.roomName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Danh sách dịch vụ chỉ định ({encounter.prescribedItems?.length ?? encounter.prescribedItemsCount} mục)</span>
            <span>Bác sĩ chỉ định: <strong className="text-foreground font-medium">{encounter.assignedDoctor}</strong></span>
          </div>

          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {encounter.prescribedItems && encounter.prescribedItems.length > 0 ? (
              encounter.prescribedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-muted-foreground w-5 text-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <span className="text-[10px] font-mono bg-muted text-secondary-foreground px-1.5 py-0.2 rounded">
                          {item.code}
                        </span>
                      </div>
                      {item.resultSummary ? (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Kết luận: <span className="font-medium text-foreground">{item.resultSummary}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.category === "XÉT_NGHIỆM"
                            ? "Khoa Xét nghiệm (Tầng 1)"
                            : item.category === "CHẨN_ĐOÁN_HÌNH_ẢNH"
                            ? "Khoa Chẩn đoán hình ảnh (Phòng 108)"
                            : "Phòng thăm dò chức năng (Phòng 106)"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
                        item.status === "COMPLETED"
                          ? "bg-status-success-bg text-status-success border border-status-success/20"
                          : item.status === "IN_PROGRESS"
                          ? "bg-status-in-progress-bg text-status-in-progress border border-status-in-progress/20"
                          : "bg-status-warning-bg text-status-warning border border-status-warning/20"
                      )}
                    >
                      {item.status === "COMPLETED" ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          <span>Đã có KQ</span>
                        </>
                      ) : item.status === "IN_PROGRESS" ? (
                        <>
                          <FlaskConical className="size-3" />
                          <span>Đang làm</span>
                        </>
                      ) : (
                        <>
                          <Clock className="size-3" />
                          <span>Chờ kết quả</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Chưa có chỉ định cận lâm sàng nào cho lượt khám này.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 border-border"
          >
            Đóng
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="size-3.5 mr-1" />
            In phiếu chỉ định
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
