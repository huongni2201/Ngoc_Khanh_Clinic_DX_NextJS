"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, FileQuestion } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportHeader } from "./report-header"
import { ExaminationSummaryTable } from "./examination-summary-table"
import { CalculationExample } from "./calculation-example"
import {
  useHealthExaminationBatchReport,
  useExportExamDetail,
  useExportExamSummary,
} from "../../hooks/use-health-examination-batches"

export interface ReportTabProps {
  batchId: string
  batchName: string
}

export function ReportTab({ batchId, batchName }: ReportTabProps) {
  const { data, isLoading, isError, refetch } = useHealthExaminationBatchReport(batchId)
  const exportDetailMutation = useExportExamDetail()
  const exportSummaryMutation = useExportExamSummary()

  const handleExportDetailHorizontal = () => {
    exportDetailMutation.mutate({ batchId, batchName })
  }

  const handleExportSummaryVertical = () => {
    exportSummaryMutation.mutate({ batchId, batchName })
  }

  const items = data?.items || []
  const totalAmount = data?.totalAmount || 0
  const isEmpty = !isLoading && !isError && items.length === 0

  // 1. Error state (does not break page header or layout)
  if (isError) {
    return (
      <Card className="rounded-lg border border-border bg-card  overflow-hidden">
        <ReportHeader
          onExportDetailHorizontal={handleExportDetailHorizontal}
          onExportSummaryVertical={handleExportSummaryVertical}
          disabled={true}
        />
        <CardContent className="p-8 text-center space-y-4">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Không thể tải báo cáo.
            </h3>
            <p className="text-xs text-muted-foreground">
              Đã xảy ra lỗi khi tổng hợp dữ liệu khám. Vui lòng kiểm tra lại kết nối.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-9  cursor-pointer"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  // 2. Loading state
  if (isLoading) {
    return (
      <Card className="rounded-lg border border-border bg-card  overflow-hidden">
        <ReportHeader
          onExportDetailHorizontal={handleExportDetailHorizontal}
          onExportSummaryVertical={handleExportSummaryVertical}
          disabled={true}
        />
        <CardContent className="p-5 space-y-4">
          <ExaminationSummaryTable
            items={[]}
            totalAmount={0}
            isLoading={true}
          />
        </CardContent>
      </Card>
    )
  }

  // 3. Empty state
  if (isEmpty) {
    return (
      <Card className="rounded-lg border border-border bg-card  overflow-hidden">
        <ReportHeader
          onExportDetailHorizontal={handleExportDetailHorizontal}
          onExportSummaryVertical={handleExportSummaryVertical}
          disabled={true}
          disabledTooltip="Chưa có dữ liệu để xuất báo cáo."
        />
        <CardContent className="p-12 text-center space-y-3">
          <div className="size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <FileQuestion className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Chưa có dữ liệu khám để tổng hợp.
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Đợt khám chưa có dữ liệu khám thực tế hoàn thành để tạo báo cáo thanh toán.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 4. Normal populated state (matching reference image)
  return (
    <Card className="rounded-lg border border-border bg-card  overflow-hidden">
      {/* Card Header with Title and Export Actions */}
      <ReportHeader
        onExportDetailHorizontal={handleExportDetailHorizontal}
        onExportSummaryVertical={handleExportSummaryVertical}
        isExportingDetail={exportDetailMutation.isPending}
        isExportingSummary={exportSummaryMutation.isPending}
      />

      {/* Card Content with Table and Info Box */}
      <CardContent className="p-5 space-y-4">
        <ExaminationSummaryTable
          items={items}
          totalAmount={totalAmount}
        />
        <CalculationExample />
      </CardContent>
    </Card>
  )
}
