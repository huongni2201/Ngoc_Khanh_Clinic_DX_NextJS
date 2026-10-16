"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Add01Icon, Medicine02Icon } from "@hugeicons/core-free-icons"
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
import { useMedicines, useDeactivateMedicine, useReactivateMedicine } from "../../hooks/management/use-catalog-management"
import { CatalogListLayout } from "../../components/management/catalog-list-layout"
import { CatalogDetailSheet } from "../../components/management/catalog-detail-sheet"
import { CatalogStatusDialog } from "../../components/management/catalog-status-dialog"
import { MedicineFormDialog } from "../../components/management/forms/medicine-form-dialog"
import {
  CATALOG_PERMISSIONS,
  parsePageParam,
  parseSizeParam,
  parseActiveParam,
  catalogErrorMessage,
} from "../../utils/management/catalog-management-utils"
import { useLoadMedicine } from "../../hooks/management/use-catalog-management"
import { toast } from "@/shared/ui/toaster"
import type { Medicine } from "../../types/management"

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const ICON_BTN = "size-8 rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"

export function MedicineManagementPage() {
  const loadRecord = useLoadMedicine()
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
  const [editTarget, setEditTarget] = React.useState<Medicine | null>(null)
  const [detailTarget, setDetailTarget] = React.useState<Medicine | null>(null)
  const [statusTarget, setStatusTarget] = React.useState<{ item: Medicine; mode: "deactivate" | "reactivate" } | null>(null)
  const [searchValue, setSearchValue] = React.useState(q)

  const canCreate = hasStaffPermission(session, CATALOG_PERMISSIONS.MEDICINE_CREATE)
  const canUpdate = hasStaffPermission(session, CATALOG_PERMISSIONS.MEDICINE_UPDATE)
  const canDeactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.MEDICINE_DEACTIVATE)
  const canReactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.MEDICINE_REACTIVATE)
  const canDetailView = hasStaffPermission(session, CATALOG_PERMISSIONS.MEDICINE_DETAIL_VIEW)

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

  const { data, isLoading, isError, error, refetch } = useMedicines({
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

  const deactivate = useDeactivateMedicine(statusTarget?.item.id ?? "")
  const reactivate = useReactivateMedicine(statusTarget?.item.id ?? "")

  const handleStatusConfirm = async () => {
    if (!statusTarget) return
    try {
      if (statusTarget.mode === "deactivate") {
        await deactivate.mutateAsync(statusTarget.item.rowVersion)
        toast.success(`Đã ngừng sử dụng thuốc ${statusTarget.item.genericName}.`)
      } else {
        await reactivate.mutateAsync(statusTarget.item.rowVersion)
        toast.success(`Đã bật lại thuốc ${statusTarget.item.genericName}.`)
      }
      setStatusTarget(null)
      if (detailTarget?.id === statusTarget.item.id) setDetailTarget(null)
    } catch (err) { toast.error(catalogErrorMessage(err, "thuốc")) }
  }

  const items = data?.items ?? []
  const hasFilter = Boolean(q || active !== null)
  const isEmpty = !isLoading && items.length === 0

  return (
    <>
      <CatalogListLayout
        breadcrumbs={[{ label: "Quản lý danh mục", href: "/admin/catalog/departments" }, { label: "Thuốc" }]}
        title="Thuốc"
        description="Quản lý danh mục thuốc của phòng khám"
        actions={canCreate ? (
          <Button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />Thêm thuốc
          </Button>
        ) : undefined}
        searchValue={searchValue} searchPlaceholder="Tìm theo mã, hoạt chất, tên thương mại..."
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
        totalItems={data?.totalElements ?? 0} entityLabel="thuốc"
        isLoading={isLoading} isError={isError} error={error} onRetry={() => void refetch()}
        currentPage={data?.page ?? page} pageSize={data?.pageSize ?? size} totalPages={data?.totalPages ?? 1}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ size: String(s) })}
      >
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
              <TableHead className={`${HEAD_CLASS} w-[10%]`}>Mã</TableHead>
              <TableHead className={`${HEAD_CLASS} flex-1`}>Tên hoạt chất</TableHead>
              <TableHead className={`${HEAD_CLASS} hidden w-[15%] md:table-cell`}>Tên thương mại</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[10%]`}>Hàm lượng</TableHead>
              <TableHead className={`${HEAD_CLASS} hidden w-[12%] lg:table-cell`}>Dạng bào chế</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[8%]`}>Đơn vị</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[13%]`}>Trạng thái</TableHead>
              <TableHead className={`${HEAD_CLASS} w-16 text-right`}><span className="sr-only">Thao tác</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: 8 }).map((__, j) => (
                  <TableCell key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[100px]" /></TableCell>
                ))}
              </TableRow>
            )) : isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-16 text-center">
                  <HugeiconsIcon
                    icon={Medicine02Icon}
                    aria-hidden="true"
                    className="mx-auto mb-3 size-9 text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    {hasFilter ? "Không tìm thấy thuốc phù hợp" : "Chưa có thuốc nào"}
                  </p>
                  <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                    {hasFilter
                      ? "Thử đổi từ khóa hoặc bộ lọc tra cứu."
                      : "Thêm thuốc đầu tiên để bắt đầu thiết lập danh mục thuốc."}
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
                      Thêm thuốc
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : items.map((med) => (
              <TableRow key={med.id} className="group cursor-pointer" onClick={() => canDetailView && setDetailTarget(med)}>
                <TableCell className="px-4 py-3 font-mono text-xs text-secondary-foreground">{med.code}</TableCell>
                <TableCell className="px-4 py-3 text-sm font-medium text-foreground">{med.genericName}</TableCell>
                <TableCell className="hidden px-4 py-3 text-sm text-secondary-foreground md:table-cell">{med.brandName ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-secondary-foreground">{med.strength}</TableCell>
                <TableCell className="hidden px-4 py-3 text-sm text-secondary-foreground lg:table-cell">{med.dosageForm}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-secondary-foreground">{med.unit}</TableCell>
                <TableCell className="px-4 py-3"><StatusPill tone={med.active ? "success" : "neutral"}>{med.active ? "Đang sử dụng" : "Ngừng sử dụng"}</StatusPill></TableCell>
                <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {canDetailView && <Button variant="outline" size="sm" className={ICON_BTN} title="Xem chi tiết" aria-label={`Xem ${med.genericName}`} onClick={() => setDetailTarget(med)}><Eye className="size-3.5" /></Button>}
                    {canUpdate && <Button variant="outline" size="sm" className={ICON_BTN} title="Chỉnh sửa" aria-label={`Sửa ${med.genericName}`} onClick={() => { setEditTarget(med); setFormOpen(true) }}><Edit3 className="size-3.5" /></Button>}
                    {med.active && canDeactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Ngừng sử dụng" aria-label={`Ngừng ${med.genericName}`} onClick={() => setStatusTarget({ item: med, mode: "deactivate" })}><Trash2 className="size-3.5" /></Button>}
                    {!med.active && canReactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Bật lại" aria-label={`Bật lại ${med.genericName}`} onClick={() => setStatusTarget({ item: med, mode: "reactivate" })}><PlayCircle className="size-3.5" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CatalogListLayout>

      {formOpen && (
        <MedicineFormDialog
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
          medicine={editTarget ?? undefined}
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
        title={detailTarget?.genericName ?? ""} description={`Mã: ${detailTarget?.code ?? ""}`}
        active={detailTarget?.active ?? false}
        rows={[
          { label: "Mã thuốc", value: detailTarget?.code, mono: true },
          { label: "Tên hoạt chất", value: detailTarget?.genericName },
          { label: "Tên thương mại", value: detailTarget?.brandName ?? "Không có" },
          { label: "Hàm lượng", value: detailTarget?.strength },
          { label: "Dạng bào chế", value: detailTarget?.dosageForm },
          { label: "Đơn vị tính", value: detailTarget?.unit },
        ]}
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
          mode={statusTarget.mode} entityLabel="thuốc" entityName={statusTarget.item.genericName}
          isPending={deactivate.isPending || reactivate.isPending} onConfirm={() => void handleStatusConfirm()} />
      )}
    </>
  )
}
