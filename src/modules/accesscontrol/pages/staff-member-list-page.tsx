"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  DataTablePagination,
  Lock,
  PageHeader,
  Plus,
  RefreshCw,
  ScreenLayout,
} from "@/shared/ui"
import { CreateStaffMemberDialog } from "../components/create-staff-member-dialog"
import { StaffMemberTable } from "../components/staff-member-table"
import { useCachedUserSession } from "../hooks/use-cached-user-session"
import { useStaffMembers } from "../hooks/use-staff-members"
import { canCreateStaffMembers, canViewStaffMembers } from "../utils/staff-member-permissions"

const PAGE_SIZE = 10

/** Staff members with their accounts; administrators create new ones from here. */
export function StaffMemberListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const session = useCachedUserSession()
  const canView = canViewStaffMembers(session)
  const canCreate = canCreateStaffMembers(session)

  const search = searchParams?.get("q")?.trim() || ""
  const pageParam = Number(searchParams?.get("page"))
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const updateUrlParams = React.useCallback(
    (next: { q?: string; page?: number }) => {
      const current = new URLSearchParams(Array.from(searchParams?.entries() || []))
      if (next.q !== undefined) {
        if (next.q.trim()) current.set("q", next.q.trim())
        else current.delete("q")
        current.set("page", "1")
      }
      if (next.page !== undefined) current.set("page", String(next.page))
      const query = current.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    },
    [router, pathname, searchParams]
  )

  const { data, isLoading, isError, error, refetch } = useStaffMembers(
    { search, page, pageSize: PAGE_SIZE },
    canView
  )

  const openCreate = canCreate ? () => setIsCreateOpen(true) : undefined

  return (
    <ScreenLayout data-slot="staff-member-list-page">
      <PageHeader
        breadcrumbs={[{ label: "Quản trị" }, { label: "Nhân viên" }]}
        title="Nhân viên"
        description="Hồ sơ nhân viên và tài khoản đăng nhập đi kèm"
        actions={
          openCreate ? (
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" />
              Thêm nhân viên
            </Button>
          ) : null
        }
      />

      {!canView ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <Lock aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          Tài khoản của bạn chưa được cấp quyền xem danh sách nhân viên. Nếu vừa được cấp quyền, hãy
          đăng nhập lại.
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : "Không thể tải danh sách nhân viên."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col">
            <StaffMemberTable
              staffMembers={data?.data ?? []}
              isLoading={isLoading}
              totalItems={data?.total ?? 0}
              searchTerm={search}
              onSearchChange={(q) => updateUrlParams({ q })}
              onCreateClick={openCreate}
            />
          </div>
          {!isLoading && (data?.total ?? 0) > 0 ? (
            <div className="mt-1 pt-1">
              <DataTablePagination
                currentPage={data?.page ?? 1}
                pageSize={data?.pageSize ?? PAGE_SIZE}
                totalItems={data?.total ?? 0}
                totalPages={data?.totalPages ?? 1}
                onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
                entityName="nhân viên"
              />
            </div>
          ) : null}
        </>
      )}

      {canCreate ? (
        <CreateStaffMemberDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      ) : null}
    </ScreenLayout>
  )
}
