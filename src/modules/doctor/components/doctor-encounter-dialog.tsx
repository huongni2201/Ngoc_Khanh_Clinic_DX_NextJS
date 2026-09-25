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
import { Textarea } from "@/components/ui/textarea"
import { DoctorStatusBadge } from "./doctor-status-badge"
import { DoctorEncounter } from "../types"
import { cn } from "@/lib/utils"
import {
  Stethoscope,
  Activity,
  CheckCircle2,
  FileText,
  FlaskConical,
  Printer,
} from "@/shared/ui/product-icon"

interface DoctorEncounterDialogProps {
  encounter: DoctorEncounter | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleteEncounter?: (encounterId: string) => void
}

function EncounterDialogInner({
  encounter,
  onOpenChange,
  onCompleteEncounter,
}: {
  encounter: DoctorEncounter
  onOpenChange: (open: boolean) => void
  onCompleteEncounter?: (encounterId: string) => void
}) {
  const [diagnosis, setDiagnosis] = React.useState(encounter.diagnosis ?? "")
  const [treatmentPlan, setTreatmentPlan] = React.useState(encounter.treatmentPlan ?? "")

  return (
    <>
      <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-primary bg-selected px-2 py-0.5 rounded">
                {encounter.encounterCode}
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                Hồ sơ khám: {encounter.patientName}
              </DialogTitle>
            </div>
            <DoctorStatusBadge status={encounter.status} />
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {encounter.birthYear} ({encounter.gender}) • SĐT: {encounter.phoneNumber ?? "Chưa cập nhật"} • Phòng: {encounter.roomName} • Tiếp nhận lúc {encounter.checkinTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Sinh hiệu (Vital Signs) */}
          <div className="rounded-lg border border-border bg-surface-alt/40 p-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Activity className="size-4 text-primary" />
              Chỉ số sinh hiệu ban đầu
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-card p-2 rounded border border-border/80">
                <span className="text-muted-foreground block text-[11px]">Huyết áp</span>
                <span className="font-semibold text-foreground font-mono">
                  {encounter.vitalSigns?.bp ?? "120/80 mmHg"}
                </span>
              </div>
              <div className="bg-card p-2 rounded border border-border/80">
                <span className="text-muted-foreground block text-[11px]">Mạch</span>
                <span className="font-semibold text-foreground font-mono">
                  {encounter.vitalSigns?.pulse ?? 76} bpm
                </span>
              </div>
              <div className="bg-card p-2 rounded border border-border/80">
                <span className="text-muted-foreground block text-[11px]">Nhiệt độ</span>
                <span className="font-semibold text-foreground font-mono">
                  {encounter.vitalSigns?.temp ?? 36.8} °C
                </span>
              </div>
              <div className="bg-card p-2 rounded border border-border/80">
                <span className="text-muted-foreground block text-[11px]">SpO2</span>
                <span className="font-semibold text-foreground font-mono">
                  {encounter.vitalSigns?.spO2 ?? 98}%
                </span>
              </div>
            </div>
          </div>

          {/* Lý do khám & Bệnh sử */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Lý do đến khám
            </label>
            <div className="p-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium">
              {encounter.chiefComplaint}
            </div>
          </div>

          {/* Danh mục cận lâm sàng đã chỉ định */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FlaskConical className="size-4 text-status-cls" />
                Chỉ định & Kết quả cận lâm sàng ({encounter.prescribedItems?.length ?? encounter.prescribedItemsCount} hạng mục)
              </label>
            </div>

            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/60">
              {encounter.prescribedItems && encounter.prescribedItems.length > 0 ? (
                encounter.prescribedItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-card flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.resultSummary && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          Kết quả: <span className="font-semibold text-foreground">{item.resultSummary}</span>
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                        item.status === "COMPLETED"
                          ? "bg-status-success-bg text-status-success border border-status-success/20"
                          : item.status === "IN_PROGRESS"
                          ? "bg-status-in-progress-bg text-status-in-progress border border-status-in-progress/20"
                          : "bg-status-warning-bg text-status-warning border border-status-warning/20"
                      )}
                    >
                      {item.status === "COMPLETED"
                        ? "Đã có kết quả"
                        : item.status === "IN_PROGRESS"
                        ? "Đang thực hiện"
                        : "Chờ kết quả"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground bg-card">
                  Không có chỉ định cận lâm sàng nào.
                </div>
              )}
            </div>
          </div>

          {/* Chẩn đoán */}
          <div className="space-y-1.5">
            <label htmlFor="diag-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              Chẩn đoán sơ bộ / Kết luận của bác sĩ
            </label>
            <Textarea
              id="diag-input"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Nhập chẩn đoán lâm sàng, mã bệnh ICD-10..."
              className="text-xs min-h-[64px]"
            />
          </div>

          {/* Hướng xử trí & Đơn thuốc */}
          <div className="space-y-1.5">
            <label htmlFor="treatment-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Stethoscope className="size-4 text-primary" />
              Hướng xử trí & Lời dặn
            </label>
            <Textarea
              id="treatment-input"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Nhập chỉ định điều trị, lời dặn bệnh nhân, hẹn khám..."
              className="text-xs min-h-[64px]"
            />
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
            variant="outline"
            size="sm"
            className="text-xs h-8 border-border"
          >
            <Printer className="size-3.5 mr-1" />
            In bệnh án
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (onCompleteEncounter) {
                onCompleteEncounter(encounter.id)
              }
              onOpenChange(false)
            }}
            className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle2 className="size-3.5 mr-1" />
            Kết luận & Hoàn tất lượt khám
          </Button>
        </DialogFooter>
      </>
  )
}

export function DoctorEncounterDialog({
  encounter,
  open,
  onOpenChange,
  onCompleteEncounter,
}: DoctorEncounterDialogProps) {
  if (!encounter) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <EncounterDialogInner
          key={encounter.id}
          encounter={encounter}
          onOpenChange={onOpenChange}
          onCompleteEncounter={onCompleteEncounter}
        />
      </DialogContent>
    </Dialog>
  )
}
