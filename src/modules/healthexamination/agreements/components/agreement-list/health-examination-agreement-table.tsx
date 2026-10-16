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
import type { HealthExaminationAgreementSummary } from "../../types"
import {
  HEALTH_EXAMINATION_AGREEMENT_STATUS_TONES,
  getHealthExaminationAgreementStatusLabel,
} from "../../utils/agreement-status"
import { formatValidityRange } from "../../utils/format-health-examination-date"

interface HealthExaminationAgreementTableProps {
  organizationId: string
  agreements: HealthExaminationAgreementSummary[]
  isLoading?: boolean
  /** True when a search is applied, so an empty page means "no match" rather than "no agreement". */
  isFiltered?: boolean
  onCreateClick?: () => void
}

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"

function formatAgreementDateRange(agreement: HealthExaminationAgreementSummary) {
  return formatValidityRange(agreement.validFrom, agreement.validTo)
}

export function HealthExaminationAgreementTable({
  organizationId,
  agreements,
  isLoading = false,
  isFiltered = false,
  onCreateClick,
}: HealthExaminationAgreementTableProps) {
  const router = useRouter()
  const agreementHref = (agreementId: string) =>
    `/organizations/${organizationId}/agreements/${agreementId}`

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table className="min-w-[36rem]">
        <TableHeader>
          <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
            <TableHead className={`${HEAD_CLASS} w-[46%] min-w-52`}>Thỏa thuận</TableHead>
            <TableHead className={HEAD_CLASS}>Thời gian áp dụng</TableHead>
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
          ) : agreements.length > 0 ? (
            agreements.map((agreement) => (
              <TableRow
                key={agreement.id}
                onClick={() => router.push(agreementHref(agreement.id))}
                className="group cursor-pointer"
              >
                <TableCell className="px-4 py-3 whitespace-normal">
                  <Link
                    href={agreementHref(agreement.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-sm text-sm font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/30 group-hover:text-primary"
                  >
                    {agreement.name}
                  </Link>
                  <div className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                    Mã: {agreement.code}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-foreground">
                  {formatAgreementDateRange(agreement)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusPill tone={HEALTH_EXAMINATION_AGREEMENT_STATUS_TONES[agreement.status]}>
                    {getHealthExaminationAgreementStatusLabel(agreement.status)}
                  </StatusPill>
                </TableCell>
                <TableCell
                  className="px-4 py-3 text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(agreementHref(agreement.id))}
                    className="size-8 rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"
                    title={`Xem chi tiết - ${agreement.name}`}
                    aria-label={`Xem chi tiết thỏa thuận ${agreement.name}`}
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
                    ? "Không tìm thấy thỏa thuận phù hợp"
                    : "Chưa có thỏa thuận nào cho đơn vị này"}
                </p>
                <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                  {isFiltered
                    ? "Thử đổi từ khóa tìm kiếm."
                    : onCreateClick
                      ? "Tạo thỏa thuận để cấu hình thời gian áp dụng và hạng mục khám."
                      : "Đơn vị này chưa có thỏa thuận nào."}
                </p>
                {onCreateClick && !isFiltered && (
                  <Button type="button" onClick={onCreateClick}>
                    <Plus className="size-4" />
                    Tạo thỏa thuận mới
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
