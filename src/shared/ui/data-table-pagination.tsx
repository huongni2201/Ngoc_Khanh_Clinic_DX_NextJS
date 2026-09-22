"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DataTablePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  entityName?: string
  className?: string
}

/**
 * Standard reusable pagination component across all data tables in Ngoc Khanh Clinic.
 * Complies with design tokens in globals.css, accessibility standards, and responsive breakpoints.
 */
export function DataTablePagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  entityName = "bản ghi",
  className,
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
        "flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between text-xs",
        className
      )}
    >
      {/* Summary info on the left */}
      <div className="text-secondary-foreground select-none">
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

      {/* Page navigation on the right */}
      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label="Phân trang"
          className="flex items-center gap-1.5 select-none"
        >
          {/* Previous page button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Trang trước"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="size-8 p-0 rounded-lg border-border bg-card text-secondary-foreground hover:text-foreground cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Number & ellipsis buttons */}
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center text-xs text-muted-foreground"
                >
                  •••
                </span>
              )
            }

            const isActive = page === currentPage

            return (
              <Button
                key={page}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                aria-label={`Trang ${page}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onPageChange(page)}
                className={cn(
                  "size-8 p-0 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border-border bg-card text-secondary-foreground hover:bg-muted/70 hover:text-foreground shadow-2xs"
                )}
              >
                {page}
              </Button>
            )
          })}

          {/* Next page button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="size-8 p-0 rounded-lg border-border bg-card text-secondary-foreground hover:text-foreground cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
          >
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  )
}
