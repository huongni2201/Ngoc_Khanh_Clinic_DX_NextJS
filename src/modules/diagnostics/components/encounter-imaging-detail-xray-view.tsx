"use client"

import { ArrowLeft, Scan } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import type { ImagingReport } from "../types"

interface EncounterImagingDetailXRayViewProps {
  data: { imagingReport: ImagingReport }
  onBack: () => void
}

export function EncounterImagingDetailXRayView({
  data,
  onBack,
}: EncounterImagingDetailXRayViewProps) {
  const { imagingReport } = data

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="h-9 w-fit rounded-lg border-border px-3 text-xs font-medium text-foreground hover:bg-muted"
      >
        <ArrowLeft className="mr-1.5 size-4" />
        Quay lại danh sách dịch vụ chẩn đoán
      </Button>

      <section
        role="status"
        className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center"
      >
        <div className="max-w-md space-y-2">
          <Scan className="mx-auto size-8 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">
            {imagingReport.serviceName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Backend chưa cung cấp API để tải ảnh chẩn đoán hình ảnh.
          </p>
          <p className="text-xs text-muted-foreground">
            Mã phiếu: {imagingReport.orderCode}
          </p>
        </div>
      </section>
    </div>
  )
}
