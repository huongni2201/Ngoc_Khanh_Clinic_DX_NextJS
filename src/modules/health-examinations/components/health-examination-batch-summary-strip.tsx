"use client"

import * as React from "react"
import { Building2, Calendar, ListChecks } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { HealthExaminationBatch } from "../types"
import { formatHealthExaminationDate } from "../utils/format-health-examination-date"

interface HealthExaminationBatchSummaryStripProps {
  batch: HealthExaminationBatch
  organizationName: string
}

export function HealthExaminationBatchSummaryStrip({
  batch,
  organizationName,
}: HealthExaminationBatchSummaryStripProps) {
  const startDate = batch.startDate
    ? formatHealthExaminationDate(batch.startDate)
    : undefined
  const endDate = batch.endDate
    ? formatHealthExaminationDate(batch.endDate)
    : undefined
  const dateRange =
    startDate && endDate
      ? `${startDate} – ${endDate}`
      : startDate
        ? `Từ ${startDate}`
        : endDate
          ? `Đến ${endDate}`
          : "Chưa thiết lập"

  return (
    <Card className="rounded-lg border border-border bg-card  overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border/70 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {/* 1. Đơn vị */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Đơn vị
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground truncate mt-0.5">
                {organizationName}
              </span>
            </div>
          </div>

          {/* 2. Thời gian */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Thời gian
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {dateRange}
              </span>
            </div>
          </div>

          {/* 3. Hạng mục */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListChecks className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Dịch vụ
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {batch.services?.length ?? 0} hạng mục
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


