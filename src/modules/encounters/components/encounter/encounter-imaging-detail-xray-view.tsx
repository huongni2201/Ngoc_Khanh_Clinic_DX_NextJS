"use client"

import * as React from "react"
import {
  ArrowLeft,
  Printer,
  Download,
  Scan,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Contrast,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterImagingDetailXRayViewProps {
  data: EncounterDetailData
  onBack: () => void
}

export function EncounterImagingDetailXRayView({
  data,
  onBack,
}: EncounterImagingDetailXRayViewProps) {
  const { imagingReport, encounter, patient } = data
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [isInverted, setIsInverted] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* Top action bar */}
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
            onClick={() => alert("Gửi lệnh in kết quả chẩn đoán hình ảnh...")}
            className="h-9 rounded-lg border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Printer className="mr-1.5 size-4 text-primary" />
            In kết quả
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Đang tải file gốc DICOM (.dcm)...")}
            className="h-9 rounded-lg border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Download className="mr-1.5 size-4 text-primary" />
            Tải file DICOM
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-lg border border-border bg-card p-6 ">
        {/* Title */}
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="flex size-10 items-center justify-center rounded-lg bg-info-bg text-primary border border-info/30">
            <Scan className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-foreground">
                {imagingReport.serviceName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2 py-0.5 text-xs font-semibold text-status-success border border-status-success/30">
                <CheckCircle2 className="size-3 text-status-success" />
                Hoàn tất
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mã phiếu: <span className="font-mono font-semibold">{imagingReport.orderCode}</span> • Lượt khám: {encounter.encounterCode}
            </p>
          </div>
        </div>

        {/* Imaging Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 rounded-lg bg-muted/30 p-4 border border-border/60 text-xs">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Kỹ thuật chụp</p>
            <p className="font-semibold text-foreground mt-0.5">{imagingReport.technique}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bác sĩ chỉ định</p>
            <p className="font-semibold text-foreground mt-0.5">{imagingReport.orderingPhysician}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bác sĩ đọc KQ</p>
            <p className="font-semibold text-foreground mt-0.5">{imagingReport.radiologist}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Thời gian chụp</p>
            <p className="font-semibold text-foreground mt-0.5">{imagingReport.performedAt}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Thiết bị chụp</p>
            <p className="font-semibold text-foreground mt-0.5 truncate" title={imagingReport.device}>
              {imagingReport.device}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Bệnh nhân</p>
            <p className="font-semibold text-foreground mt-0.5 truncate">{patient.fullName}</p>
          </div>
        </div>

        {/* 2-Column: Left = Image Viewer, Right = Findings & Conclusion */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Image Viewer Frame (6 cols) */}
          <div className="lg:col-span-6 flex flex-col rounded-lg border border-border bg-foreground overflow-hidden ">
            {/* Viewer HUD Toolbar */}
            <div className="flex items-center justify-between border-b border-border bg-foreground px-3 py-2 text-background/80">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="font-bold text-white">DR X-RAY</span>
                <span className="text-muted-foreground">|</span>
                <span>PA CHEST ERECT</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Thu nhỏ"
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                  className="flex size-7 items-center justify-center rounded text-background/70 hover:bg-background/10 hover:text-background transition-colors"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="text-[10px] font-mono w-10 text-center text-background/70">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  title="Phóng to"
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                  className="flex size-7 items-center justify-center rounded text-background/70 hover:bg-background/10 hover:text-background transition-colors"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <div className="h-4 w-px bg-background/20 mx-1" />
                <button
                  type="button"
                  title="Đảo màu tương phản"
                  onClick={() => setIsInverted((v) => !v)}
                  className="flex size-7 items-center justify-center rounded text-background/70 hover:bg-background/10 hover:text-background transition-colors"
                >
                  <Contrast className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Đặt lại hiển thị"
                  onClick={() => {
                    setZoomLevel(100)
                    setIsInverted(false)
                  }}
                  className="flex size-7 items-center justify-center rounded text-background/70 hover:bg-background/10 hover:text-background transition-colors"
                >
                  <RotateCw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Viewer Stage with Anatomical Radiograph Simulation */}
            <div
              className={`relative flex items-center justify-center min-h-[420px] p-6 overflow-hidden transition-colors ${
                isInverted ? "bg-background" : "bg-foreground"
              }`}
            >
              {/* Radiograph Anatomical SVG */}
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  filter: isInverted ? "invert(1)" : "none",
                }}
                className="transition-transform duration-200"
              >
                <svg
                  width="360"
                  height="380"
                  viewBox="0 0 360 380"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className=""
                >
                  {/* Background Soft Lung Fields */}
                  <rect width="360" height="380" fill="#05070a" rx="12" />

                  {/* Spinal Column */}
                  <line x1="180" y1="20" x2="180" y2="350" stroke="#334155" strokeWidth="14" strokeDasharray="6 4" opacity="0.4" />
                  
                  {/* Clavicles */}
                  <path d="M70 70 Q130 50 178 74" stroke="#64748b" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                  <path d="M290 70 Q230 50 182 74" stroke="#64748b" strokeWidth="6" strokeLinecap="round" opacity="0.6" />

                  {/* Left & Right Lung Fields (Radiolucent dark areas) */}
                  <path
                    d="M170 85 C140 85 90 120 75 180 C60 240 68 290 85 310 C110 325 150 320 168 295 C172 260 170 140 170 85 Z"
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  <path
                    d="M190 85 C220 85 270 120 285 180 C300 240 292 290 275 310 C250 325 210 320 192 295 C188 260 190 140 190 85 Z"
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="2"
                    opacity="0.9"
                  />

                  {/* Rib Cage Arches */}
                  {[105, 135, 165, 195, 225, 255, 285].map((y, i) => (
                    <g key={i} opacity="0.35">
                      <path
                        d={`M175 ${y - 10} Q120 ${y - 15} 75 ${y + 15}`}
                        stroke="#94a3b8"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M185 ${y - 10} Q240 ${y - 15} 285 ${y + 15}`}
                        stroke="#94a3b8"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </g>
                  ))}

                  {/* Mediastinum & Cardiac Silhouette */}
                  <path
                    d="M175 140 Q180 180 160 210 Q140 240 142 270 Q160 300 190 300 Q205 300 215 285 Q220 250 200 200 Q185 170 185 140 Z"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  {/* Diaphragmatic Domes */}
                  <path d="M60 320 Q115 285 175 300" stroke="#475569" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                  <path d="M300 320 Q245 285 185 300" stroke="#475569" strokeWidth="6" strokeLinecap="round" opacity="0.7" />

                  {/* Anatomical Marker 'R' */}
                  <text x="32" y="55" fill="#f8fafc" fontSize="22" fontWeight="bold" fontFamily="sans-serif">
                    R
                  </text>
                  <text x="32" y="75" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    ERECT
                  </text>
                </svg>
              </div>

              {/* HUD Overlay details */}
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-background/70 bg-foreground/80 px-2 py-1 rounded">
                BN000123 • HUNG, NGUYEN VAN • M39
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-background/70 bg-foreground/80 px-2 py-1 rounded">
                16/09/2024 14:00:22 • 120kV 3.2mAs
              </div>
            </div>
          </div>

          {/* RIGHT: Detailed findings & Conclusion (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Description Points */}
            <div className="rounded-lg border border-border bg-card p-5 text-xs">
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <FileCheck className="size-4 text-primary" />
                Mô tả hình ảnh X-quang
              </h3>

              <ul className="space-y-2.5 text-muted-foreground list-disc pl-4 leading-relaxed">
                {imagingReport.findings.map((point: string, index: number) => (
                  <li key={index} className="pl-1">
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conclusion Box */}
            <div className="rounded-lg border border-status-success/30 bg-status-success-bg p-5 text-xs">
              <p className="font-bold text-status-success text-xs uppercase tracking-wider">
                Kết luận chẩn đoán hình ảnh
              </p>
              <p className="mt-2 text-sm font-bold text-status-success">
                {imagingReport.impression}
              </p>
              <div className="mt-3 pt-3 border-t border-status-success/30 text-status-success">
                <span className="font-semibold">Đề nghị: </span>
                <span>{imagingReport.recommendation}</span>
              </div>
            </div>

            {/* Doctor Signature Block */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">Bác sĩ đọc kết quả</p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {imagingReport.radiologist}
                </p>
                <p className="text-[11px] text-muted-foreground">Chuyên khoa Chẩn đoán hình ảnh</p>
              </div>
              <div className="flex items-center gap-1.5 text-status-success bg-status-success-bg px-2.5 py-1 rounded-lg border border-status-success/30 text-[11px] font-semibold">
                <ShieldCheck className="size-3.5 text-status-success" />
                <span>Đã ký số điện tử</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
