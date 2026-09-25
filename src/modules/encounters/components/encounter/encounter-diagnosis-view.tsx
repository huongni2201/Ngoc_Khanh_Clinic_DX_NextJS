"use client"

import * as React from "react"
import { FileText, Stethoscope } from "@/shared/ui/product-icon"
import { Badge } from "@/components/ui/badge"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterDiagnosisViewProps {
  data: EncounterDetailData
}

export function EncounterDiagnosisView({ data }: EncounterDiagnosisViewProps) {
  const { diagnoses, clinicalRecord } = data

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 ">
        {/* Table Header */}
        <div className="flex items-center justify-between pb-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Danh sách chẩn đoán bệnh
              </h2>
              <p className="text-xs text-muted-foreground">
                Chẩn đoán xác định mã ICD-10 và phân loại bởi bác sĩ khám
              </p>
            </div>
          </div>
        </div>

        {/* Diagnosis Table */}
        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-44">Loại chẩn đoán</th>
                <th className="py-3 px-4 w-32 font-mono">Mã ICD-10</th>
                <th className="py-3 px-4 min-w-[240px]">Tên chẩn đoán bệnh</th>
                <th className="py-3 px-4 min-w-[280px]">Ghi chú / Mô tả chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {diagnoses.map((diag) => (
                <tr key={diag.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                    {diag.sequence}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        diag.type === "PRIMARY"
                          ? "default"
                          : diag.type === "SECONDARY"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[11px] font-semibold"
                    >
                      {diag.typeLabel}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary text-xs">
                    {diag.icdCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {diag.diagnosisName}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground leading-relaxed">
                    {diag.clinicalNotes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor Clinical Reasoning Callout */}
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4.5">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs">
            <FileText className="size-4 shrink-0" />
            <span>Nhận xét lâm sàng & Biện luận của bác sĩ</span>
          </div>
          <p className="mt-2 text-xs text-foreground/90 leading-relaxed">
            {clinicalRecord.clinicalNotes}
          </p>
        </div>
      </div>
    </div>
  )
}
