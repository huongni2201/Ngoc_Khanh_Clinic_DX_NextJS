"use client"

import * as React from "react"
import { DataTablePagination } from "@/shared/ui"

export interface EnterprisePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * EnterprisePagination - legacy wrapper delegating to shared DataTablePagination.
 */
export function EnterprisePagination(props: EnterprisePaginationProps) {
  return <DataTablePagination {...props} entityName="doanh nghiệp" />
}
