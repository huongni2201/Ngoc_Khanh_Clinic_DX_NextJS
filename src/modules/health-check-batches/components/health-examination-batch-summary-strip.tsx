"use client"

import * as React from "react"
import { Building2, Calendar, Users, ListChecks } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { HealthExaminationBatch } from "../types"

interface HealthExaminationBatchSummaryStripProps {
  batch: HealthExaminationBatch
  enterpriseName: string
}

export function HealthExaminationBatchSummaryStrip({
  batch,
  enterpriseName,
}: HealthExaminationBatchSummaryStripProps) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/70">
          {/* 1. Doanh nghiệp */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Doanh nghiệp
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground truncate mt-0.5">
                {enterpriseName}
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

          {/* 3. Số nhân sự */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-6 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Số nhân sự
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {batch.employeeCount}
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
                Hạng mục
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {batch.items?.length ?? 0} hạng mục
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
