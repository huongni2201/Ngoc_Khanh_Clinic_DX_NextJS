"use client"

import * as React from "react"
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Scale,
  Calendar,
  ClipboardList,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Info,
} from "@/shared/ui/product-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterSummaryViewProps {
  data: EncounterDetailData
  onNavigateTab: (tab: "diagnosis" | "prescriptions" | "lab" | "documents") => void
}

export function EncounterSummaryView({ data, onNavigateTab }: EncounterSummaryViewProps) {
  const { clinicalRecord, diagnoses, labOrders, treatmentSummary } = data
  const { vitals, clinicalFindings } = clinicalRecord

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Lý do khám, Triệu chứng, Khám lâm sàng & Sinh hiệu (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Lý do khám & Triệu chứng */}
        <div className="rounded-lg border border-border bg-card p-6 ">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">
              Lý do khám & Triệu chứng ban đầu
            </h2>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Lý do vào khám
              </p>
              <p className="mt-1 text-sm font-medium text-foreground leading-relaxed">
                {clinicalRecord.chiefComplaint}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3.5 border border-border/50">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quá trình bệnh lý & Triệu chứng khởi phát
              </p>
              <p className="mt-1 text-xs text-foreground/90 leading-relaxed">
                {clinicalRecord.onsetDuration}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tiền sử bệnh bản thân & Gia đình
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {clinicalRecord.medicalHistory}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Khám lâm sàng & Sinh hiệu */}
        <div className="rounded-lg border border-border bg-card p-6 ">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">
              Sinh hiệu & Khám lâm sàng
            </h2>
          </div>

          {/* Vitals Grid */}
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {/* Mạch */}
            <div className="rounded-lg border border-border/70 bg-background p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-medium">Mạch</span>
                <Heart className="size-3.5 text-status-danger" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-bold tracking-tight text-foreground">{vitals.heartRate}</span>
                <span className="ml-1 text-[10px] text-muted-foreground">ck/p</span>
              </div>
            </div>

            {/* Huyết áp */}
            <div className="rounded-lg border border-border/70 bg-background p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-medium">Huyết áp</span>
                <Activity className="size-3.5 text-primary" />
              </div>
              <div className="mt-1">
                <span className="text-base font-bold tracking-tight text-foreground">{vitals.bloodPressure}</span>
                <span className="ml-0.5 text-[9px] text-muted-foreground">mmHg</span>
              </div>
            </div>

            {/* Thân nhiệt */}
            <div className="rounded-lg border border-border/70 bg-background p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-medium">Nhiệt độ</span>
                <Thermometer className="size-3.5 text-status-warning" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-bold tracking-tight text-foreground">{vitals.temperature}</span>
                <span className="ml-0.5 text-[10px] text-muted-foreground">°C</span>
              </div>
            </div>

            {/* Nhịp thở */}
            <div className="rounded-lg border border-border/70 bg-background p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-medium">Nhịp thở</span>
                <Wind className="size-3.5 text-cyan-600" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-bold tracking-tight text-foreground">{vitals.respiratoryRate}</span>
                <span className="ml-0.5 text-[10px] text-muted-foreground">l/p</span>
              </div>
            </div>

            {/* Thể trạng BMI */}
            <div className="rounded-lg border border-border/70 bg-background p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-medium">BMI</span>
                <Scale className="size-3.5 text-status-success" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight text-foreground">{vitals.bmi}</span>
                <span className="text-[10px] font-medium text-status-success">
                  {vitals.bmiClassification}
                </span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="rounded-lg border border-border/70 bg-background p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-medium">SpO2</span>
                <CheckCircle2 className="size-3.5 text-teal-600" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-bold tracking-tight text-foreground">{vitals.spo2}</span>
                <span className="ml-0.5 text-[10px] text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Khám bộ phận chi tiết in 2 columns */}
          <div className="mt-4 space-y-2.5 border-t border-border pt-3.5 text-xs">
            <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Khám cơ quan & Bộ phận
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="font-semibold text-foreground text-[11px]">Tai - Mũi - Họng</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{clinicalFindings.throat}</p>
              </div>

              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="font-semibold text-foreground text-[11px]">Hô hấp (Phổi)</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{clinicalFindings.lungs}</p>
              </div>

              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="font-semibold text-foreground text-[11px]">Tim mạch</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{clinicalFindings.heart}</p>
              </div>

              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="font-semibold text-foreground text-[11px]">Tiêu hóa & Bụng</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{clinicalFindings.abdomen}</p>
              </div>

              <div className="col-span-1 sm:col-span-2 rounded-lg bg-muted/30 p-2.5">
                <p className="font-semibold text-foreground text-[11px]">Toàn trạng khác</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{clinicalFindings.otherFindings}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Chẩn đoán, chỉ định dịch vụ chẩn đoán, kết luận & hướng điều trị (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Card 1: Chẩn đoán tóm tắt */}
        <div className="rounded-lg border border-border bg-card p-6 ">
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileCheck className="size-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Chẩn đoán xác định</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("diagnosis")}
              className="h-7 text-xs text-primary hover:text-primary/80"
            >
              Chi tiết <ChevronRight className="ml-1 size-3.5" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {diagnoses.map((diag) => (
              <div
                key={diag.id}
                className="rounded-lg border border-border/70 p-3 bg-background"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={diag.type === "PRIMARY" ? "default" : "outline"}
                    className="text-[10px] font-semibold"
                  >
                    {diag.typeLabel}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-primary">
                    ICD: {diag.icdCode}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground">
                  {diag.diseaseName}
                </p>
                {diag.clinicalNotes && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {diag.clinicalNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Cận lâm sàng chính đã làm */}
        <div className="rounded-lg border border-border bg-card p-6 ">
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="size-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Kết quả dịch vụ chẩn đoán chính</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("lab")}
              className="h-7 text-xs text-primary hover:text-primary/80"
            >
              Tất cả (7) <ChevronRight className="ml-1 size-3.5" />
            </Button>
          </div>

          <div className="mt-4 space-y-2.5">
            {labOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-2.5 text-xs bg-background/50 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{order.serviceName}</p>
                  <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                    {order.summaryResult}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-status-success bg-status-success-bg px-2 py-0.5 rounded-full border border-status-success/30">
                  <span className="size-1 rounded-full bg-status-success" />
                  {order.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Kết luận & Hướng điều trị */}
        <div className="rounded-lg border border-border bg-card p-6 ">
          <div className="flex items-center gap-2 pb-3.5 border-b border-border">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Kết luận & Hướng điều trị</h2>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Kết luận điều trị
              </p>
              <p className="mt-1 font-medium text-foreground">
                {treatmentSummary.conclusion}
              </p>
            </div>

            <div className="rounded-lg bg-primary/5 p-3 border border-primary/15">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Lời dặn của bác sĩ
              </p>
              <p className="mt-1 text-foreground/90 leading-relaxed">
                {treatmentSummary.doctorAdvice}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/70">
              <span className="text-muted-foreground">Hẹn ngày tái khám:</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Calendar className="size-3.5 text-primary" />
                {treatmentSummary.followUpDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
