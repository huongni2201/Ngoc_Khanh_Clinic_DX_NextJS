"use client"

import * as React from "react"
import { Pencil } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterHeaderCardProps {
  data: EncounterDetailData
  onEditClick?: () => void
}

export function EncounterHeaderCard({ data, onEditClick }: EncounterHeaderCardProps) {
  const { patient, encounter } = data

  return (
    <section
      aria-label="Thông tin lượt khám"
      className="rounded-lg border border-border bg-card px-5 py-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {patient.fullName}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-status-success-bg px-2 py-0.5 text-xs font-medium text-status-success border border-status-success/30">
                <span className="size-1.5 rounded-full bg-status-success" />
                {encounter.statusLabel}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>
                Mã BN: <strong className="font-semibold text-foreground">{patient.patientCode}</strong>
              </span>
              <span>•</span>
              <span>
                Mã lượt khám: <strong className="font-semibold text-foreground">{encounter.encounterCode}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
          >
            <Pencil className="size-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
        <div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Ngày khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.encounterDate}</p>
          </div>
        </div>

        {/* Loại khám */}
        <div className="lg:border-l lg:border-border lg:pl-5">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Loại khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.serviceName}</p>
          </div>
        </div>

        {/* Bác sĩ khám */}
        <div className="lg:border-l lg:border-border lg:pl-5">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bác sĩ khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.physicianName}</p>
          </div>
        </div>

        {/* Phòng khám */}
        <div className="lg:border-l lg:border-border lg:pl-5">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Phòng khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.room}</p>
          </div>
        </div>

        {/* Chẩn đoán chính */}
        <div className="col-span-2 sm:col-span-1 lg:border-l lg:border-border lg:pl-5">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Chẩn đoán chính</p>
            <p className="text-xs font-semibold text-foreground truncate max-w-[150px]" title={encounter.primaryDiagnosis}>
              {encounter.primaryDiagnosis}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
