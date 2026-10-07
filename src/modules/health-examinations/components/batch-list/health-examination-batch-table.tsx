"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, Eye, Plus } from "@/shared/ui/product-icon"
import { StatusPill } from "@/shared/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { HealthExaminationBatchSummary } from "../../types"
import {
  HEALTH_EXAMINATION_BATCH_STATUS_TONES,
  getHealthExaminationBatchStatusLabel,
} from "../../utils/batch-status"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface HealthExaminationBatchTableProps {
  organizationId: string
  batches: HealthExaminationBatchSummary[]
  isLoading?: boolean
  /** True when a search is applied, so an empty page means "no match" rather than "no batch". */
  isFiltered?: boolean
  onCreateClick?: () => void
}

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"

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
  isLoading = false,
  isFiltered = false,
  onCreateClick,
}: HealthExaminationBatchTableProps) {
  const router = useRouter()
  const batchHref = (batchId: string) =>
    `/organizations/${organizationId}/health-examination-batches/${batchId}`

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table className="min-w-[36rem]">
        <TableHeader>
          <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
            <TableHead className={`${HEAD_CLASS} w-[46%] min-w-52`}>Đợt khám</TableHead>
            <TableHead className={HEAD_CLASS}>Thời gian</TableHead>
            <TableHead className={HEAD_CLASS}>Trạng thái</TableHead>
            <TableHead className={`${HEAD_CLASS} w-16 text-right`}>
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="px-4 py-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="ml-auto size-8 rounded-lg" />
                </TableCell>
              </TableRow>
            ))
          ) : batches.length > 0 ? (
            batches.map((batch) => (
              <TableRow
                key={batch.id}
                onClick={() => router.push(batchHref(batch.id))}
                className="group cursor-pointer"
              >
                <TableCell className="px-4 py-3 whitespace-normal">
                  <Link
                    href={batchHref(batch.id)}
                    className="text-sm font-medium text-foreground transition-colors group-hover:text-primary"
                  >
                    {batch.name}
                  </Link>
                  <div className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                    Mã: {batch.code}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-foreground">
                  {formatBatchDateRange(batch)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusPill tone={HEALTH_EXAMINATION_BATCH_STATUS_TONES[batch.status]}>
                    {getHealthExaminationBatchStatusLabel(batch.status)}
                  </StatusPill>
                </TableCell>
                <TableCell
                  className="px-4 py-3 text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(batchHref(batch.id))}
                    className="size-8 cursor-pointer rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"
                    title={`Xem chi tiết - ${batch.name}`}
                    aria-label={`Xem chi tiết đợt khám ${batch.name}`}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="py-14 text-center">
                <CalendarDays aria-hidden="true" className="mx-auto mb-3 size-9 text-muted-foreground" />
                <p className="font-medium text-foreground">
                  {isFiltered
                    ? "Không tìm thấy đợt khám phù hợp"
                    : "Chưa có đợt khám nào cho đơn vị này"}
                </p>
                <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                  {isFiltered
                    ? "Thử đổi từ khóa tìm kiếm."
                    : "Tạo đợt khám để cấu hình thời gian, địa điểm và hạng mục khám."}
                </p>
                {onCreateClick && !isFiltered && (
                  <Button type="button" onClick={onCreateClick}>
                    <Plus className="size-4" />
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
