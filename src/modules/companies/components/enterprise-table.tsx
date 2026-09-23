"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Edit3, Trash2 } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Enterprise } from "../types"
import { cn } from "@/lib/utils"

interface EnterpriseTableProps {
  enterprises: Enterprise[]
  isLoading?: boolean
  currentPage?: number
  pageSize?: number
}

export function EnterpriseTable({
  enterprises,
  isLoading,
  currentPage = 1,
  pageSize = 10,
}: EnterpriseTableProps) {
  const router = useRouter()

  const handleRowClick = (enterpriseId: string) => {
    router.push(`/enterprises/${enterpriseId}`)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header-bg hover:bg-table-header-bg border-b border-border">
              <TableHead className="h-11 px-3 text-xs font-semibold text-table-header-fg text-center w-12">
                STT
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-semibold text-table-header-fg w-[26%]">
                Tên doanh nghiệp
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-semibold text-table-header-fg w-[24%]">
                Địa chỉ
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-semibold text-table-header-fg w-[16%]">
                Người liên hệ
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-semibold text-table-header-fg text-center w-[9%]">
                Số đợt khám
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-semibold text-table-header-fg w-[11%]">
                Trạng thái
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-semibold text-table-header-fg w-[10%]">
                Cập nhật gần nhất
              </TableHead>
              <TableHead className="h-11 px-3 text-xs font-semibold text-table-header-fg text-center w-12">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, idx) => (
              <TableRow key={idx} className="border-b border-table-divider">
                <TableCell className="px-3 py-3.5 text-center">
                  <Skeleton className="h-4 w-5 mx-auto" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-52" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="px-3 py-3.5 text-center">
                  <Skeleton className="size-8 rounded-lg mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (enterprises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/50 py-16 px-4 text-center">
        <p className="text-sm font-medium text-foreground">Không tìm thấy doanh nghiệp nào</p>
        <p className="text-xs text-muted-foreground mt-1">
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-table-header-bg hover:bg-table-header-bg border-b border-border">
            {/* 1. STT */}
            <TableHead className="h-10 px-3 text-xs font-bold text-table-header-fg text-center w-12">
              STT
            </TableHead>

            {/* 2. Tên doanh nghiệp */}
            <TableHead className="h-10 px-4 text-xs font-bold text-table-header-fg w-[26%]">
              Tên doanh nghiệp
            </TableHead>

            {/* 3. Địa chỉ */}
            <TableHead className="h-10 px-4 text-xs font-bold text-table-header-fg w-[24%]">
              Địa chỉ
            </TableHead>

            {/* 4. Người liên hệ */}
            <TableHead className="h-10 px-4 text-xs font-bold text-table-header-fg w-[16%]">
              Người liên hệ
            </TableHead>

            {/* 5. Số đợt khám */}
            <TableHead className="h-10 px-4 text-xs font-bold text-table-header-fg text-center w-[9%]">
              Số đợt khám
            </TableHead>

            {/* 6. Trạng thái */}
            <TableHead className="h-10 px-4 text-xs font-bold text-table-header-fg w-[11%]">
              Trạng thái
            </TableHead>

            {/* 7. Cập nhật gần nhất */}
            <TableHead className="h-10 px-4 text-xs font-bold text-table-header-fg w-[10%]">
              Cập nhật gần nhất
            </TableHead>

            {/* 8. Thao tác */}
            <TableHead className="h-10 px-3 text-xs font-bold text-table-header-fg text-center w-12">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enterprises.map((enterprise, index) => {
            const isInProgress = enterprise.status === "IN_PROGRESS"
            const sttNumber = (currentPage - 1) * pageSize + index + 1

            return (
              <TableRow
                key={enterprise.id}
                onClick={() => handleRowClick(enterprise.id)}
                className="group cursor-pointer border-b border-divider transition-colors hover:bg-hover/60"
              >
                {/* 1. STT */}
                <TableCell className="px-3 py-2.5 text-center text-xs font-mono text-muted-foreground">
                  {sttNumber}
                </TableCell>

                {/* 2. Tên doanh nghiệp (không có logo) */}
                <TableCell className="px-4 py-2.5 whitespace-normal">
                  <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {enterprise.name}
                  </span>
                </TableCell>

                {/* 3. Địa chỉ */}
                <TableCell className="px-4 py-2.5 text-xs text-muted-foreground whitespace-normal">
                  <span className="line-clamp-2" title={enterprise.address}>
                    {enterprise.address || "—"}
                  </span>
                </TableCell>

                {/* 4. Người liên hệ */}
                <TableCell className="px-4 py-2.5">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-foreground">
                      {enterprise.contactPerson}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {enterprise.contactPhone}
                    </span>
                  </div>
                </TableCell>

                {/* 5. Số đợt khám */}
                <TableCell className="px-4 py-2.5 text-center text-xs font-medium text-foreground">
                  {enterprise.batchesCount}
                </TableCell>

                {/* 7. Trạng thái */}
                <TableCell className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-none select-none",
                      isInProgress
                        ? "bg-status-in-progress-bg text-status-in-progress"
                        : "bg-status-completed-bg text-status-completed"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        isInProgress
                          ? "bg-status-in-progress"
                          : "bg-status-completed"
                      )}
                    />
                    {isInProgress ? "Đang khám" : "Đã khám"}
                  </span>
                </TableCell>

                {/* 8. Cập nhật gần nhất */}
                <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
                  {enterprise.updatedAt}
                </TableCell>

                {/* 9. Thao tác */}
                <TableCell
                  className="px-3 py-2.5 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Thao tác"
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground cursor-pointer transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-hidden"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-xs">
                      <DropdownMenuItem
                        onClick={() => handleRowClick(enterprise.id)}
                        className="cursor-pointer"
                      >
                        <Eye className="size-3.5 mr-2 text-muted-foreground" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit3 className="size-3.5 mr-2 text-muted-foreground" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="size-3.5 mr-2" />
                        Xóa
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
