"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, FileQuestion } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportHeader } from "./report-header"
import { ExaminationSummaryTable } from "./examination-summary-table"
import { CalculationExample, pickCalculationExample } from "./calculation-example"
import {
  useExportExaminationDetails,
  useExportPaymentSummaryDocx,
  usePaymentSummaryReport,
} from "../../hooks/use-examination-details"

export interface ReportTabProps {
  organizationId: string
  batchId: string
  /** UX only: the backend decides. Shows the Excel export of the examination details when true. */
  canExportDetails?: boolean
}

export function ReportTab({ organizationId, batchId, canExportDetails = false }: ReportTabProps) {
  const { data, isLoading, isError, error, refetch } = usePaymentSummaryReport(
    organizationId,
    batchId
  )
  const exportWord = useExportPaymentSummaryDocx(organizationId, batchId)
  const exportDetails = useExportExaminationDetails(organizationId, batchId)

  const actions = {
    onExportWord: () => exportWord.mutate(),
    onExportDetails: canExportDetails ? () => exportDetails.mutate() : undefined,
    isExportingWord: exportWord.isPending,
    isExportingDetails: exportDetails.isPending,
  }
  const exportError = exportWord.error ?? exportDetails.error

  if (isError) {
    return (
      <Card className="overflow-hidden rounded-lg border border-border bg-card">
        <ReportHeader {...actions} disabled />
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Không thể tải báo cáo.</h3>
            <p role="alert" className="text-xs text-muted-foreground">
              {error instanceof Error && error.message
                ? error.message
                : "Đã xảy ra lỗi khi tổng hợp dữ liệu khám. Vui lòng thử lại."}
            </p>
          </div>
          <Button size="sm" onClick={() => void refetch()} className="h-9 cursor-pointer text-xs">
            <RefreshCw className="mr-1.5 size-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card className="overflow-hidden rounded-lg border border-border bg-card">
        <ReportHeader {...actions} disabled />
        <CardContent className="space-y-4 p-5">
          <ExaminationSummaryTable items={[]} totalAmount={0} isLoading />
        </CardContent>
      </Card>
    )
  }

  if (data.items.length === 0) {
    return (
      <Card className="overflow-hidden rounded-lg border border-border bg-card">
        <ReportHeader {...actions} provisional={data.provisional} disabled />
        <CardContent className="space-y-3 p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestion className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Chưa có dữ liệu khám để tổng hợp.
            </h3>
            <p className="mx-auto max-w-sm text-xs text-muted-foreground">
              Đợt khám chưa có hạng mục khám nào để tạo báo cáo thanh toán.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-lg border border-border bg-card">
      <ReportHeader {...actions} provisional={data.provisional} />

      <CardContent className="space-y-4 p-5">
        <p className="text-xs text-muted-foreground">
          Đăng ký <strong className="text-foreground">{data.registeredCount}</strong> người · Đã đến{" "}
          <strong className="text-foreground">{data.attendedCount}</strong> người · Đã đối soát{" "}
          <strong className="text-foreground">{data.reconciledCount}</strong> người
        </p>
        {data.provisional && (
          <p role="status" className="text-xs text-status-warning">
            Số liệu tạm tính: đợt khám chưa chốt nên số người khám và thành tiền có thể còn thay đổi.
          </p>
        )}
        {exportError && (
          <p role="alert" className="text-xs text-destructive">
            {exportError.message || "Không thể xuất file."}
          </p>
        )}
        <ExaminationSummaryTable items={data.items} totalAmount={data.totalAmount} />
        <CalculationExample item={pickCalculationExample(data.items)} />
      </CardContent>
    </Card>
  )
}
