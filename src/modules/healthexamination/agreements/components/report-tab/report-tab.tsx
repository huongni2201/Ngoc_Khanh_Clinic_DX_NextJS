"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, FileQuestion } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
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
  agreementId: string
  /** UX only: the backend decides. Shows the Excel export of the examination details when true. */
  canExportDetails?: boolean
}

/** Date range inputs of the report: empty means the whole agreement. */
function RangeFilter({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}) {
  const reversed = Boolean(from && to && from > to)
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">
        Từ ngày khám
        <Input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onChange({ from: event.target.value, to })}
          aria-label="Báo cáo từ ngày"
          className="h-9 text-xs"
        />
      </label>
      <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">
        Đến ngày khám
        <Input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onChange({ from, to: event.target.value })}
          aria-label="Báo cáo đến ngày"
          className="h-9 text-xs"
        />
      </label>
      {(from || to) && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ from: "", to: "" })}>
          Xóa khoảng ngày
        </Button>
      )}
      {reversed && (
        <p role="alert" className="text-xs text-destructive">
          Ngày bắt đầu không được sau ngày kết thúc.
        </p>
      )}
    </div>
  )
}

export function ReportTab({ organizationId, agreementId, canExportDetails = false }: ReportTabProps) {
  const [range, setRange] = React.useState({ from: "", to: "" })
  // A reversed range is rejected by the backend, so nothing is requested until it is corrected.
  const reversed = Boolean(range.from && range.to && range.from > range.to)
  const rangeParams = React.useMemo(
    () => ({ from: range.from || undefined, to: range.to || undefined }),
    [range]
  )
  const { data, isLoading, isError, error, refetch } = usePaymentSummaryReport(
    organizationId,
    agreementId,
    { enabled: !reversed },
    rangeParams
  )
  const exportWord = useExportPaymentSummaryDocx(organizationId, agreementId, rangeParams)
  const exportDetails = useExportExaminationDetails(organizationId, agreementId)

  const actions = {
    onExportWord: () => !reversed && exportWord.mutate(),
    onExportDetails: canExportDetails ? () => exportDetails.mutate() : undefined,
    isExportingWord: exportWord.isPending,
    isExportingDetails: exportDetails.isPending,
  }

  const filter = <RangeFilter from={range.from} to={range.to} onChange={setRange} />

  if (isError) {
    return (
      <div className="space-y-4">
        {filter}
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
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {filter}
      <Card className="overflow-hidden rounded-lg border border-border bg-card">
        <ReportHeader {...actions} disabled />
        <CardContent className="space-y-4 p-5">
          <ExaminationSummaryTable items={[]} totalAmount={0} isLoading />
        </CardContent>
      </Card>
      </div>
    )
  }

  if (data.items.length === 0) {
    return (
      <div className="space-y-4">
        {filter}
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
              Thỏa thuận chưa có hạng mục khám nào để tạo báo cáo thanh toán.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filter}
    <Card className="overflow-hidden rounded-lg border border-border bg-card">
      <ReportHeader {...actions} provisional={data.provisional} />

      <CardContent className="space-y-4 p-5">
        <p className="text-xs text-muted-foreground">
          Đăng ký <strong className="text-foreground">{data.registeredCount}</strong> người · Đã đến{" "}
          <strong className="text-foreground">{data.attendedCount}</strong> người · Đã đối soát{" "}
          <strong className="text-foreground">{data.reconciledCount}</strong> người
          {" · "}
          <strong className="text-foreground">{data.sessionCount}</strong> lịch khám ·{" "}
          <strong className="text-foreground">{data.visitCount}</strong> lượt đến
        </p>
        {data.provisional && (
          <p role="status" className="text-xs text-status-warning">
            Số liệu tạm tính: thỏa thuận chưa kết thúc nên số người khám và thành tiền có thể còn thay đổi.
          </p>
        )}
        <ExaminationSummaryTable items={data.items} totalAmount={data.totalAmount} />
        <CalculationExample item={pickCalculationExample(data.items)} />
      </CardContent>
    </Card>
    </div>
  )
}
