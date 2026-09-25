import * as React from "react"
import {
  Info,
  Eye,
  ClipboardList,
  MoreHorizontal,
  ChevronDown,
  Printer,
  CalendarPlus,
  DoorOpen,
  Stethoscope,
  RefreshCw,
} from "@/shared/ui/product-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTablePagination } from "@/shared/ui"
import { DoctorStatusBadge } from "./doctor-status-badge"
import { DoctorEncounter } from "../types"
import { cn } from "@/lib/utils"

interface DoctorEncounterTableProps {
  encounters: DoctorEncounter[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  sortDirection: "asc" | "desc"
  onToggleSort: () => void
  onOpenEncounter: (encounter: DoctorEncounter) => void
  onQuickView: (encounter: DoctorEncounter) => void
  onViewOrders: (encounter: DoctorEncounter) => void
  onResetFilters?: () => void
}

export function DoctorEncounterTable({
  encounters,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  isLoading,
  sortDirection,
  onToggleSort,
  onOpenEncounter,
  onQuickView,
  onViewOrders,
  onResetFilters,
}: DoctorEncounterTableProps) {
  return (
    <TooltipProvider delay={200}>
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden flex flex-col">
        {/* Main Section Header */}
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Danh sách lượt khám hôm nay
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Ưu tiên bệnh nhân đến trước, có thể sắp xếp lại theo mức độ ưu tiên lâm sàng.
            </span>
          </div>
        </div>

        {/* Operational Table Container */}
        <div className="overflow-x-auto min-w-full">
          <Table className="table-fixed min-w-[1080px] w-full">
            <colgroup>
              <col className="w-[40px]" />
              <col className="w-[110px]" />
              <col className="w-[145px]" />
              <col className="w-[95px]" />
              <col className="w-[95px]" />
              <col className="w-[105px]" />
              <col className="w-[135px]" />
              <col className="w-[110px]" />
              <col className="w-[110px]" />
              <col className="w-[170px]" />
            </colgroup>
            <TableHeader className="bg-table-header-bg/60 sticky top-0 z-10 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] px-2 text-center text-xs font-semibold text-table-header-fg tracking-tight">
                  STT
                </TableHead>
                <TableHead className="w-[110px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Mã lượt khám
                </TableHead>
                <TableHead className="w-[145px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Bệnh nhân
                </TableHead>
                <TableHead className="w-[95px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Năm sinh / GT
                </TableHead>
                <TableHead className="w-[95px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  <button
                    type="button"
                    onClick={onToggleSort}
                    className="group inline-flex items-center gap-1 hover:text-foreground font-semibold cursor-pointer transition-colors focus-visible:outline-hidden"
                    title={`Sắp xếp theo giờ tiếp nhận (${sortDirection === "asc" ? "tăng dần" : "giảm dần"})`}
                  >
                    <span>Giờ tiếp nhận</span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        sortDirection === "desc" && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </TableHead>
                <TableHead className="w-[105px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Phòng khám
                </TableHead>
                <TableHead className="w-[135px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Lý do khám
                </TableHead>
                <TableHead className="w-[110px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Chỉ định
                </TableHead>
                <TableHead className="w-[110px] px-2 text-xs font-semibold text-table-header-fg tracking-tight">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[170px] px-2 pr-4 text-right text-xs font-semibold text-table-header-fg tracking-tight">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="h-12 border-b border-border/60">
                    <TableCell colSpan={10} className="py-3 px-4">
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : encounters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                        <Info className="size-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Không tìm thấy lượt khám phù hợp
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vui lòng thử điều chỉnh lại từ khóa tìm kiếm hoặc các điều kiện lọc.
                      </p>
                      {onResetFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onResetFilters}
                          className="mt-4 text-xs h-8 border-border"
                        >
                          <RefreshCw className="size-3 mr-1.5" />
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                encounters.map((encounter) => (
                  <TableRow
                    key={encounter.id}
                    className="h-12 transition-colors hover:bg-hover/40 border-b border-border/70"
                  >
                    {/* STT */}
                    <TableCell className="w-[40px] px-2 text-center font-mono text-xs text-muted-foreground">
                      {encounter.stt}
                    </TableCell>

                    {/* Mã lượt khám */}
                    <TableCell className="w-[110px] px-2 font-mono text-xs font-medium text-foreground whitespace-nowrap">
                      {encounter.encounterCode}
                    </TableCell>

                    {/* Bệnh nhân */}
                    <TableCell className="w-[145px] px-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs sm:text-sm text-foreground">
                          {encounter.patientName}
                        </span>
                        {encounter.phoneNumber && (
                          <span className="text-[11px] text-muted-foreground lg:hidden">
                            {encounter.phoneNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Năm sinh / Giới tính */}
                    <TableCell className="w-[95px] px-2 text-xs text-secondary-foreground whitespace-nowrap">
                      {encounter.birthYear} / {encounter.gender}
                    </TableCell>

                    {/* Giờ tiếp nhận */}
                    <TableCell className="w-[95px] px-2 font-mono text-xs text-foreground font-medium whitespace-nowrap">
                      {encounter.checkinTime}
                    </TableCell>

                    {/* Phòng khám */}
                    <TableCell className="w-[105px] px-2 text-xs text-foreground font-medium">
                      {encounter.roomName}
                    </TableCell>

                    {/* Lý do khám */}
                    <TableCell className="min-w-[130px] max-w-[170px] px-2 text-xs text-secondary-foreground truncate" title={encounter.chiefComplaint}>
                      {encounter.chiefComplaint}
                    </TableCell>

                    {/* Hạng mục đã chỉ định */}
                    <TableCell className="w-[115px] px-2 text-xs text-secondary-foreground font-medium whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-secondary-foreground">
                        {encounter.prescribedItemsCount} hạng mục
                      </span>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="w-[115px] px-2 whitespace-nowrap">
                      <DoctorStatusBadge status={encounter.status} />
                    </TableCell>

                    {/* Hành động */}
                    <TableCell className="w-[175px] min-w-[175px] px-2 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Phiếu chỉ định icon button */}
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            onClick={() => onViewOrders(encounter)}
                            className="size-7 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt rounded-lg cursor-pointer inline-flex items-center justify-center transition-colors"
                            aria-label={`Xem phiếu chỉ định của ${encounter.patientName}`}
                          >
                            <ClipboardList className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Phiếu chỉ định & CLS</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Xem nhanh icon button */}
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            onClick={() => onQuickView(encounter)}
                            className="size-7 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt rounded-lg cursor-pointer inline-flex items-center justify-center transition-colors"
                            aria-label={`Xem nhanh thông tin ${encounter.patientName}`}
                          >
                            <Eye className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Xem nhanh thông tin</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Mở hồ sơ text button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenEncounter(encounter)}
                          className="h-7 px-1.5 text-xs font-semibold text-primary hover:text-primary hover:bg-selected rounded-md cursor-pointer shrink-0"
                        >
                          Mở hồ sơ
                        </Button>

                        {/* More menu ⋮ */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            type="button"
                            className="size-7 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt rounded-lg cursor-pointer inline-flex items-center justify-center transition-colors focus-visible:outline-hidden"
                            aria-label="Thao tác khác"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => onOpenEncounter(encounter)}
                              className="cursor-pointer text-xs"
                            >
                              <Stethoscope className="size-3.5 mr-2 text-primary" />
                              <span>Bắt đầu / Khám bệnh</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onViewOrders(encounter)}
                              className="cursor-pointer text-xs"
                            >
                              <ClipboardList className="size-3.5 mr-2 text-secondary-foreground" />
                              <span>Chỉ định cận lâm sàng</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onQuickView(encounter)}
                              className="cursor-pointer text-xs"
                            >
                              <DoorOpen className="size-3.5 mr-2 text-secondary-foreground" />
                              <span>Chuyển phòng khám</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onQuickView(encounter)}
                              className="cursor-pointer text-xs"
                            >
                              <CalendarPlus className="size-3.5 mr-2 text-secondary-foreground" />
                              <span>Hẹn ngày tái khám</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onViewOrders(encounter)}
                              className="cursor-pointer text-xs"
                            >
                              <Printer className="size-3.5 mr-2 text-secondary-foreground" />
                              <span>In phiếu chỉ định</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        <div className="border-t border-border px-5 py-3">
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={onPageChange}
            entityName="lượt khám"
            showSinglePageNavigation={true}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
