"use client"

import * as React from "react"
import { Upload, Download } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"
import { HealthExaminationBatch } from "../types"
import { HealthExaminationBatchTabType } from "./health-examination-batch-tabs"

interface HealthExaminationBatchHeaderProps {
  batch: HealthExaminationBatch
  organizationName: string
  activeTab?: HealthExaminationBatchTabType
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function HealthExaminationBatchHeader({
  batch,
  organizationName,
  activeTab = "participants",
  onImportClick,
  onDownloadTemplateClick,
}: HealthExaminationBatchHeaderProps) {
  const subtitle =
    activeTab === "examination"
      ? "Theo dõi người khám đã thực hiện các dịch vụ nào"
      : activeTab === "report"
      ? "Báo cáo tổng hợp đợt khám"
      : "Danh sách người khám tham gia đợt khám"

  return (
    <PageHeader
      breadcrumbs={[
        { label: "Đơn vị", href: "/organizations" },
        {
          label: organizationName,
          href: `/organizations/${batch.organizationId}`,
        },
        { label: "Đợt khám" },
        { label: batch.name },
      ]}
      title={batch.name}
      description={subtitle}
      actions={
        activeTab === "participants" ? (
          <>
            <Button
              type="button"
              onClick={onImportClick}
            >
              <Upload className="size-4" />
              Import người khám
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


