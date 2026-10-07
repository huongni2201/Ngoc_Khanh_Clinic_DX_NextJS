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
    <Card className="gap-0 py-0">
      <CardContent className="p-0">
        <dl className="grid grid-cols-1 divide-y divide-divider sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-selected text-primary"
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 truncate text-sm font-semibold text-foreground" title={value}>
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
