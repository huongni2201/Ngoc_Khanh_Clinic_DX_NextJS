"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Add01Icon, Door01Icon } from "@hugeicons/core-free-icons"
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
import {
  useRooms,
  useDeactivateRoom,
  useReactivateRoom,
} from "../../hooks/management/use-catalog-management"
import { CatalogParentFilter } from "../../components/management/catalog-parent-filter"
import { CatalogListLayout } from "../../components/management/catalog-list-layout"
import { CatalogDetailSheet } from "../../components/management/catalog-detail-sheet"
import { CatalogStatusDialog } from "../../components/management/catalog-status-dialog"
import { RoomFormDialog } from "../../components/management/forms/room-form-dialog"
import {
  CATALOG_PERMISSIONS,
  parsePageParam,
  parseSizeParam,
  parseActiveParam,
  catalogErrorMessage,
  roomTypeLabel,
} from "../../utils/management/catalog-management-utils"
import { useLoadRoom } from "../../hooks/management/use-catalog-management"
import { toast } from "@/shared/ui/toaster"
import type { Room } from "../../types/management"

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const ICON_BTN = "size-8 rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"

export function RoomManagementPage() {
  const loadRecord = useLoadRoom()
  const session = useCachedUserSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams?.get("q")?.trim() ?? ""
  const page = parsePageParam(searchParams?.get("page"))
  const size = parseSizeParam(searchParams?.get("size"))
  const active = parseActiveParam(searchParams?.get("active"))
  const departmentId = searchParams?.get("departmentId")?.trim() || undefined

  const [editRevision, setEditRevision] = React.useState(0)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Room | null>(null)
  const [detailTarget, setDetailTarget] = React.useState<Room | null>(null)
  const [statusTarget, setStatusTarget] = React.useState<{ item: Room; mode: "deactivate" | "reactivate" } | null>(null)
  const [searchValue, setSearchValue] = React.useState(q)
  const [prevQ, setPrevQ] = React.useState(q)
  if (q !== prevQ) { setPrevQ(q); setSearchValue(q) }

  const canCreate = hasStaffPermission(session, CATALOG_PERMISSIONS.ROOM_CREATE)
  const canUpdate = hasStaffPermission(session, CATALOG_PERMISSIONS.ROOM_UPDATE)
  const canDeactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.ROOM_DEACTIVATE)
  const canReactivate = hasStaffPermission(session, CATALOG_PERMISSIONS.ROOM_REACTIVATE)
  const canDetailView = hasStaffPermission(session, CATALOG_PERMISSIONS.ROOM_DETAIL_VIEW)

  const updateUrl = React.useCallback((params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() ?? []))
    Object.entries(params).forEach(([k, v]) => { if (!v) current.delete(k); else current.set(k, v) })
    if (params.page === undefined && (params.q !== undefined || params.size !== undefined || params.active !== undefined || params.departmentId !== undefined)) {
      current.set("page", "1")
    }
    router.replace(`${pathname}?${current.toString()}`)
  }, [router, pathname, searchParams])

  React.useEffect(() => {
    const t = setTimeout(() => { if (searchValue !== q) updateUrl({ q: searchValue }) }, 300)
    return () => clearTimeout(t)
  }, [searchValue, q, updateUrl])

  const { data, isLoading, isError, error, refetch } = useRooms({
    q,
    page,
    size,
    active,
    departmentId,
    sortKey: "code",
    sortBy: "ASC",
  })

  React.useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) {
      updateUrl({ page: String(Math.max(1, data.totalPages)) })
    }
  }, [data, page, updateUrl])

  const deactivate = useDeactivateRoom(statusTarget?.item.id ?? "")
  const reactivate = useReactivateRoom(statusTarget?.item.id ?? "")

  const handleStatusConfirm = async () => {
    if (!statusTarget) return
    try {
      if (statusTarget.mode === "deactivate") {
        await deactivate.mutateAsync(statusTarget.item.rowVersion)
        toast.success(`Đã ngừng sử dụng phòng ${statusTarget.item.name}.`)
      } else {
        await reactivate.mutateAsync(statusTarget.item.rowVersion)
        toast.success(`Đã bật lại phòng ${statusTarget.item.name}.`)
      }
      setStatusTarget(null)
      if (detailTarget?.id === statusTarget.item.id) setDetailTarget(null)
    } catch (err) { toast.error(catalogErrorMessage(err, "phòng")) }
  }

  const items = data?.items ?? []
  const hasFilter = Boolean(q || active !== null || departmentId)
  const isEmpty = !isLoading && items.length === 0

  return (
    <>
      <CatalogListLayout
        breadcrumbs={[{ label: "Quản lý danh mục", href: "/admin/catalog/departments" }, { label: "Phòng" }]}
        title="Phòng"
        description="Quản lý danh mục phòng của phòng khám"
        actions={canCreate ? (
          <Button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />Thêm phòng
          </Button>
        ) : undefined}
        searchValue={searchValue} searchPlaceholder="Tìm theo mã, tên phòng..."
        onSearchChange={setSearchValue}
        hasActiveFilters={hasFilter}
        onResetFilters={() => updateUrl({ q: "", active: "", departmentId: "" })}
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
                Khoa
              </label>
              <CatalogParentFilter
                kind="department"
                value={departmentId}
                onChange={(value) => updateUrl({ departmentId: value ?? "" })}
              />
            </div>
          </>
        }
        totalItems={data?.totalElements ?? 0} entityLabel="phòng"
        isLoading={isLoading} isError={isError} error={error} onRetry={() => void refetch()}
        currentPage={data?.page ?? page} pageSize={data?.pageSize ?? size} totalPages={data?.totalPages ?? 1}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ size: String(s) })}
      >
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
              <TableHead className={`${HEAD_CLASS} w-[12%]`}>Mã</TableHead>
              <TableHead className={`${HEAD_CLASS} flex-1`}>Tên phòng</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[20%]`}>Khoa</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[15%]`}>Loại phòng</TableHead>
              <TableHead className={`${HEAD_CLASS} w-[14%]`}>Trạng thái</TableHead>
              <TableHead className={`${HEAD_CLASS} w-16 text-right`}><span className="sr-only">Thao tác</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[100px]" /></TableCell>
                ))}
              </TableRow>
            )) : isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <HugeiconsIcon
                    icon={Door01Icon}
                    aria-hidden="true"
                    className="mx-auto mb-3 size-9 text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    {hasFilter ? "Không tìm thấy phòng phù hợp" : "Chưa có phòng nào"}
                  </p>
                  <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                    {hasFilter
                      ? "Thử đổi từ khóa hoặc bộ lọc tra cứu."
                      : "Thêm phòng đầu tiên để bắt đầu thiết lập phòng khám."}
                  </p>
                  {hasFilter && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateUrl({ q: "", active: "", departmentId: "" })}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                  {!hasFilter && canCreate && (
                    <Button type="button" onClick={() => setFormOpen(true)}>
                      <HugeiconsIcon icon={Add01Icon} className="size-4" />
                      Thêm phòng
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : items.map((room) => (
              <TableRow key={room.id} className="group cursor-pointer" onClick={() => canDetailView && setDetailTarget(room)}>
                <TableCell className="px-4 py-3 font-mono text-xs text-secondary-foreground">{room.code}</TableCell>
                <TableCell className="px-4 py-3 text-sm font-medium text-foreground">{room.name}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-secondary-foreground">{room.departmentName}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-secondary-foreground">{roomTypeLabel(room.roomType)}</TableCell>
                <TableCell className="px-4 py-3"><StatusPill tone={room.active ? "success" : "neutral"}>{room.active ? "Đang sử dụng" : "Ngừng sử dụng"}</StatusPill></TableCell>
                <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {canDetailView && <Button variant="outline" size="sm" className={ICON_BTN} title="Xem chi tiết" aria-label={`Xem ${room.name}`} onClick={() => setDetailTarget(room)}><Eye className="size-3.5" /></Button>}
                    {canUpdate && <Button variant="outline" size="sm" className={ICON_BTN} title="Chỉnh sửa" aria-label={`Sửa ${room.name}`} onClick={() => { setEditTarget(room); setFormOpen(true) }}><Edit3 className="size-3.5" /></Button>}
                    {room.active && canDeactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Ngừng sử dụng" aria-label={`Ngừng ${room.name}`} onClick={() => setStatusTarget({ item: room, mode: "deactivate" })}><Trash2 className="size-3.5" /></Button>}
                    {!room.active && canReactivate && <Button variant="outline" size="sm" className={ICON_BTN} title="Bật lại" aria-label={`Bật lại ${room.name}`} onClick={() => setStatusTarget({ item: room, mode: "reactivate" })}><PlayCircle className="size-3.5" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CatalogListLayout>

      {formOpen && (
        <RoomFormDialog
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
          room={editTarget ?? undefined}
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
        rows={[
          { label: "Mã phòng", value: detailTarget?.code, mono: true },
          { label: "Tên phòng", value: detailTarget?.name },
          { label: "Khoa", value: detailTarget?.departmentName },
          { label: "Loại phòng", value: roomTypeLabel(detailTarget?.roomType) },
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
          mode={statusTarget.mode} entityLabel="phòng" entityName={statusTarget.item.name}
          isPending={deactivate.isPending || reactivate.isPending} onConfirm={() => void handleStatusConfirm()} />
      )}
    </>
  )
}
