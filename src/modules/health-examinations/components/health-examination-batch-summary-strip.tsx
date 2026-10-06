"use client"

import * as React from "react"
import { Building2, Calendar, ListChecks } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { HealthExaminationBatch } from "../types"
import { formatHealthExaminationDate } from "../utils/format-health-examination-date"

interface HealthExaminationBatchSummaryStripProps {
  batch: HealthExaminationBatch
}

function formatDateRange(batch: HealthExaminationBatch) {
  const dayCount = batch.examinationDates.length
  if (dayCount === 0 || !batch.startDate) return "Chưa thiết lập"

  const first = formatHealthExaminationDate(batch.startDate)
  const last = formatHealthExaminationDate(batch.endDate ?? batch.startDate)
  return first === last ? `${first} (${dayCount} ngày)` : `${first} – ${last} (${dayCount} ngày)`
}

export function HealthExaminationBatchSummaryStrip({
  batch,
}: HealthExaminationBatchSummaryStripProps) {
  const items = [
    { icon: Building2, label: "Địa điểm khám", value: batch.examinationSiteName },
    { icon: Calendar, label: "Thời gian", value: formatDateRange(batch) },
    { icon: ListChecks, label: "Dịch vụ", value: `${batch.services.length} hạng mục` },
  ]

  return (
    <Card className="rounded-lg border border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border/70 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-6 stroke-[1.75]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <span className="mt-0.5 truncate text-sm font-bold text-foreground sm:text-base">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
