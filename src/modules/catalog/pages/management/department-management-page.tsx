"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Add01Icon, Hospital01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/shared/ui"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Edit3, PlayCircle, Trash2 } from "@/shared/ui/product-icon"
import { useCachedUserSession, hasStaffPermission } from "@/modules/accesscontrol"
import { useDepartments, useDeactivateDepartment, useReactivateDepartment } from "../../hooks/management/use-catalog-management"
import { CatalogListLayout } from "../../components/management/catalog-list-layout"
import { CatalogDetailSheet } from "../../components/management/catalog-detail-sheet"
import { CatalogStatusDialog } from "../../components/management/catalog-status-dialog"
import { DepartmentFormDialog } from "../../components/management/forms/department-form-dialog"
import {
  CATALOG_PERMISSIONS,
  DEPARTMENT_TYPE_LABELS,
  parsePageParam,
  parseSizeParam,
  parseActiveParam,
  catalogErrorMessage,
} from "../../utils/management/catalog-management-utils"
import { useLoadDepartment } from "../../hooks/management/use-catalog-management"
import { toast } from "@/shared/ui/toaster"
import type { Department, DepartmentType } from "../../types/management"

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const ICON_BTN = "size-8 rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"

export function DepartmentManagementPage() {
  const loadRecord = useLoadDepartment()
  const session = useCachedUserSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams?.get("q")?.trim() ?? ""
  const page = parsePageParam(searchParams?.get("page"))
  const size = parseSizeParam(searchParams?.get("size"))
  const active = parseActiveParam(searchParams?.get("active"))
  const departmentType = searchParams?.get("departmentType")?.trim() as DepartmentType | undefined

  const [editRevision, setEditRevision] = React.useState(0)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Department | null>(null)
  const [detailTarget, setDetailTarget] = React.useState<Department | null>(null)
  const [statusTarget, setStatusTarget] = React.useState<{ dept: Department; mode: "deactivate" | "reactivate" } | null>(null)
  const [searchValue, setSearchValue] = React.useState(q)
  const [prevQ, setPrevQ] = React.useState(q)
  if (q !== prevQ) { setPrevQ(q); setSearchValue(q) }

  const canCreate = hasStaffPermission(session, CATALOG_PERMISSIONS.DEPARTMENT_CREATE)
  const canUpdate = hasStaffPermission(session, CATALOG_PERMISSIONS.DEPARTMENT_UPDATE)
  const canDeactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.DEPARTMENT_DEACTIVATE)
  const canReactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.DEPARTMENT_REACTIVATE)
  const canDetailView = hasStaffPermission(session, CATALOG_PERMISSIONS.DEPARTMENT_DETAIL_VIEW)

  const updateUrl = React.useCallback((params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() ?? []))
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === "") current.delete(k)
      else current.set(k, v)
    })
    if (params.page === undefined && (params.q !== undefined || params.size !== undefined || params.active !== undefined || params.departmentType !== undefined)) {
      current.set("page", "1")
    }
    router.replace(`${pathname}?${current.toString()}`)
  }, [router, pathname, searchParams])

  React.useEffect(() => {
    const timer = setTimeout(() => { if (searchValue !== q) updateUrl({ q: searchValue }) }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, q, updateUrl])

  const { data, isLoading, isError, error, refetch } = useDepartments({
    q,
    page,
    size,
    active,
    departmentType: departmentType || undefined,
    sortKey: "code",
    sortBy: "ASC",
  })

  React.useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) {
      updateUrl({ page: String(Math.max(1, data.totalPages)) })
    }
  }, [data, page, updateUrl])

  const deactivate = useDeactivateDepartment(statusTarget?.dept.id ?? "")
  const reactivate = useReactivateDepartment(statusTarget?.dept.id ?? "")

  const handleStatusConfirm = async () => {
    if (!statusTarget) return
    try {
      if (statusTarget.mode === "deactivate") {
        await deactivate.mutateAsync(statusTarget.dept.rowVersion)
        toast.success(`Đã ngừng sử dụng khoa ${statusTarget.dept.name}.`)
      } else {
        await reactivate.mutateAsync(statusTarget.dept.rowVersion)
        toast.success(`Đã bật lại khoa ${statusTarget.dept.name}.`)
      }
      setStatusTarget(null)
      if (detailTarget?.id === statusTarget.dept.id) setDetailTarget(null)
    } catch (err) {
      toast.error(catalogErrorMessage(err, "khoa"))
    }
  }

  const items = data?.items ?? []
  const hasFilter = Boolean(q || active !== null || departmentType)
  const isEmpty = !isLoading && items.length === 0

  return (
    <>
      <CatalogListLayout
        breadcrumbs={[{ label: "Quản lý danh mục", href: "/admin/catalog/departments" }, { label: "Khoa" }]}
        title="Khoa"
        description="Quản lý danh mục khoa của phòng khám"
        actions={canCreate ? (
          <Button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Thêm khoa
          </Button>
        ) : undefined}
        searchValue={searchValue}
        searchPlaceholder="Tìm theo mã, tên khoa..."
        onSearchChange={setSearchValue}
        hasActiveFilters={hasFilter}
        onResetFilters={() => updateUrl({ q: "", active: "", departmentType: "" })}
        filterSlot={
          <>
            <div className="flex min-w-0 flex-col gap-1.5 xl:flex-1">
              <label className="block text-xs font-semibold text-foreground tracking-tight h-4 leading-4">
                Trạng thái
              </label>
              <Select
                items={{ all: "Tất cả trạng thái", true: "Đang sử dụng", false: "Ngừng sử dụng" }}
                value={active === true ? "true" : active === false ? "false" : "all"}
                onValueChange={(val) => updateUrl({ active: !val || val === "all" ? "" : val })}
              >
                <SelectTrigger className="h-9 w-full text-xs sm:text-sm bg-background" aria-label="Lọc theo trạng thái">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Đang sử dụng</SelectItem>
                  <SelectItem value="false">Ngừng sử dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5 xl:flex-1">
              <label className="block text-xs font-semibold text-foreground tracking-tight h-4 leading-4">
                Loại khoa
              </label>
              <Select
                items={{ all: "Tất cả loại khoa", ...DEPARTMENT_TYPE_LABELS }}
                value={departmentType ?? "all"}
                onValueChange={(val) => updateUrl({ departmentType: !val || val === "all" ? "" : val })}
              >
                <SelectTrigger className="h-9 w-full text-xs sm:text-sm bg-background" aria-label="Lọc theo loại khoa">
                  <SelectValue placeholder="Tất cả loại khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại khoa</SelectItem>
                  <SelectItem value="CLINICAL">Lâm sàng</SelectItem>
                  <SelectItem value="DIAGNOSTIC">Cận lâm sàng</SelectItem>
                  <SelectItem value="ADMINISTRATIVE">Hành chính</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
        totalItems={data?.totalElements ?? 0}
        entityLabel="khoa"
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        currentPage={data?.page ?? page}
        pageSize={data?.pageSize ?? size}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onPageSizeChange={(s) => updateUrl({ size: String(s) })}
      >
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
              <TableHead className={`${HEAD_CLASS} w-[15%]`}>Mã</TableHead>
              <TableHead className={`${HEAD_CLASS} flex-1`}>Tên khoa</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[20%]`}>Loại khoa</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[15%]`}>Trạng thái</TableHead>
              <TableHead className={`${HEAD_CLASS} w-16 text-right`}><span className="sr-only">Thao tác</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="ml-auto h-8 w-16 rounded-lg" /></TableCell>
              </TableRow>
            )) : isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center">
                  <HugeiconsIcon
                    icon={Hospital01Icon}
                    aria-hidden="true"
                    className="mx-auto mb-3 size-9 text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    {hasFilter ? "Không tìm thấy khoa phù hợp" : "Chưa có khoa nào"}
                  </p>
                  <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                    {hasFilter
                      ? "Thử đổi từ khóa hoặc bộ lọc tra cứu."
                      : "Thêm khoa đầu tiên để bắt đầu thiết lập phòng khám."}
                  </p>
                  {hasFilter && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateUrl({ q: "", active: "", departmentType: "" })}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                  {!hasFilter && canCreate && (
                    <Button type="button" onClick={() => setFormOpen(true)}>
                      <HugeiconsIcon icon={Add01Icon} className="size-4" />
                      Thêm khoa
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : items.map((dept) => (
              <TableRow key={dept.id} className="group cursor-pointer" onClick={() => canDetailView && setDetailTarget(dept)}>
                <TableCell className="px-4 py-3 font-mono text-xs text-secondary-foreground">{dept.code}</TableCell>
                <TableCell className="px-4 py-3 text-sm font-medium text-foreground">{dept.name}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-secondary-foreground">{DEPARTMENT_TYPE_LABELS[dept.departmentType]}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusPill tone={dept.active ? "success" : "neutral"}>
                    {dept.active ? "Đang sử dụng" : "Ngừng sử dụng"}
                  </StatusPill>
                </TableCell>
                <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {canDetailView && <Button variant="outline" size="sm" className={ICON_BTN} title="Xem chi tiết" aria-label={`Xem ${dept.name}`} onClick={() => setDetailTarget(dept)}><Eye className="size-3.5" /></Button>}
                    {canUpdate && <Button variant="outline" size="sm" className={ICON_BTN} title="Chỉnh sửa" aria-label={`Sửa ${dept.name}`} onClick={() => { setEditTarget(dept); setFormOpen(true) }}><Edit3 className="size-3.5" /></Button>}
                    {dept.active && canDeactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Ngừng sử dụng" aria-label={`Ngừng ${dept.name}`} onClick={() => setStatusTarget({ dept, mode: "deactivate" })}><Trash2 className="size-3.5" /></Button>}
                    {!dept.active && canReactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Bật lại" aria-label={`Bật lại ${dept.name}`} onClick={() => setStatusTarget({ dept, mode: "reactivate" })}><PlayCircle className="size-3.5" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CatalogListLayout>

      {formOpen && (<DepartmentFormDialog
          key={`${editTarget?.id ?? "new"}:${editRevision}`}
          isReloading={loadRecord.isPending}
          onReload={async () => {
            if (!editTarget) return
            const saved = await loadRecord.mutateAsync(editTarget.id)
            setEditTarget(saved)
            setEditRevision(previous => previous + 1)
            if (detailTarget?.id === saved.id) setDetailTarget(saved)
          }}
        open={formOpen}
        onOpenChange={(open) => { if (loadRecord.isPending) return; setFormOpen(open); if (!open) setEditTarget(null) }}
        department={editTarget ?? undefined}
        onSuccess={(saved) => {
          setEditTarget(null)
          if (saved && detailTarget && saved.id === detailTarget.id) {
            setDetailTarget(saved)
          }
        }}
      />)}

      <CatalogDetailSheet
        open={!!detailTarget}
        onOpenChange={(o) => { if (!o) setDetailTarget(null) }}
        title={detailTarget?.name ?? ""}
        description={`Mã: ${detailTarget?.code ?? ""}`}
        active={detailTarget?.active ?? false}
        rows={[
          { label: "Mã khoa", value: detailTarget?.code, mono: true },
          { label: "Tên khoa", value: detailTarget?.name },
          { label: "Loại khoa", value: detailTarget ? DEPARTMENT_TYPE_LABELS[detailTarget.departmentType] : "" },
        ]}
        createdAt={detailTarget?.createdAt ?? null}
        updatedAt={detailTarget?.updatedAt ?? null}
        actions={
          <>
            {detailTarget && canUpdate && <Button variant="outline" size="sm" onClick={() => { setEditTarget(detailTarget); setFormOpen(true) }}><Edit3 className="size-3.5" />Sửa</Button>}
            {detailTarget?.active && canDeactivate && <Button variant="outline" size="sm" onClick={() => setStatusTarget({ dept: detailTarget, mode: "deactivate" })}><Trash2 className="size-3.5" />Ngừng sử dụng</Button>}
            {detailTarget && !detailTarget.active && canReactivate && <Button size="sm" onClick={() => setStatusTarget({ dept: detailTarget, mode: "reactivate" })}><PlayCircle className="size-3.5" />Bật lại</Button>}
          </>
        }
      />

      {statusTarget && (
        <CatalogStatusDialog
          isReloading={loadRecord.isPending}
          error={deactivate.error ?? reactivate.error}
          onReload={async () => {
            const saved = await loadRecord.mutateAsync(statusTarget.dept.id)
            deactivate.reset()
            reactivate.reset()
            setStatusTarget({ dept: saved, mode: statusTarget.mode })
            if (detailTarget?.id === saved.id) setDetailTarget(saved)
          }}
          open
          onOpenChange={(o) => { if (!o && !loadRecord.isPending) { setStatusTarget(null); deactivate.reset(); reactivate.reset() } }}
          mode={statusTarget.mode}
          entityLabel="khoa"
          entityName={statusTarget.dept.name}
          extraDescription={statusTarget.mode === "deactivate" ? "Cần xử lý các phòng và dịch vụ thuộc khoa này trước khi ngừng sử dụng." : undefined}
          isPending={deactivate.isPending || reactivate.isPending}
          onConfirm={() => void handleStatusConfirm()}
        />
      )}
    </>
  )
}
