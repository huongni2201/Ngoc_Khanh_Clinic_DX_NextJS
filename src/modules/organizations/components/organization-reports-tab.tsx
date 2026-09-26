"use client"

import * as React from "react"
import {
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Download,
  CalendarDays,
  Check,
  Info,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useOrganizationHealthExaminationBatches,
  useHealthExaminationBatchReport,
  useHealthExaminationBatchMatrix,
  useExportExamDetail,
  useExportExamSummary,
  type HealthExaminationBatch,
} from "@/modules/health-examinations"
import { formatVND } from "@/shared/ui/money-input"

interface OrganizationReportsTabProps {
  organizationId: string
  organizationCode?: string
  organizationName?: string
  onCreateBatchClick?: () => void
}

type ReportType = "SERVICE_SUMMARY" | "PARTICIPANT_MATRIX"

export function OrganizationReportsTab({
  organizationId,
  organizationCode = "ORG",
  organizationName = "Đơn vị",
  onCreateBatchClick,
}: OrganizationReportsTabProps) {
  // 1. Fetch batches
  const {
    data: batchesResponse,
    isLoading: isLoadingBatches,
    isError: isErrorBatches,
    refetch: refetchBatches,
  } = useOrganizationHealthExaminationBatches(organizationId)

  const batches = React.useMemo(() => batchesResponse?.data || [], [batchesResponse?.data])

  // 2. Select default batch (IN_PROGRESS first or latest)
  const defaultBatch = React.useMemo(() => {
    if (batches.length === 0) return null
    const inProgressBatch = batches.find((b) => b.status === "IN_PROGRESS")
    return inProgressBatch || batches[0]
  }, [batches])

  const [selectedBatchId, setSelectedBatchId] = React.useState<string>("")
  const [reportType, setReportType] = React.useState<ReportType>("SERVICE_SUMMARY")

  const effectiveBatchId = selectedBatchId || defaultBatch?.id || ""

  const activeBatch: HealthExaminationBatch | undefined = React.useMemo(() => {
    return batches.find((b) => b.id === effectiveBatchId) || defaultBatch || undefined
  }, [batches, effectiveBatchId, defaultBatch])

  // 3. Fetch Service Summary Report (Type B)
  const {
    data: reportData,
    isLoading: isLoadingReport,
    isError: isErrorReport,
    refetch: refetchReport,
  } = useHealthExaminationBatchReport(effectiveBatchId)

  // 4. Fetch Participant Matrix (Type A)
  const {
    data: matrixData,
    isLoading: isLoadingMatrix,
    isError: isErrorMatrix,
    refetch: refetchMatrix,
  } = useHealthExaminationBatchMatrix(effectiveBatchId, {
    page: 1,
    pageSize: 50,
  })

  // 5. Export Mutations
  const exportDetailMutation = useExportExamDetail()
  const exportSummaryMutation = useExportExamSummary()

  const handleExportDetailHorizontal = () => {
    if (!activeBatch) return
    const customBatchName = `${organizationCode}_${activeBatch.name}_participant-report`
    exportDetailMutation.mutate({
      batchId: activeBatch.id,
      batchName: customBatchName,
    })
  }

  const handleExportSummaryVertical = () => {
    if (!activeBatch) return
    const customBatchName = `${organizationCode}_${activeBatch.name}_service-summary`
    exportSummaryMutation.mutate({
      batchId: activeBatch.id,
      batchName: customBatchName,
    })
  }

  // Current timestamp for the report
  const now = new Date()
  const formattedDateTime = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`

  const reportItems = reportData?.items || []
  const totalAmount = reportData?.totalAmount || 0

  const matrixServices = matrixData?.services || []
  const matrixParticipants = matrixData?.data || []

  // -------------------------------------------------------------------------
  // Render: Loading state for batches
  // -------------------------------------------------------------------------
  if (isLoadingBatches) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-lg bg-card border border-border p-4 animate-pulse" />
        <div className="h-64 rounded-lg bg-card border border-border p-4 animate-pulse" />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render: Error state
  // -------------------------------------------------------------------------
  if (isErrorBatches) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
        <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Không thể tải dữ liệu báo cáo đợt khám.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Đã xảy ra lỗi kết nối với máy chủ khi tải danh sách đợt khám của đơn vị.
        </p>
        <Button
          size="sm"
          onClick={() => refetchBatches()}
          className="text-xs h-8 cursor-pointer"
        >
          <RefreshCw className="size-3.5 mr-1.5" />
          Thử lại
        </Button>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render: Empty state if no batches
  // -------------------------------------------------------------------------
  if (batches.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center space-y-4">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <CalendarDays className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Chưa có đợt khám nào để tạo báo cáo
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Đơn vị này chưa có đợt khám nào. Báo cáo đối soát và chi phí sẽ được tổng hợp khi đợt khám được tạo và thực hiện.
          </p>
        </div>
        {onCreateBatchClick && (
          <Button size="sm" onClick={onCreateBatchClick} className="text-xs h-9 cursor-pointer">
            Tạo đợt khám mới
          </Button>
        )}
      </div>
    )
  }

  const isBatchInProgress = activeBatch?.status === "IN_PROGRESS"

  return (
    <div className="space-y-5">
      {/* 1. Batch Selector & Export Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="report-batch-select" className="text-xs font-semibold text-foreground whitespace-nowrap">
            Đợt khám:
          </Label>
          <div className="w-64 sm:w-80">
            <Select
              value={selectedBatchId || activeBatch?.id}
              onValueChange={(val) => {
                if (val) setSelectedBatchId(val)
              }}
            >
              <SelectTrigger id="report-batch-select" className="h-9 text-xs border-border bg-background w-full">
                <SelectValue placeholder="Chọn đợt khám...">
                  {activeBatch ? `${activeBatch.name} (${activeBatch.status === "IN_PROGRESS" ? "Đang khám" : "Đã xong"})` : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.name} ({b.status === "IN_PROGRESS" ? "Đang khám" : "Đã xong"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportDetailHorizontal}
            disabled={exportDetailMutation.isPending || !activeBatch}
            className="text-xs h-9 cursor-pointer border-border hover:bg-muted"
          >
            <Download className="size-3.5 mr-1.5" />
            {exportDetailMutation.isPending ? "Đang xuất..." : "Xuất Excel (Ngang)"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleExportSummaryVertical}
            disabled={exportSummaryMutation.isPending || !activeBatch}
            className="text-xs h-9 cursor-pointer"
          >
            <FileSpreadsheet className="size-3.5 mr-1.5" />
            {exportSummaryMutation.isPending ? "Đang xuất..." : "Xuất Excel (Dọc)"}
          </Button>
        </div>
      </div>

      {/* 2. Notice Banner & Disclaimer */}
      <div className="p-3.5 rounded-lg border border-border bg-surface-alt flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-foreground">
          <Info className="size-4 shrink-0 text-primary" />
          <span>
            {isBatchInProgress ? (
              <>
                <strong>Dữ liệu tạm tính</strong> đến {formattedDateTime}. Số liệu đối soát chính xác theo các dịch vụ thực tế đã chỉ định và hoàn thành.
              </>
            ) : (
              <>
                <strong>Dữ liệu quyết toán chính thức</strong> của đợt khám {activeBatch?.name}.
              </>
            )}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
          Đơn vị: {organizationName} ({organizationCode})
        </span>
      </div>

      {/* 3. Report View Switcher */}
      <div className="border-b border-border flex items-center gap-6">
        <button
          type="button"
          onClick={() => setReportType("SERVICE_SUMMARY")}
          className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            reportType === "SERVICE_SUMMARY"
              ? "border-primary text-primary"
              : "border-transparent text-secondary-foreground hover:text-foreground"
          }`}
        >
          Báo cáo theo dịch vụ & chi phí (Dọc)
        </button>

        <button
          type="button"
          onClick={() => setReportType("PARTICIPANT_MATRIX")}
          className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            reportType === "PARTICIPANT_MATRIX"
              ? "border-primary text-primary"
              : "border-transparent text-secondary-foreground hover:text-foreground"
          }`}
        >
          Báo cáo theo người khám (Ngang)
        </button>
      </div>

      {/* 4. Report Views */}
      {reportType === "SERVICE_SUMMARY" && (
        <div className="space-y-4">
          {/* Table B: Vertical Service Summary */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border">
                  <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-center w-14">
                    STT
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
                    Hạng mục dịch vụ
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-right w-36">
                    Số lượng thực tế
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-right w-44">
                    Đơn giá hợp đồng
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-right w-44">
                    Thành tiền
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingReport ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx} className="border-b border-border/60">
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell className="px-4 py-3 text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell className="px-4 py-3 text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : isErrorReport ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-xs text-destructive">
                      Đã xảy ra lỗi khi tổng hợp chi phí dịch vụ.
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => refetchReport()}
                        className="text-xs ml-2"
                      >
                        Thử lại
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : reportItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                      Chưa có dịch vụ nào phát sinh trong đợt khám này.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {reportItems.map((item, index) => (
                      <TableRow key={item.serviceId} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs font-medium text-foreground">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-xs text-foreground font-mono">
                          {item.examinedCount.toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                          {formatVND(item.unitPrice)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-xs font-semibold text-foreground font-mono">
                          {formatVND(item.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Total Row */}
                    <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
                      <TableCell colSpan={4} className="px-4 py-3.5 text-right text-xs text-foreground">
                        Tổng cộng chi phí thực tế:
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right text-sm text-primary font-mono">
                        {formatVND(totalAmount)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Formula notice */}
          <div className="text-[11px] text-muted-foreground italic px-1">
            * Nguyên tắc tính: Thành tiền = Số lượng thực tế đã chỉ định và thực hiện × Đơn giá hợp đồng theo đợt khám. Không nhân số người đăng ký với toàn bộ dịch vụ.
          </div>
        </div>
      )}

      {reportType === "PARTICIPANT_MATRIX" && (
        <div className="space-y-4">
          {/* Table A: Horizontal Participant Matrix */}
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border">
                  <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-12">
                    STT
                  </TableHead>
                  <TableHead className="h-10 px-3 text-xs font-semibold text-foreground w-24">
                    Mã NK
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-semibold text-foreground min-w-36">
                    Họ tên
                  </TableHead>
                  <TableHead className="h-10 px-3 text-xs font-semibold text-foreground min-w-32">
                    Đơn vị công tác
                  </TableHead>
                  {matrixServices.map((svc) => (
                    <TableHead
                      key={svc.id}
                      className="h-10 px-2 text-xs font-semibold text-foreground text-center min-w-24 whitespace-nowrap"
                    >
                      {svc.name}
                    </TableHead>
                  ))}
                  <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-28">
                    Kết luận
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMatrix ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx} className="border-b border-border/60">
                      <TableCell className="px-3 py-3 text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell className="px-3 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="px-3 py-3"><Skeleton className="h-4 w-24" /></TableCell>
                      {matrixServices.map((s) => (
                        <TableCell key={s.id} className="px-2 py-3 text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      ))}
                      <TableCell className="px-3 py-3 text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : isErrorMatrix ? (
                  <TableRow>
                    <TableCell colSpan={matrixServices.length + 5} className="py-8 text-center text-xs text-destructive">
                      Đã xảy ra lỗi khi tải ma trận người khám.
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => refetchMatrix()}
                        className="text-xs ml-2"
                      >
                        Thử lại
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : matrixParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={matrixServices.length + 5} className="py-8 text-center text-xs text-muted-foreground">
                      Chưa có dữ liệu người khám cho đợt này.
                    </TableCell>
                  </TableRow>
                ) : (
                  matrixParticipants.map((p, index) => {
                    const isDone = p.examStatus === "COMPLETED"

                    return (
                      <TableRow key={p.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="px-3 py-2.5 text-center text-xs text-muted-foreground font-mono">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-xs font-mono text-muted-foreground">
                          {p.participantCode || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-xs font-medium text-foreground whitespace-nowrap">
                          {p.fullName}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {p.organizationUnit || "—"}
                        </TableCell>
                        {matrixServices.map((svc) => {
                          const isServiceDone = p.completedServiceIds.includes(svc.id)
                          return (
                            <TableCell key={svc.id} className="px-2 py-2.5 text-center">
                              {isServiceDone ? (
                                <span className="inline-flex items-center justify-center size-4 rounded-full bg-status-completed-bg text-status-completed mx-auto">
                                  <Check className="size-2.5" />
                                </span>
                              ) : (
                                <span className="text-muted-foreground/40 text-xs">—</span>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell className="px-3 py-2.5 text-center text-xs">
                          {isDone ? (
                            <span className="text-[11px] font-medium text-status-completed">
                              Đã kết luận
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Chờ
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-[11px] text-muted-foreground italic px-1">
            * Báo cáo ngang phản ánh dịch vụ thực tế từng người khám đã thực hiện. Đánh dấu (✓) là dịch vụ đã hoàn thành.
          </div>
        </div>
      )}
    </div>
  )
}
