"use client"

import * as React from "react"
import { Upload, Download } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"
import { HealthExaminationBatch } from "../types"
import { HealthExaminationBatchTabType } from "./health-examination-batch-tabs"

interface HealthExaminationBatchHeaderProps {
  batch: HealthExaminationBatch
  enterpriseName: string
  activeTab?: HealthExaminationBatchTabType
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function HealthExaminationBatchHeader({
  batch,
  enterpriseName,
  activeTab = "employees",
  onImportClick,
  onDownloadTemplateClick,
}: HealthExaminationBatchHeaderProps) {
  const subtitle =
    activeTab === "examination"
      ? "Theo dõi nhân sự đã khám các hạng mục nào"
      : activeTab === "report"
      ? "Báo cáo tổng hợp đợt khám"
      : "Danh sách nhân viên tham gia đợt khám"

  return (
    <PageHeader
      breadcrumbs={[
        { label: "Doanh nghiệp", href: "/enterprises" },
        {
          label: enterpriseName,
          href: `/enterprises/${batch.enterpriseId}`,
        },
        { label: "Đợt khám" },
        { label: batch.name },
      ]}
      title={batch.name}
      description={subtitle}
      actions={
        activeTab === "employees" ? (
          <>
            <Button
              type="button"
              onClick={onImportClick}
            >
              <Upload className="size-4" />
              Import nhân sự
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDownloadTemplateClick}
            >
              <Download className="size-4" />
              Tải file mẫu
            </Button>
          </>
        ) : undefined
      }
    />
  )
}
