"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, Eye, MoreHorizontal, Plus } from "@/shared/ui/product-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { HealthExaminationBatchSummary } from "../../types"
import { getHealthExaminationBatchStatusLabel } from "../../utils/batch-status"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface HealthExaminationBatchTableProps {
  organizationId: string
  batches: HealthExaminationBatchSummary[]
  currentPage: number
  pageSize: number
  isLoading?: boolean
  /** True when a search is applied, so an empty page means "no match" rather than "no batch". */
  isFiltered?: boolean
  onCreateClick?: () => void
}

function formatBatchDateRange(batch: HealthExaminationBatchSummary) {
  const startDate = batch.startDate
    ? formatHealthExaminationDate(batch.startDate)
    : undefined
  const endDate = batch.endDate
    ? formatHealthExaminationDate(batch.endDate)
    : undefined

  if (startDate && endDate) return `${startDate} – ${endDate}`
  if (startDate) return `Từ ${startDate}`
  if (endDate) return `Đến ${endDate}`
  return "Chưa thiết lập"
}

export function HealthExaminationBatchTable({
  organizationId,
  batches,
  currentPage,
  pageSize,
  isLoading = false,
  isFiltered = false,
  onCreateClick,
}: HealthExaminationBatchTableProps) {
  const router = useRouter()
  const batchHref = (batchId: string) =>
    `/organizations/${organizationId}/health-examination-batches/${batchId}`

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50">
            <TableHead className="w-14 px-4 text-center">STT</TableHead>
            <TableHead className="px-4">Đợt khám</TableHead>
            <TableHead className="px-4">Thời gian</TableHead>
            <TableHead className="px-4">Trạng thái</TableHead>
            <TableHead className="px-3 text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 py-3">
                  <Skeleton className="mx-auto h-4 w-4" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-3 py-3">
                  <Skeleton className="mx-auto size-8 rounded-lg" />
                </TableCell>
              </TableRow>
            ))
          ) : batches.length > 0 ? (
            batches.map((batch, index) => (
              <TableRow
                key={batch.id}
                onClick={() => router.push(batchHref(batch.id))}
                className="cursor-pointer border-b border-divider transition-colors hover:bg-hover/60"
              >
                <TableCell className="px-4 py-3.5 text-center text-xs text-muted-foreground">
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Link
                    href={batchHref(batch.id)}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {batch.name}
                  </Link>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Mã: {batch.code}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-xs text-foreground">
                  {formatBatchDateRange(batch)}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {getHealthExaminationBatchStatusLabel(batch.status)}
                  </span>
                </TableCell>
                <TableCell
                  className="px-3 py-3.5 text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Thao tác đợt khám ${batch.name}`}
                          className="size-8 text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => router.push(batchHref(batch.id))}
                        className="cursor-pointer text-xs"
                      >
                        <Eye className="mr-2 size-3.5" />
                        Xem chi tiết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-14 text-center">
                <CalendarDays className="mx-auto mb-3 size-9 text-muted-foreground" />
                <p className="font-medium text-foreground">
                  {isFiltered
                    ? "Không tìm thấy đợt khám phù hợp"
                    : "Chưa có đợt khám nào cho đơn vị này"}
                </p>
                <p className="mx-auto mt-1 mb-5 max-w-sm text-xs text-muted-foreground">
                  {isFiltered
                    ? "Thử đổi từ khóa tìm kiếm."
                    : "Tạo đợt khám để cấu hình thời gian, địa điểm và hạng mục khám."}
                </p>
                {onCreateClick && !isFiltered && (
                  <Button type="button" onClick={onCreateClick}>
                    <Plus className="mr-1.5 size-3.5" />
                    Tạo đợt khám mới
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
