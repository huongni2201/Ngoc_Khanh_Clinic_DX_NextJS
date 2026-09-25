"use client"

import * as React from "react"
import { Building2, Calendar, Users, ListChecks } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { HealthExaminationBatch } from "../types"

interface HealthExaminationBatchSummaryStripProps {
  batch: HealthExaminationBatch
  organizationName: string
}

export function HealthExaminationBatchSummaryStrip({
  batch,
  organizationName,
}: HealthExaminationBatchSummaryStripProps) {
  return (
    <Card className="rounded-lg border border-border bg-card  overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/70">
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

          {/* 2. Ngày khám */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Ngày khám
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {batch.examDate}
              </span>
            </div>
          </div>

          {/* 3. Số người khám */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Số người khám
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {batch.participantCount}
              </span>
            </div>
          </div>

          {/* 4. Hạng mục */}
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


