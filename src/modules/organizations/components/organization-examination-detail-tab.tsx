"use client"

import * as React from "react"
import {
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  Check,
  Clock,
  CalendarDays,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { DataTablePagination } from "@/shared/ui"
import {
  useOrganizationHealthExaminationBatches,
  useHealthExaminationBatchMatrix,
  type ParticipantExaminationProgress,
  type HealthExaminationBatch,
} from "@/modules/health-examinations"
import { ParticipantExaminationDetailDrawer } from "./participant-examination-detail-drawer"

interface OrganizationExaminationDetailTabProps {
  organizationId: string
  onCreateBatchClick?: () => void
}

export function OrganizationExaminationDetailTab({
  organizationId,
  onCreateBatchClick,
}: OrganizationExaminationDetailTabProps) {
  // 1. Fetch batches of this organization
  const {
    data: batchesResponse,
    isLoading: isLoadingBatches,
    isError: isErrorBatches,
    refetch: refetchBatches,
  } = useOrganizationHealthExaminationBatches(organizationId)

  const batches = React.useMemo(() => batchesResponse?.data || [], [batchesResponse?.data])

  // 2. Determine default batch (IN_PROGRESS first, or first batch)
  const defaultBatch = React.useMemo(() => {
    if (batches.length === 0) return null
    const inProgressBatch = batches.find((b) => b.status === "IN_PROGRESS")
    return inProgressBatch || batches[0]
  }, [batches])

  const [selectedBatchId, setSelectedBatchId] = React.useState<string>("")
  const effectiveBatchId = selectedBatchId || defaultBatch?.id || ""

  const activeBatch: HealthExaminationBatch | undefined = React.useMemo(() => {
    return batches.find((b) => b.id === effectiveBatchId) || defaultBatch || undefined
  }, [batches, effectiveBatchId, defaultBatch])

  // 3. Filter states
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [department, setDepartment] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [uncompletedOnly, setUncompletedOnly] = React.useState(false)
  const [page, setPage] = React.useState(1)

  // Drawer state
  const [selectedParticipant, setSelectedParticipant] =
    React.useState<ParticipantExaminationProgress | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // 4. Fetch examination matrix for the selected batch
  const effectiveStatus = uncompletedOnly
    ? "IN_PROGRESS"
    : statusFilter

  const {
    data: matrixData,
    isLoading: isLoadingMatrix,
    isError: isErrorMatrix,
  } = useHealthExaminationBatchMatrix(effectiveBatchId, {
    search: debouncedSearch,
    organizationUnit: department,
    examStatus: effectiveStatus,
    page,
    pageSize: 10,
  })

  // Full matrix query without filters for summary counts
  const { data: fullMatrixData } = useHealthExaminationBatchMatrix(
    effectiveBatchId,
    {
      page: 1,
      pageSize: 500,
    }
  )

  const services = matrixData?.services || []
  let items = matrixData?.data || []

  if (uncompletedOnly) {
    items = items.filter((i) => i.examStatus !== "COMPLETED")
  }

  const totalItems = matrixData?.total || 0
  const totalPages = matrixData?.totalPages || 1

  // Summary counts
  const allRows = React.useMemo(() => fullMatrixData?.data || [], [fullMatrixData?.data])
  const summaryCounts = React.useMemo(() => {
    const total = allRows.length
    const completed = allRows.filter((r) => r.examStatus === "COMPLETED").length
    const inProgress = allRows.filter((r) => r.examStatus === "IN_PROGRESS").length
    const notStarted = allRows.filter((r) => r.examStatus === "NOT_STARTED").length
    const arrived = total - notStarted

    return {
      total,
      arrived,
      inProgress,
      completed,
      notStarted,
    }
  }, [allRows])

  // Unique departments for filter
  const departments = React.useMemo(() => {
    const depts = new Set<string>()
    allRows.forEach((r) => {
      if (r.organizationUnit) {
        depts.add(r.organizationUnit)
      }
    })
    return Array.from(depts)
  }, [allRows])

  const handleRowClick = (participant: ParticipantExaminationProgress) => {
    setSelectedParticipant(participant)
    setIsDrawerOpen(true)
  }

  // -------------------------------------------------------------------------
  // Render: Loading state for batches
  // -------------------------------------------------------------------------
  if (isLoadingBatches) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-card border border-border p-3 animate-pulse" />
          ))}
        </div>
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
          Không thể tải danh sách đợt khám.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Đã xảy ra lỗi khi kết nối dữ liệu đợt khám của đơn vị.
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
  // Render: Empty state if organization has no batches
  // -------------------------------------------------------------------------
  if (batches.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center space-y-4">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <CalendarDays className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Chưa có đợt khám nào
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Đơn vị này chưa có đợt khám sức khỏe nào được cấu hình. Hãy tạo đợt khám đầu tiên để bắt đầu theo dõi tiến độ khám.
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

  return (
    <div className="space-y-5">
      {/* 1. Batch Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <Label htmlFor="batch-select" className="text-xs font-semibold text-foreground whitespace-nowrap">
            Đợt khám:
          </Label>
          <div className="w-64 sm:w-80">
            <Select
              value={selectedBatchId || activeBatch?.id}
              onValueChange={(val) => {
                if (val) {
                  setSelectedBatchId(val)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger id="batch-select" className="h-9 text-xs border-border bg-background w-full">
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

        {activeBatch && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Ngày khám: <strong className="text-foreground">{activeBatch.examDate}</strong></span>
            <span>•</span>
            <span>Địa điểm: <strong className="text-foreground">{activeBatch.location}</strong></span>
          </div>
        )}
      </div>

      {/* 2. Operational Summary Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg border border-border bg-card space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block">Tổng số người</span>
          <span className="text-lg font-bold text-foreground block">{summaryCounts.total}</span>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block">Đã tiếp nhận</span>
          <span className="text-lg font-bold text-primary block">{summaryCounts.arrived}</span>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block">Đang khám</span>
          <span className="text-lg font-bold text-status-in-progress block">{summaryCounts.inProgress}</span>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block">Hoàn thành</span>
          <span className="text-lg font-bold text-status-completed block">{summaryCounts.completed}</span>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block">Chưa đến</span>
          <span className="text-lg font-bold text-muted-foreground block">{summaryCounts.notStarted}</span>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, CCCD, mã người khám..."
            className="h-9 w-full rounded-lg border-border bg-card pl-9 pr-4 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="w-40 sm:w-44">
            <Select
              value={department}
              onValueChange={(val) => {
                setDepartment(val ?? "ALL")
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Đơn vị / Phòng ban" className="h-9 text-xs border-border bg-card">
                <SelectValue placeholder="Tất cả phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả phòng ban</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-xs">{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-36 sm:w-40">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val ?? "ALL")
                setPage(1)
              }}
              disabled={uncompletedOnly}
            >
              <SelectTrigger aria-label="Trạng thái khám" className="h-9 text-xs border-border bg-card">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả trạng thái</SelectItem>
                <SelectItem value="NOT_STARTED" className="text-xs">Chưa đến</SelectItem>
                <SelectItem value="IN_PROGRESS" className="text-xs">Đang khám</SelectItem>
                <SelectItem value="COMPLETED" className="text-xs">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle uncompleted only */}
          <div className="flex items-center space-x-2 bg-card border border-border px-3 py-2 rounded-lg h-9">
            <Checkbox
              id="uncompleted-only"
              checked={uncompletedOnly}
              onCheckedChange={(checked) => {
                setUncompletedOnly(Boolean(checked))
                setPage(1)
              }}
            />
            <Label htmlFor="uncompleted-only" className="text-xs font-medium text-foreground cursor-pointer select-none">
              Chưa hoàn thành
            </Label>
          </div>
        </div>
      </div>

      {/* 4. Patient-Centric Main Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border">
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
                Người khám
              </TableHead>
              <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-24">
                Tiếp nhận
              </TableHead>
              <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-24">
                Khám BS
              </TableHead>
              <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-28">
                Dịch vụ
              </TableHead>
              <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-24">
                Kết luận
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-center w-32">
                Trạng thái
              </TableHead>
              <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center w-20">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMatrix ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="border-b border-border/60">
                  <TableCell className="px-4 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="px-3 py-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                  <TableCell className="px-3 py-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                  <TableCell className="px-3 py-3 text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="px-3 py-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                  <TableCell className="px-4 py-3 text-center"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                  <TableCell className="px-3 py-3 text-center"><Skeleton className="size-7 rounded-md mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : isErrorMatrix ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-xs text-destructive">
                  Đã xảy ra lỗi khi tải danh sách người khám. Vui lòng thử lại.
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Không tìm thấy người khám nào phù hợp</p>
                  <p>Vui lòng thử điều chỉnh lại từ khóa tìm kiếm hoặc bộ lọc.</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => {
                const isRowCompleted = row.examStatus === "COMPLETED"
                const isRowInProgress = row.examStatus === "IN_PROGRESS"
                const isRowNotStarted = row.examStatus === "NOT_STARTED"

                const completedCount = row.completedServiceIds.length
                const totalCount = services.length

                return (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="border-b border-border/60 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    {/* Người khám */}
                    <TableCell className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-foreground block">
                          {row.fullName}
                        </span>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          <span>{row.participantCode || "—"}</span>
                          <span>•</span>
                          <span>CCCD: {row.identificationNumber || "—"}</span>
                          {row.organizationUnit && (
                            <>
                              <span>•</span>
                              <span>{row.organizationUnit}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Tiếp nhận */}
                    <TableCell className="px-3 py-3 text-center">
                      {!isRowNotStarted ? (
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-status-completed-bg text-status-completed mx-auto">
                          <Check className="size-3" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Khám BS */}
                    <TableCell className="px-3 py-3 text-center">
                      {isRowCompleted || isRowInProgress ? (
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-status-completed-bg text-status-completed mx-auto">
                          <Check className="size-3" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Dịch vụ */}
                    <TableCell className="px-3 py-3 text-center font-medium text-xs">
                      {totalCount > 0 ? (
                        <span className={completedCount === totalCount ? "text-status-completed font-semibold" : "text-foreground"}>
                          {completedCount}/{totalCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Kết luận */}
                    <TableCell className="px-3 py-3 text-center text-xs">
                      {isRowCompleted ? (
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-status-completed-bg text-status-completed mx-auto">
                          <Check className="size-3" />
                        </span>
                      ) : isRowInProgress ? (
                        <span className="text-[11px] font-medium text-status-in-progress">
                          Chờ
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="px-4 py-3 text-center">
                      {isRowCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-status-completed-bg px-2.5 py-0.5 text-[11px] font-medium text-status-completed">
                          <Check className="size-3" />
                          Hoàn thành
                        </span>
                      ) : isRowInProgress ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-status-in-progress-bg px-2.5 py-0.5 text-[11px] font-medium text-status-in-progress">
                          <Clock className="size-3" />
                          Đang khám
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Chưa đến
                        </span>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRowClick(row)}
                        className="size-7 p-0 cursor-pointer hover:bg-muted"
                        title="Xem chi tiết"
                      >
                        <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Xem chi tiết</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 5. Pagination */}
      {!isLoadingMatrix && !isErrorMatrix && totalItems > 0 && (
        <DataTablePagination
          currentPage={page}
          pageSize={10}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          entityName="người khám"
        />
      )}

      {/* 6. Participant Examination Detail Drawer */}
      <ParticipantExaminationDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        participant={selectedParticipant}
        batchName={activeBatch?.name}
        batchExamDate={activeBatch?.examDate}
        services={services}
      />
    </div>
  )
}
