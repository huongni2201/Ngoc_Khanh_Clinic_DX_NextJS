"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Add01Icon, StethoscopeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/shared/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Edit3, PlayCircle, Trash2 } from "@/shared/ui/product-icon"
import { useCachedUserSession, hasStaffPermission } from "@/modules/accesscontrol"
import { useSpecialties, useDeactivateSpecialty, useReactivateSpecialty } from "../../hooks/management/use-catalog-management"
import { CatalogListLayout } from "../../components/management/catalog-list-layout"
import { CatalogDetailSheet } from "../../components/management/catalog-detail-sheet"
import { CatalogStatusDialog } from "../../components/management/catalog-status-dialog"
import { SpecialtyFormDialog } from "../../components/management/forms/specialty-form-dialog"
import {
  CATALOG_PERMISSIONS,
  parsePageParam,
  parseSizeParam,
  parseActiveParam,
  catalogErrorMessage,
} from "../../utils/management/catalog-management-utils"
import { useLoadSpecialty } from "../../hooks/management/use-catalog-management"
import { toast } from "@/shared/ui/toaster"
import type { Specialty } from "../../types/management"

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const ICON_BTN = "size-8 rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"

export function SpecialtyManagementPage() {
  const loadRecord = useLoadSpecialty()
  const session = useCachedUserSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams?.get("q")?.trim() ?? ""
  const page = parsePageParam(searchParams?.get("page"))
  const size = parseSizeParam(searchParams?.get("size"))
  const active = parseActiveParam(searchParams?.get("active"))

  const [editRevision, setEditRevision] = React.useState(0)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Specialty | null>(null)
  const [detailTarget, setDetailTarget] = React.useState<Specialty | null>(null)
  const [statusTarget, setStatusTarget] = React.useState<{ item: Specialty; mode: "deactivate" | "reactivate" } | null>(null)
  const [searchValue, setSearchValue] = React.useState(q)
  const [prevQ, setPrevQ] = React.useState(q)
  if (q !== prevQ) { setPrevQ(q); setSearchValue(q) }

  const canCreate = hasStaffPermission(session, CATALOG_PERMISSIONS.SPECIALTY_CREATE)
  const canUpdate = hasStaffPermission(session, CATALOG_PERMISSIONS.SPECIALTY_UPDATE)
  const canDeactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.SPECIALTY_DEACTIVATE)
  const canReactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.SPECIALTY_REACTIVATE)
  const canDetailView = hasStaffPermission(session, CATALOG_PERMISSIONS.SPECIALTY_DETAIL_VIEW)

  const updateUrl = React.useCallback((params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() ?? []))
    Object.entries(params).forEach(([k, v]) => { if (!v) current.delete(k); else current.set(k, v) })
    if (params.page === undefined && (params.q !== undefined || params.size !== undefined || params.active !== undefined)) {
      current.set("page", "1")
    }
    router.replace(`${pathname}?${current.toString()}`)
  }, [router, pathname, searchParams])

  React.useEffect(() => {
    const t = setTimeout(() => { if (searchValue !== q) updateUrl({ q: searchValue }) }, 300)
    return () => clearTimeout(t)
  }, [searchValue, q, updateUrl])

  const { data, isLoading, isError, error, refetch } = useSpecialties({
    q,
    page,
    size,
    active,
    sortKey: "code",
    sortBy: "ASC",
  })

  React.useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) {
      updateUrl({ page: String(Math.max(1, data.totalPages)) })
    }
  }, [data, page, updateUrl])

  const deactivate = useDeactivateSpecialty(statusTarget?.item.id ?? "")
  const reactivate = useReactivateSpecialty(statusTarget?.item.id ?? "")

  const handleStatusConfirm = async () => {
    if (!statusTarget) return
    try {
      if (statusTarget.mode === "deactivate") {
        await deactivate.mutateAsync(statusTarget.item.rowVersion)
        toast.success(`Đã ngừng sử dụng chuyên khoa ${statusTarget.item.name}.`)
      } else {
        await reactivate.mutateAsync(statusTarget.item.rowVersion)
        toast.success(`Đã bật lại chuyên khoa ${statusTarget.item.name}.`)
      }
      setStatusTarget(null)
      if (detailTarget?.id === statusTarget.item.id) setDetailTarget(null)
    } catch (err) { toast.error(catalogErrorMessage(err, "chuyên khoa")) }
  }

  const items = data?.items ?? []
  const hasFilter = Boolean(q || active !== null)
  const isEmpty = !isLoading && items.length === 0

  return (
    <>
      <CatalogListLayout
        breadcrumbs={[{ label: "Quản lý danh mục", href: "/admin/catalog/departments" }, { label: "Chuyên khoa" }]}
        title="Chuyên khoa"
        description="Quản lý danh mục chuyên khoa của phòng khám"
        actions={canCreate ? (
          <Button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />Thêm chuyên khoa
          </Button>
        ) : undefined}
        searchValue={searchValue}
        searchPlaceholder="Tìm theo mã, tên chuyên khoa..."
        onSearchChange={setSearchValue}
        hasActiveFilters={hasFilter}
        onResetFilters={() => updateUrl({ q: "", active: "" })}
        filterSlot={
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
        }
        totalItems={data?.totalElements ?? 0}
        entityLabel="chuyên khoa"
        isLoading={isLoading} isError={isError} error={error}
        onRetry={() => void refetch()}
        currentPage={data?.page ?? page} pageSize={data?.pageSize ?? size}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onPageSizeChange={(s) => updateUrl({ size: String(s) })}
      >
        <Table className="min-w-[28rem]">
          <TableHeader>
            <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
              <TableHead className={`${HEAD_CLASS} w-[20%]`}>Mã</TableHead>
              <TableHead className={`${HEAD_CLASS} flex-1`}>Tên chuyên khoa</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[18%]`}>Trạng thái</TableHead>
              <TableHead className={`${HEAD_CLASS} w-16 text-right`}><span className="sr-only">Thao tác</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="ml-auto h-8 w-16 rounded-lg" /></TableCell>
              </TableRow>
            )) : isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-16 text-center">
                  <HugeiconsIcon
                    icon={StethoscopeIcon}
                    aria-hidden="true"
                    className="mx-auto mb-3 size-9 text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    {hasFilter ? "Không tìm thấy chuyên khoa phù hợp" : "Chưa có chuyên khoa nào"}
                  </p>
                  <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                    {hasFilter
                      ? "Thử đổi từ khóa hoặc bộ lọc tra cứu."
                      : "Thêm chuyên khoa đầu tiên để bắt đầu thiết lập phòng khám."}
                  </p>
                  {hasFilter && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateUrl({ q: "", active: "" })}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                  {!hasFilter && canCreate && (
                    <Button type="button" onClick={() => setFormOpen(true)}>
                      <HugeiconsIcon icon={Add01Icon} className="size-4" />
                      Thêm chuyên khoa
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : items.map((spec) => (
              <TableRow key={spec.id} className="group cursor-pointer" onClick={() => canDetailView && setDetailTarget(spec)}>
                <TableCell className="px-4 py-3 font-mono text-xs text-secondary-foreground">{spec.code}</TableCell>
                <TableCell className="px-4 py-3 text-sm font-medium text-foreground">{spec.name}</TableCell>
                <TableCell className="px-4 py-3"><StatusPill tone={spec.active ? "success" : "neutral"}>{spec.active ? "Đang sử dụng" : "Ngừng sử dụng"}</StatusPill></TableCell>
                <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {canDetailView && <Button variant="outline" size="sm" className={ICON_BTN} title="Xem chi tiết" aria-label={`Xem ${spec.name}`} onClick={() => setDetailTarget(spec)}><Eye className="size-3.5" /></Button>}
                    {canUpdate && <Button variant="outline" size="sm" className={ICON_BTN} title="Chỉnh sửa" aria-label={`Sửa ${spec.name}`} onClick={() => { setEditTarget(spec); setFormOpen(true) }}><Edit3 className="size-3.5" /></Button>}
                    {spec.active && canDeactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Ngừng sử dụng" aria-label={`Ngừng ${spec.name}`} onClick={() => setStatusTarget({ item: spec, mode: "deactivate" })}><Trash2 className="size-3.5" /></Button>}
                    {!spec.active && canReactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Bật lại" aria-label={`Bật lại ${spec.name}`} onClick={() => setStatusTarget({ item: spec, mode: "reactivate" })}><PlayCircle className="size-3.5" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CatalogListLayout>

      {formOpen && (
        <SpecialtyFormDialog
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
          specialty={editTarget ?? undefined}
          onSuccess={(saved) => {
            setEditTarget(null)
            if (saved && detailTarget && saved.id === detailTarget.id) {
              setDetailTarget(saved)
            }
          }}
        />
      )}

      <CatalogDetailSheet
        open={!!detailTarget} onOpenChange={(o) => { if (!o) setDetailTarget(null) }}
        title={detailTarget?.name ?? ""} description={`Mã: ${detailTarget?.code ?? ""}`}
        active={detailTarget?.active ?? false}
        rows={[{ label: "Mã chuyên khoa", value: detailTarget?.code, mono: true }, { label: "Tên chuyên khoa", value: detailTarget?.name }]}
        createdAt={detailTarget?.createdAt ?? null} updatedAt={detailTarget?.updatedAt ?? null}
        actions={
          <>
            {detailTarget && canUpdate && <Button variant="outline" size="sm" onClick={() => { setEditTarget(detailTarget); setFormOpen(true) }}><Edit3 className="size-3.5" />Sửa</Button>}
            {detailTarget?.active && canDeactivate && <Button variant="outline" size="sm" onClick={() => setStatusTarget({ item: detailTarget, mode: "deactivate" })}><Trash2 className="size-3.5" />Ngừng sử dụng</Button>}
            {detailTarget && !detailTarget.active && canReactivate && <Button size="sm" onClick={() => setStatusTarget({ item: detailTarget, mode: "reactivate" })}><PlayCircle className="size-3.5" />Bật lại</Button>}
          </>
        }
      />

      {statusTarget && (
        <CatalogStatusDialog
          isReloading={loadRecord.isPending}
          error={deactivate.error ?? reactivate.error}
          onReload={async () => {
            const saved = await loadRecord.mutateAsync(statusTarget.item.id)
            deactivate.reset()
            reactivate.reset()
            setStatusTarget({ item: saved, mode: statusTarget.mode })
            if (detailTarget?.id === saved.id) setDetailTarget(saved)
          }} open onOpenChange={(o) => { if (!o && !loadRecord.isPending) { setStatusTarget(null); deactivate.reset(); reactivate.reset() } }}
          mode={statusTarget.mode} entityLabel="chuyên khoa" entityName={statusTarget.item.name}
          isPending={deactivate.isPending || reactivate.isPending} onConfirm={() => void handleStatusConfirm()} />
      )}
    </>
  )
}
