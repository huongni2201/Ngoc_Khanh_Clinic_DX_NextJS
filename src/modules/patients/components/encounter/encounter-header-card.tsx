"use client"

import * as React from "react"
import {
  User,
  Calendar,
  Stethoscope,
  UserCheck,
  MapPin,
  FileText,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterHeaderCardProps {
  data: EncounterDetailData
  onEditClick?: () => void
}

export function EncounterHeaderCard({ data, onEditClick }: EncounterHeaderCardProps) {
  const { patient, encounter } = data

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      {/* Top row: Avatar, Name, Status, IDs, Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <User className="size-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {patient.fullName}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-600" />
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
            className="h-9 rounded-xl border-border px-3.5 text-xs font-medium hover:text-primary transition-colors"
          >
            <Pencil className="mr-1.5 size-3.5" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Bottom row: 5 metadata blocks */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 border-t border-border pt-5">
        {/* Ngày khám */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Ngày khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.examDate}</p>
          </div>
        </div>

        {/* Loại khám */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Stethoscope className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Loại khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.examType}</p>
          </div>
        </div>

        {/* Bác sĩ khám */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bác sĩ khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.physicianName}</p>
          </div>
        </div>

        {/* Phòng khám */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Phòng khám</p>
            <p className="text-xs font-semibold text-foreground">{encounter.room}</p>
          </div>
        </div>

        {/* Chẩn đoán chính */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Chẩn đoán chính</p>
            <p className="text-xs font-semibold text-foreground truncate max-w-[150px]" title={encounter.primaryDiagnosis}>
              {encounter.primaryDiagnosis}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
