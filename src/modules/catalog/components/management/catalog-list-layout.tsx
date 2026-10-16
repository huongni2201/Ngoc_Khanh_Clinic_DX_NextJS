"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, Search, X } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination, ScreenLayout, PageHeader } from "@/shared/ui"
import type { PageBreadcrumbItem } from "@/shared/ui/page-header"
import type { ReactNode } from "react"

interface CatalogListLayoutProps {
  /** PageHeader props */
  breadcrumbs: readonly PageBreadcrumbItem[]
  leading?: ReactNode
  title: string
  description: string
  actions?: ReactNode

  /** Filter Toolbar (styled like DoctorFilterToolbar in /doctor) */
  searchValue: string
  searchPlaceholder: string
  onSearchChange: (q: string) => void
  filterSlot?: ReactNode
  hasActiveFilters?: boolean
  onResetFilters?: () => void

  /** State */
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void

  /** Table */
  children: ReactNode

  /** Pagination & Metrics */
  totalItems: number
  entityLabel: string
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

/**
 * Shared layout for the 5 catalog management list pages.
 * Unified with the /doctor ("Lượt khám") filter & table architecture:
 * 1. PageHeader
 * 2. Labeled Filter Toolbar Card (Search + Select filters + Reset button)
 * 3. Table Card with Section Header, Table Content & Pagination
 */
export function CatalogListLayout({
  breadcrumbs,
  leading,
  title,
  description,
  actions,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filterSlot,
  hasActiveFilters = false,
  onResetFilters,
  totalItems,
  entityLabel,
  isLoading,
  isError,
  error,
  children,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onRetry,
}: CatalogListLayoutProps) {
  return (
    <ScreenLayout>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={breadcrumbs}
        leading={leading}
        title={title}
        description={description}
        actions={actions}
      />

      {/* 2. Error state */}
      {isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : `Không thể tải danh sách ${entityLabel}.`}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      )}

      {/* 3. Filter Toolbar Card (Unified with /doctor filter toolbar) */}
      {!isError && (
        <div
          role="search"
          aria-label={`Bộ lọc ${entityLabel}`}
          className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs"
        >
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:flex xl:flex-nowrap">
            {/* Search Input with Icon and Label */}
            <div className="flex min-w-0 flex-col gap-1.5 xl:flex-[1.5]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`catalog-search-${entityLabel}`}
                  className="block text-xs font-semibold text-foreground tracking-tight h-4 leading-4"
                >
                  Tìm kiếm
                </label>
                {hasActiveFilters && (
                  <span className="text-[10px] text-primary font-medium lg:hidden">
                    Đang lọc
                  </span>
                )}
              </div>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id={`catalog-search-${entityLabel}`}
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-9 pl-9 pr-4 text-xs sm:text-sm bg-background"
                />
              </div>
            </div>

            {/* Entity-specific filter dropdowns */}
            {filterSlot}

            {/* Reset Filters button */}
            {onResetFilters && (
              <div className="flex min-w-0 shrink-0 flex-col gap-1.5">
                <span className="invisible block text-xs h-4 leading-4 select-none" aria-hidden="true">
                  &nbsp;
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onResetFilters}
                  disabled={!hasActiveFilters}
                  title="Đặt lại toàn bộ bộ lọc"
                  className="h-9 px-3 text-xs shrink-0 cursor-pointer border-border hover:bg-hover text-secondary-foreground disabled:opacity-40"
                >
                  <X className="size-3.5 mr-1" />
                  <span>Xóa lọc</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Table card */}
      {!isError && (
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden flex flex-col">
          {/* Main Section Header with Title and Total Count */}
          <div className="border-b border-border px-5 py-3.5 flex items-center justify-between bg-card">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Danh sách {entityLabel}
            </h2>
            {!isLoading && (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Tổng cộng: <strong className="font-semibold text-foreground">{totalItems}</strong>{" "}
                {entityLabel}
              </p>
            )}
          </div>

          {/* Operational Table Container */}
          <div className="overflow-x-auto min-w-full">
            {children}
          </div>

          {/* Pagination Section */}
          {!isLoading && totalItems > 0 && (
            <div className="border-t border-border px-5 py-3 bg-card">
              <DataTablePagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                entityName={entityLabel}
                showSinglePageNavigation={true}
              />
            </div>
          )}
        </div>
      )}
    </ScreenLayout>
  )
}
