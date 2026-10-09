"use client"

import { Search, UserPlus } from "@/shared/ui/product-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Patient } from "@/modules/patient"

interface IndividualPatientSectionProps {
  selectedPatient: Patient | null
  onOpenPatientSearch?: () => void
  onOpenCreatePatient?: () => void
}

/** Patient picker for an individual appointment: the chosen record, or a prompt to find/create one. */
export function IndividualPatientSection({
  selectedPatient,
  onOpenPatientSearch,
  onOpenCreatePatient,
}: IndividualPatientSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          1. Người bệnh đặt hẹn
        </span>
        {onOpenCreatePatient && (
          <button
            type="button"
            onClick={onOpenCreatePatient}
            className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
          >
            + Tạo BN mới
          </button>
        )}
      </div>

      {selectedPatient ? (
        <div className="p-4 rounded-lg border border-border bg-surface-alt/50 space-y-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">{selectedPatient.fullName}</span>
              <Badge variant="outline" className="bg-card text-primary font-mono text-[10px]">
                {selectedPatient.patientCode}
              </Badge>
            </div>
            <div className="text-xs text-secondary-foreground pt-1 space-y-1">
              <div>
                SĐT: <strong className="text-foreground">{selectedPatient.phoneNumber}</strong>
              </div>
              <div>
                Số định danh:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {selectedPatient.identificationNumber}
                </span>
              </div>
            </div>
          </div>

          {onOpenPatientSearch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenPatientSearch}
              className="h-7 text-xs bg-card w-full mt-2"
            >
              Đổi bệnh nhân
            </Button>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-border bg-surface-alt/40 flex flex-col items-center justify-center text-center gap-2.5">
          <span className="text-xs text-muted-foreground">Chưa chọn hồ sơ bệnh nhân</span>
          <div className="flex items-center gap-2">
            {onOpenPatientSearch && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenPatientSearch}
                className="gap-1 h-7 text-xs bg-card"
              >
                <Search className="size-3" />
                Tìm bệnh nhân
              </Button>
            )}
            {onOpenCreatePatient && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onOpenCreatePatient}
                className="gap-1 h-7 text-xs bg-primary text-primary-foreground"
              >
                <UserPlus className="size-3" />
                Tạo mới
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
