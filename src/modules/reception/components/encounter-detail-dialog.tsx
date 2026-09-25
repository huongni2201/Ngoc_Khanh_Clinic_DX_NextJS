"use client"

import * as React from "react"
import { Printer, CreditCard, DoorOpen, Clock } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReceptionStatusBadge } from "./reception-status-badge"
import { Encounter } from "../types"
import { cn } from "@/lib/utils"

interface EncounterDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounter: Encounter | null
  onAssignRoom?: (encounter: Encounter) => void
  onProcessPayment?: (encounter: Encounter) => void
  onPrintForm?: (encounter: Encounter) => void
}

export function EncounterDetailDialog({
  open,
  onOpenChange,
  encounter,
  onAssignRoom,
  onProcessPayment,
  onPrintForm,
}: EncounterDetailDialogProps) {
  if (!encounter) return null

  const genderText =
    encounter.gender === "MALE"
      ? "Nam"
      : encounter.gender === "FEMALE"
        ? "Nữ"
        : "Khác"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Chi tiết lượt khám
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground font-mono mt-0.5">
                {encounter.encounterCode}
              </DialogDescription>
            </div>

            <ReceptionStatusBadge status={encounter.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 -mr-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Patient Demographics & Key Identity */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Thông tin người bệnh
              </span>
              <div className="p-4 rounded-lg border border-border bg-surface-alt/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      {encounter.patientName}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-card text-primary font-mono text-[10px] px-1.5 py-0 mt-0.5"
                    >
                      {encounter.patientCode}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-secondary-foreground">
                  <div className="flex items-center justify-between">
                    <span>Giới tính / Năm sinh:</span>
                    <strong className="text-foreground">
                      {genderText} • {encounter.birthYear}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Số điện thoại:</span>
                    <strong className="text-foreground font-medium">
                      {encounter.phoneNumber}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Số định danh:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {encounter.identificationNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="p-3.5 rounded-lg border border-border/70 bg-surface-alt/30 space-y-2 text-xs">
                <span className="font-semibold text-foreground text-[11px] block">
                  Tiến trình phục vụ trong ngày:
                </span>
                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-status-success" />
                    <span>Đã tiếp đón lúc <strong className="text-foreground font-mono">{encounter.arrivalTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", encounter.roomId ? "bg-status-success" : "bg-status-warning")} />
                    <span>{encounter.roomId ? `Đã phân vào ${encounter.roomName}` : "Chờ phân phòng khám"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Clinical & Operational Routing Info */}
            <div className="md:col-span-7 space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Điều phối chuyên môn
              </span>
              <div className="space-y-2.5 border border-border rounded-lg p-4 text-xs bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Giờ tiếp nhận:</span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">
                    {encounter.arrivalTime}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Loại khám:</span>
                  <span className="font-semibold text-foreground">
                    {encounter.examinationType}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Phòng khám chỉ định:</span>
                  <span className="font-medium text-foreground">
                    {encounter.roomName || "Chưa phân phòng"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Bác sĩ phụ trách:</span>
                  <span className="font-medium text-foreground">
                    {encounter.physicianName || "Chưa phân công"}
                  </span>
                </div>

                {encounter.reasonForVisit && (
                  <div className="pt-1">
                    <span className="text-muted-foreground block mb-1">
                      Lý do đến khám:
                    </span>
                    <p className="text-foreground bg-surface-alt/50 p-2.5 rounded-lg text-xs leading-relaxed border border-border/60">
                      {encounter.reasonForVisit}
                    </p>
                  </div>
                )}

                {encounter.notes && (
                  <div className="pt-1">
                    <span className="text-muted-foreground block mb-1">
                      Ghi chú hành chính:
                    </span>
                    <p className="text-foreground italic bg-surface-alt/50 p-2.5 rounded-lg text-xs border border-border/60">
                      {encounter.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-3">
            {onPrintForm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  onPrintForm(encounter)
                }}
                className="gap-2 h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
              >
                <Printer className="size-4" />
                In phiếu
              </Button>
            )}

            {encounter.status === "RECEIVED" && onAssignRoom && (
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onAssignRoom(encounter)
                }}
                className="gap-2 h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg  cursor-pointer"
              >
                <DoorOpen className="size-4" />
                Phân phòng
              </Button>
            )}

            {encounter.status === "WAITING_PAYMENT" && onProcessPayment && (
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onProcessPayment(encounter)
                }}
                className="gap-2 h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg  cursor-pointer"
              >
                <CreditCard className="size-4" />
                Thu phí
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
