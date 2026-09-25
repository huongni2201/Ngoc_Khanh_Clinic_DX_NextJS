"use client"

import * as React from "react"
import {
  ArrowLeft,
  Printer,
  Download,
  Droplet,
  CheckCircle2,
  ShieldCheck,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { EncounterDetailData, LabIndicatorResult } from "../../types/encounter"

interface EncounterLabDetailCBCViewProps {
  data: EncounterDetailData
  onBack: () => void
}

export function EncounterLabDetailCBCView({ data, onBack }: EncounterLabDetailCBCViewProps) {
  const { laboratoryReportCBC, encounter, patient } = data

  return (
    <div className="space-y-6">
      {/* Top action and back button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-9 rounded-lg border-border px-3 text-xs font-medium text-foreground hover:bg-muted w-fit"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Quay lại danh sách dịch vụ chẩn đoán
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Gửi lệnh in phiếu kết quả xét nghiệm...")}
            className="h-9 rounded-lg border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Printer className="mr-1.5 size-4 text-primary" />
            In phiếu kết quả
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Tải xuống phiếu kết quả dạng PDF...")}
            className="h-9 rounded-lg border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Download className="mr-1.5 size-4 text-primary" />
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Main Lab Result Card */}
      <div className="rounded-lg border border-border bg-card p-6 ">
        {/* Header Title */}
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="flex size-10 items-center justify-center rounded-lg bg-status-danger-bg text-status-danger border border-status-danger/30">
            <Droplet className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-foreground">
                {laboratoryReportCBC.serviceName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2 py-0.5 text-xs font-semibold text-status-success border border-status-success/30">
                <CheckCircle2 className="size-3 text-status-success" />
                {laboratoryReportCBC.statusLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mã xét nghiệm: <span className="font-mono font-semibold">{laboratoryReportCBC.orderCode}</span> • Lượt khám: {encounter.encounterCode}
            </p>
          </div>
        </div>

        {/* Specimen & Process Meta Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 rounded-lg bg-muted/30 p-4 border border-border/60 text-xs">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bác sĩ chỉ định</p>
            <p className="font-semibold text-foreground mt-0.5">{laboratoryReportCBC.orderingPhysician}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Người lấy mẫu</p>
            <p className="font-semibold text-foreground mt-0.5">{laboratoryReportCBC.sampleCollector}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Thời gian lấy mẫu</p>
            <p className="font-semibold text-foreground mt-0.5">{laboratoryReportCBC.sampledAt}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Thời gian trả KQ</p>
            <p className="font-semibold text-foreground mt-0.5">{laboratoryReportCBC.resultReportedAt}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bác sĩ duyệt KQ</p>
            <p className="font-semibold text-foreground mt-0.5">{laboratoryReportCBC.approvingPhysician}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bệnh nhân</p>
            <p className="font-semibold text-foreground mt-0.5 truncate">{patient.fullName}</p>
          </div>
        </div>

        {/* Indicator Table */}
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[200px]">Tên chỉ số xét nghiệm</th>
                <th className="py-3 px-4 w-28 font-mono">Viết tắt</th>
                <th className="py-3 px-4 w-28 text-right font-mono">Kết quả</th>
                <th className="py-3 px-4 w-24">Đơn vị</th>
                <th className="py-3 px-4 min-w-[160px]">Khoảng tham chiếu</th>
                <th className="py-3 px-4 w-32 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {laboratoryReportCBC.indicators.map((ind: LabIndicatorResult) => (
                <tr key={ind.stt} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-center font-medium text-muted-foreground">
                    {ind.stt}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {ind.indicatorName}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {ind.shortCode}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm text-foreground">
                    {ind.value}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {ind.unit}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {ind.referenceRange}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2 py-0.5 text-[11px] font-semibold text-status-success border border-status-success/30">
                      <span className="size-1 rounded-full bg-status-success" />
                      {ind.evaluationLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conclusion and Clinical Validation */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs">
            <p className="font-semibold text-primary uppercase tracking-wider text-[11px]">
              Kết luận xét nghiệm
            </p>
            <p className="mt-1.5 font-medium text-foreground leading-relaxed">
              {laboratoryReportCBC.conclusion}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Ghi chú mẫu: {laboratoryReportCBC.notes}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4 text-status-success" />
              <span>Kết quả đã kiểm tra chất lượng nội bộ và duyệt điện tử</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">Bác sĩ Chuyên khoa Xét nghiệm</p>
                <p className="font-bold text-foreground text-sm">{laboratoryReportCBC.approvingPhysician}</p>
              </div>
              <span className="rounded bg-muted px-2 py-1 text-[10px] font-mono text-muted-foreground">
                Ký số lúc {laboratoryReportCBC.resultReportedAt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
