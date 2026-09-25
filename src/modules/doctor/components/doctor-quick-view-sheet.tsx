import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DoctorStatusBadge } from "./doctor-status-badge"
import { DoctorEncounter } from "../types"
import {
  Clock,
  ClipboardList,
  Activity,
} from "@/shared/ui/product-icon"

interface DoctorQuickViewSheetProps {
  encounter: DoctorEncounter | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenEncounter: (encounter: DoctorEncounter) => void
}

export function DoctorQuickViewSheet({
  encounter,
  open,
  onOpenChange,
  onOpenEncounter,
}: DoctorQuickViewSheetProps) {
  if (!encounter) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[440px] flex flex-col p-6">
        <SheetHeader className="border-b border-border pb-4 text-left">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-primary bg-selected px-2 py-0.5 rounded">
              {encounter.encounterCode}
            </span>
            <DoctorStatusBadge status={encounter.status} />
          </div>
          <SheetTitle className="text-base font-bold text-foreground mt-2">
            {encounter.patientName}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {encounter.birthYear} • {encounter.gender} • CCCD: {encounter.identificationNumber ?? "Chưa có"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Thông tin liên hệ & tiếp nhận */}
          <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <Clock className="size-3.5 text-primary" />
              Thông tin tiếp nhận
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Giờ tiếp nhận</span>
                <span className="font-medium text-foreground font-mono">{encounter.checkinTime}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Phòng khám</span>
                <span className="font-medium text-foreground">{encounter.roomName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Bác sĩ phụ trách</span>
                <span className="font-medium text-foreground">{encounter.assignedDoctor}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Số điện thoại</span>
                <span className="font-medium text-foreground font-mono">{encounter.phoneNumber ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Lý do khám */}
          <div className="rounded-lg border border-border p-3 space-y-1 bg-card">
            <span className="font-semibold text-foreground block text-xs">Lý do khám bệnh</span>
            <p className="text-secondary-foreground">{encounter.chiefComplaint}</p>
          </div>

          {/* Chỉ số sinh hiệu */}
          {encounter.vitalSigns && (
            <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Activity className="size-3.5 text-primary" />
                Sinh hiệu
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-alt/40 p-2 rounded">
                  <span className="text-muted-foreground block text-[11px]">Huyết áp</span>
                  <span className="font-bold text-foreground font-mono">{encounter.vitalSigns.bp}</span>
                </div>
                <div className="bg-surface-alt/40 p-2 rounded">
                  <span className="text-muted-foreground block text-[11px]">Mạch</span>
                  <span className="font-bold text-foreground font-mono">{encounter.vitalSigns.pulse} bpm</span>
                </div>
                <div className="bg-surface-alt/40 p-2 rounded">
                  <span className="text-muted-foreground block text-[11px]">Nhiệt độ</span>
                  <span className="font-bold text-foreground font-mono">{encounter.vitalSigns.temp} °C</span>
                </div>
                <div className="bg-surface-alt/40 p-2 rounded">
                  <span className="text-muted-foreground block text-[11px]">SpO2</span>
                  <span className="font-bold text-foreground font-mono">{encounter.vitalSigns.spO2}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Hạng mục đã chỉ định */}
          <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <ClipboardList className="size-3.5 text-primary" />
              Chỉ định CLS ({encounter.prescribedItemsCount} hạng mục)
            </h4>
            <div className="space-y-1.5">
              {encounter.prescribedItems?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                  <span className="text-foreground truncate max-w-[200px]">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                    {item.status === "COMPLETED" ? "Đã có KQ" : "Chờ KQ"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border pt-4 gap-2 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs h-8 border-border"
          >
            Đóng
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onOpenEncounter(encounter)
            }}
            className="w-full sm:w-auto text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Mở hồ sơ chi tiết
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
