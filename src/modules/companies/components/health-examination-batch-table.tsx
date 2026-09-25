"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Plus, CalendarDays } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HealthExaminationBatch } from "@/modules/health-examinations"

interface HealthExaminationBatchTableProps {
  enterpriseId: string
  batches: HealthExaminationBatch[]
  isLoading?: boolean
  onCreateClick?: () => void
}

export function HealthExaminationBatchTable({
  enterpriseId,
  batches,
  isLoading = false,
  onCreateClick,
}: HealthExaminationBatchTableProps) {
  const router = useRouter()

  const handleRowClick = (batchId: string) => {
    router.push(`/enterprises/${enterpriseId}/health-examination-batches/${batchId}`)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border">
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-center w-14">
                STT
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
                Tên đợt khám
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
                Ngày khám
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
                Địa điểm
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-center">
                Số nhân sự
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
                Trạng thái
              </TableHead>
              <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, idx) => (
              <TableRow key={idx} className="border-b border-border/60">
                <TableCell className="px-4 py-3 text-center">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-3 py-3 text-center">
                  <Skeleton className="size-8 rounded-lg mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card py-14 px-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
          <CalendarDays className="size-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Chưa có đợt khám nào cho doanh nghiệp này
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
          Tạo đợt khám mới để bắt đầu cấu hình các hạng mục khám, đơn giá và tiếp nhận danh sách nhân sự.
        </p>
        {onCreateClick && (
          <Button
            type="button"
            onClick={onCreateClick}
            className="h-9 rounded-lg px-3.5 text-xs font-medium shadow-xs"
          >
            <Plus className="size-3.5 mr-1.5 stroke-[2.5]" />
            Tạo đợt khám mới
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b border-border">
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-center w-14">
              STT
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
              Tên đợt khám
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
              Ngày khám
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
              Địa điểm
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground text-center">
              Số nhân sự
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground">
              Trạng thái
            </TableHead>
            <TableHead className="h-10 px-3 text-xs font-semibold text-foreground text-center">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch, index) => {
            const isCompleted = batch.status === "COMPLETED"

            return (
              <TableRow
                key={batch.id}
                onClick={() => handleRowClick(batch.id)}
                className="border-b border-divider hover:bg-hover/60 cursor-pointer transition-colors"
              >
                <TableCell className="px-4 py-3.5 text-center text-xs font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="font-semibold text-foreground text-xs sm:text-sm hover:text-primary transition-colors">
                    {batch.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Mã: {batch.code}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-xs text-foreground font-medium">
                  {batch.examDate}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-xs text-muted-foreground max-w-[220px] truncate">
                  {batch.location}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-center text-xs font-semibold text-foreground">
                  {batch.employeeCount}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-completed-bg px-2.5 py-0.5 text-xs font-medium text-status-completed select-none">
                      <span className="size-1.5 rounded-full bg-status-completed shrink-0" />
                      Đã hoàn thành
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-in-progress-bg px-2.5 py-0.5 text-xs font-medium text-status-in-progress select-none">
                      <span className="size-1.5 rounded-full bg-status-in-progress shrink-0" />
                      Đang khám
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className="px-3 py-3.5 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-8 text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Thao tác</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => handleRowClick(batch.id)}
                        className="cursor-pointer text-xs"
                      >
                        <Eye className="size-3.5 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
