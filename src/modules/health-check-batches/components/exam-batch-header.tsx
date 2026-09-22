"use client"

import * as React from "react"
import Link from "next/link"
import { Home, ChevronRight, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExamBatch } from "../types"
import { ExamBatchTabType } from "./exam-batch-tabs"

interface ExamBatchHeaderProps {
  batch: ExamBatch
  enterpriseName: string
  activeTab?: ExamBatchTabType
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function ExamBatchHeader({
  batch,
  enterpriseName,
  activeTab = "employees",
  onImportClick,
  onDownloadTemplateClick,
}: ExamBatchHeaderProps) {
  const subtitle =
    activeTab === "examination"
      ? "Theo dõi nhân sự đã khám các hạng mục nào"
      : activeTab === "report"
      ? "Báo cáo tổng hợp đợt khám"
      : "Danh sách nhân viên tham gia đợt khám"

  return (
    <div className="space-y-3">
      {/* Breadcrumbs Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link
          href="/dashboard"
          className="flex items-center hover:text-foreground transition-colors"
          title="Tổng quan"
        >
          <Home className="size-3.5" />
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <Link
          href="/enterprises"
          className="hover:text-foreground transition-colors"
        >
          Doanh nghiệp
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <Link
          href={`/enterprises/${batch.enterpriseId}`}
          className="hover:text-foreground transition-colors font-medium text-foreground"
        >
          {enterpriseName}
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="text-muted-foreground">Đợt khám</span>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
          {batch.name}
        </span>
      </nav>

      {/* Page Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {batch.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons: Import & Template Download only on employees tab */}
        {activeTab === "employees" && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onImportClick}
              className="h-9 px-3.5 text-xs font-medium border-primary/40 text-primary hover:bg-primary/5 hover:text-primary transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="size-3.5 mr-1.5 stroke-[2]" />
              Import nhân sự
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplateClick}
              className="h-9 px-3.5 text-xs font-medium border-primary/40 text-primary hover:bg-primary/5 hover:text-primary transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="size-3.5 mr-1.5 stroke-[2]" />
              Tải file mẫu
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
