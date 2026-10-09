"use client"

import { Search } from "@/shared/ui/product-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Patient } from "@/modules/patient"

export type CheckInPatient = Pick<
  Patient,
  | "fullName"
  | "patientCode"
  | "gender"
  | "birthYear"
  | "identificationNumber"
  | "phoneNumber"
  | "dateOfBirth"
>

interface CheckInPatientProfileProps {
  selectedPatient: CheckInPatient | null
  patientIdError?: string
  onOpenPatientSearch?: () => void
}

/** Left column: the patient being received, or a prompt to pick one. */
export function CheckInPatientProfile({
  selectedPatient,
  patientIdError,
  onOpenPatientSearch,
}: CheckInPatientProfileProps) {
  return (
    <div className="md:col-span-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          1. Hồ sơ người bệnh
        </span>
        {selectedPatient && onOpenPatientSearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenPatientSearch}
            className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-surface-alt"
          >
            Đổi bệnh nhân
          </Button>
        )}
      </div>

      {selectedPatient ? (
        <div className="p-4 rounded-lg border border-border bg-surface-alt/50 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-foreground">{selectedPatient.fullName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="bg-card text-primary font-mono text-[10px] px-1.5 py-0"
                >
                  {selectedPatient.patientCode}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {selectedPatient.gender === "MALE"
                    ? "Nam"
                    : selectedPatient.gender === "FEMALE"
                      ? "Nữ"
                      : "Khác"}{" "}
                  • {selectedPatient.birthYear}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between text-secondary-foreground">
              <span>Số định danh:</span>
              <span className="font-mono text-foreground font-semibold">
                {selectedPatient.identificationNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-secondary-foreground">
              <span>Số điện thoại:</span>
              <strong className="text-foreground">{selectedPatient.phoneNumber}</strong>
            </div>
            {selectedPatient.dateOfBirth && (
              <div className="flex items-center justify-between text-secondary-foreground">
                <span>Ngày sinh:</span>
                <span className="text-foreground font-mono">{selectedPatient.dateOfBirth}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-border bg-surface-alt/40 flex flex-col items-center justify-center text-center gap-2.5">
          <p className="text-xs text-muted-foreground">Chưa chọn bệnh nhân để tiếp nhận</p>
          {onOpenPatientSearch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenPatientSearch}
              className="gap-1.5 text-xs bg-card"
            >
              <Search className="size-3.5" />
              Tìm & Chọn bệnh nhân
            </Button>
          )}
        </div>
      )}

      {patientIdError && (
        <p className="text-[11px] text-destructive font-medium">{patientIdError}</p>
      )}

      {/* Workflow Guidance Badge */}
      <div className="p-3.5 rounded-lg border border-border/80 bg-surface-alt/30 space-y-1 text-xs text-muted-foreground">
        <div className="font-medium text-foreground text-[11px] flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          Lưu ý luồng tiếp nhận:
        </div>
        <p className="text-[11px] leading-relaxed">
          Sau khi tiếp nhận, bệnh nhân sẽ tự động vào danh sách chờ khám tại phòng đã phân hoặc danh sách chờ điều phối.
        </p>
      </div>
    </div>
  )
}
