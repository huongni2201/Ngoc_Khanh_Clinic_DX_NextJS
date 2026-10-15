"use client"

import * as React from "react"
import { Plus, SearchField, StatusPill, Users } from "@/shared/ui"
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
import type { StaffMember } from "../types/staff-member"
import {
  roleLabel,
  STAFF_ACCOUNT_STATUS_PRESENTATION,
  STAFF_MEMBER_STATUS_PRESENTATION,
} from "../utils/staff-member-labels"

interface StaffMemberTableProps {
  staffMembers: StaffMember[]
  isLoading?: boolean
  totalItems?: number
  searchTerm?: string
  onSearchChange?: (search: string) => void
  /** Omitted when the session may not create staff members. */
  onCreateClick?: () => void
}

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const COLUMN_COUNT = 5

export function StaffMemberTable({
  staffMembers,
  isLoading,
  totalItems,
  searchTerm = "",
  onSearchChange,
  onCreateClick,
}: StaffMemberTableProps) {
  // Local value for the debounced search, re-synced when the URL changes.
  const [searchValue, setSearchValue] = React.useState(searchTerm)
  const [prevSearch, setPrevSearch] = React.useState(searchTerm)

  if (searchTerm !== prevSearch) {
    setPrevSearch(searchTerm)
    setSearchValue(searchTerm)
  }

  React.useEffect(() => {
    if (!onSearchChange) return
    const timer = setTimeout(() => {
      if (searchValue !== searchTerm) onSearchChange(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, searchTerm, onSearchChange])

  const isFiltered = searchTerm.trim().length > 0
  const total = totalItems ?? staffMembers.length

  return (
    <div
      data-slot="staff-member-table"
      className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      {onSearchChange ? (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Tìm theo mã NV, họ tên, tên đăng nhập..."
            label="Tìm nhân viên"
            className="sm:max-w-md"
          />
          {!isLoading ? (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{total}</span> nhân viên
            </p>
          ) : null}
        </div>
      ) : null}

      <Table className="min-w-[22rem] md:min-w-[48rem]">
        <TableHeader>
          <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
            <TableHead className={`${HEAD_CLASS} w-[14%]`}>Mã NV</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[24%]`}>Họ và tên</TableHead>
            <TableHead className={`${HEAD_CLASS} hidden w-[20%] md:table-cell`}>Tên đăng nhập</TableHead>
            <TableHead className={`${HEAD_CLASS} hidden w-[26%] md:table-cell`}>Vai trò</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[16%]`}>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="hidden px-4 py-3 md:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="hidden px-4 py-3 md:table-cell">
                  <Skeleton className="h-5 w-28 rounded-md" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
              </TableRow>
            ))
          ) : staffMembers.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMN_COUNT} className="py-16 text-center">
                <Users aria-hidden="true" className="mx-auto mb-3 size-9 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {isFiltered ? "Không tìm thấy nhân viên phù hợp" : "Chưa có nhân viên nào"}
                </p>
                <p className="mx-auto mb-5 mt-1 max-w-sm whitespace-normal text-xs text-muted-foreground">
                  {isFiltered
                    ? "Thử đổi từ khóa hoặc tìm theo mã nhân viên."
                    : "Thêm nhân viên đầu tiên; tài khoản đăng nhập được tạo cùng lúc."}
                </p>
                {isFiltered && onSearchChange ? (
                  <Button type="button" variant="outline" onClick={() => onSearchChange("")}>
                    Xóa tìm kiếm
                  </Button>
                ) : null}
                {!isFiltered && onCreateClick ? (
                  <Button type="button" onClick={onCreateClick}>
                    <Plus className="size-4" />
                    Thêm nhân viên
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ) : (
            staffMembers.map((staffMember) => (
              <StaffMemberRow key={staffMember.id} staffMember={staffMember} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function StaffMemberRow({ staffMember }: { staffMember: StaffMember }) {
  const status = STAFF_MEMBER_STATUS_PRESENTATION[staffMember.status]
  const account = staffMember.account
  const accountStatus = account ? STAFF_ACCOUNT_STATUS_PRESENTATION[account.status] : null

  return (
    <TableRow>
      <TableCell className="px-4 py-3 font-mono text-sm tabular-nums text-secondary-foreground">
        {staffMember.staffCode}
      </TableCell>
      <TableCell className="whitespace-normal px-4 py-3">
        <span className="block text-sm font-medium text-foreground">{staffMember.fullName}</span>
        <span className="mt-0.5 block font-mono text-xs text-muted-foreground md:hidden">
          {account?.username ?? "Chưa có tài khoản"}
        </span>
      </TableCell>
      <TableCell className="hidden px-4 py-3 md:table-cell">
        {account ? (
          <span className="block font-mono text-sm text-foreground">{account.username}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Chưa có tài khoản</span>
        )}
        {accountStatus && account?.status !== "ACTIVE" ? (
          <StatusPill tone={accountStatus.tone} className="mt-1">
            {accountStatus.label}
          </StatusPill>
        ) : null}
      </TableCell>
      <TableCell className="hidden whitespace-normal px-4 py-3 md:table-cell">
        {account ? (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {roleLabel(account.roleCode)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3">
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </TableCell>
    </TableRow>
  )
}
