"use client"

import * as React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

export interface DataTablePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  entityName?: string
  className?: string
  showSinglePageNavigation?: boolean
}

/**
 * Standard reusable pagination component across all data tables in Ngoc Khanh Clinic.
 * Composes shadcn/ui Pagination primitives directly without custom CSS overrides,
 * adhering to UI/UX Pro Max guidelines and design tokens in globals.css.
 */
export function DataTablePagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  entityName = "bản ghi",
  className,
  showSinglePageNavigation = false,
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers with smart ellipsis when totalPages > 7
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages]
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ]
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        "flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between text-xs",
        className
      )}
    >
      {/* Summary info on the left */}
      <div className="text-muted-foreground select-none">
        {totalItems === 0 ? (
          "Không có dữ liệu"
        ) : (
          <>
            Hiển thị <span className="font-semibold text-foreground">{startItem}</span> -{" "}
            <span className="font-semibold text-foreground">{endItem}</span> của{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> {entityName}
          </>
        )}
      </div>

      {/* Page navigation on the right using shadcn/ui Pagination */}
      {(totalPages > 1 || (showSinglePageNavigation && totalPages >= 1 && totalItems > 0)) && (
        <Pagination aria-label="Phân trang" className="mx-0 w-auto justify-end select-none">
          <PaginationContent className="gap-1">
            {/* Previous page button */}
            <PaginationItem>
              <PaginationPrevious
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              />
            </PaginationItem>

            {/* Number & ellipsis buttons */}
            {pageNumbers.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              const isActive = page === currentPage

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={isActive}
                    aria-label={`Trang ${page}`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {/* Next page button */}
            <PaginationItem>
              <PaginationNext
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
