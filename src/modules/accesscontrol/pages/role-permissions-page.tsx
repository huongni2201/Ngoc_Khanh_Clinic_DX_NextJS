"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  Info,
  Loader2,
  Lock,
  PageHeader,
  RefreshCw,
  ScreenLayout,
  SearchField,
  ShieldCheck,
  toast,
} from "@/shared/ui"
import { RolePermissionTable } from "../components/role-permission-table"
import { usePermissions } from "../hooks/use-permissions"
import {
  usePermissionCatalog,
  useRolePermissions,
  useRoles,
  useUpdateRolePermissions,
} from "../hooks/use-roles"
import { PERMISSION } from "../permissions"
import { toDisplayCatalog } from "../utils/permission-labels"
import { rolePermissionsErrorMessage } from "../utils/role-errors"
import { roleDisplayName } from "../utils/role-labels"
import {
  EMPTY_DRAFT,
  filterPermissions,
  groupByModule,
  hasPendingChanges,
  isGrantedAfterSave,
  isProtectedPermission,
  pendingChangeOf,
  rebaseDraft,
  setPermissions,
  type RolePermissionDraft,
} from "../utils/role-permission-draft"

/**
 * Role Permissions (SRS UC-009, 1.3.4): grant or remove the predefined permissions of one role.
 * Pending changes are kept per role, so switching roles keeps the unsaved changes of the previous
 * one until they are saved or discarded (2-AF-02). Saving applies the selected role only.
 */
export function RolePermissionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can, canAll } = usePermissions()
  const canView = canAll(PERMISSION.ROLE_PERMISSION_VIEW, PERMISSION.PERMISSION_VIEW)
  const canListRoles = can(PERMISSION.ROLE_MANAGE)
  const canAssign = can(PERMISSION.ROLE_PERMISSION_ASSIGN)

  const roleId = searchParams?.get("roleId") || undefined
  const [search, setSearch] = React.useState("")
  const [grantedOnly, setGrantedOnly] = React.useState(false)
  const [drafts, setDrafts] = React.useState<Record<string, RolePermissionDraft>>({})

  const rolesQuery = useRoles({ pageSize: 100 }, canView && canListRoles)
  const catalogQuery = usePermissionCatalog(canView)
  const rolePermissionsQuery = useRolePermissions(canView ? roleId : undefined)
  const saveMutation = useUpdateRolePermissions()

  const roles = React.useMemo(() => rolesQuery.data?.data ?? [], [rolesQuery.data])
  const catalog = React.useMemo(() => toDisplayCatalog(catalogQuery.data ?? []), [catalogQuery.data])
  const selectedRole = roles.find((role) => role.id === roleId)
  const saved = rolePermissionsQuery.data
  const granted = React.useMemo<ReadonlySet<string>>(
    () => new Set(saved?.permissionCodes ?? []),
    [saved]
  )
  const draft = (roleId && drafts[roleId]) || EMPTY_DRAFT
  const roleCode = saved?.roleCode ?? selectedRole?.code ?? ""
  const readOnly = !canAssign || !saved || !saved.active || saveMutation.isPending

  // Changes another user already made are no longer pending (adjusted while rendering).
  const [rebasedFor, setRebasedFor] = React.useState(saved)
  if (saved !== rebasedFor) {
    setRebasedFor(saved)
    if (saved && drafts[saved.roleId]) {
      const rebased = rebaseDraft(drafts[saved.roleId], new Set(saved.permissionCodes))
      if (rebased !== drafts[saved.roleId]) setDrafts({ ...drafts, [saved.roleId]: rebased })
    }
  }

  const anyPending = Object.values(drafts).some(hasPendingChanges)
  React.useEffect(() => {
    if (!anyPending) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [anyPending])

  const isGranted = React.useCallback(
    (code: string) => isGrantedAfterSave(draft, granted, code),
    [draft, granted]
  )
  const groups = React.useMemo(
    () => groupByModule(filterPermissions(catalog, search, grantedOnly ? isGranted : null)),
    [catalog, search, grantedOnly, isGranted]
  )
  const moduleCodes = React.useMemo(
    () =>
      new Map(
        groupByModule(catalog).map((group) => [
          group.module,
          group.permissions.map((permission) => permission.code),
        ])
      ),
    [catalog]
  )

  const selectRole = (nextRoleId: string | null) => {
    if (!nextRoleId) return
    saveMutation.reset()
    const query = new URLSearchParams(Array.from(searchParams?.entries() || []))
    query.set("roleId", nextRoleId)
    router.replace(`${pathname}?${query.toString()}`)
  }

  const change = (codes: readonly string[], checked: boolean) => {
    if (!roleId || readOnly) return
    setDrafts((current) => ({
      ...current,
      [roleId]: setPermissions(current[roleId] ?? EMPTY_DRAFT, granted, codes, checked),
    }))
  }

  const discard = () => {
    if (!roleId) return
    saveMutation.reset()
    setDrafts((current) => {
      const next = { ...current }
      delete next[roleId]
      return next
    })
  }

  const save = async () => {
    if (!roleId || !saved || !hasPendingChanges(draft)) return
    try {
      await saveMutation.mutateAsync({
        roleId,
        input: {
          rowVersion: saved.rowVersion,
          grant: [...draft.grant],
          revoke: [...draft.revoke],
        },
      })
      setDrafts((current) => {
        const next = { ...current }
        delete next[roleId]
        return next
      })
      toast.success(
        `Đã lưu quyền của vai trò ${selectedRole ? roleDisplayName(selectedRole) : ""}: cấp ${draft.grant.size}, gỡ ${draft.revoke.size}.`
      )
    } catch {
      // The error is rendered above the grid; the pending changes are kept.
    }
  }

  const reload = async () => {
    saveMutation.reset()
    await Promise.all([rolePermissionsQuery.refetch(), rolesQuery.refetch()])
  }

  const roleItems = roles.map((role) => {
    const pending = hasPendingChanges(drafts[role.id]) ? " • chưa lưu" : ""
    return {
      value: role.id,
      label: `${roleDisplayName(role)} (${role.permissionCount} / ${catalog.length} quyền · ${role.userCount} người dùng)${pending}`,
    }
  })

  return (
    <ScreenLayout data-slot="role-permissions-page">
      <PageHeader
        breadcrumbs={[{ label: "Quản trị" }, { label: "Phân quyền vai trò" }]}
        title="Phân quyền vai trò"
        description="Cấp hoặc gỡ các quyền có sẵn của hệ thống cho từng vai trò"
      />

      {!canView ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <Lock aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          Tài khoản của bạn chưa được cấp quyền xem quyền của vai trò. Nếu vừa được cấp quyền, hãy đăng
          nhập lại.
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-clip rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center">
            <Select
              items={roleItems}
              value={roleId ?? null}
              onValueChange={(value) => selectRole(value as string | null)}
              disabled={!canListRoles || rolesQuery.isLoading}
            >
              <SelectTrigger
                aria-label="Vai trò"
                className="h-8.5 w-full border-border bg-card text-xs lg:w-96"
              >
                <SelectValue placeholder={rolesQuery.isLoading ? "Đang tải vai trò..." : "Chọn vai trò"} />
              </SelectTrigger>
              <SelectContent>
                {roleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên quyền..."
              label="Tìm quyền"
              maxLength={100}
              className="lg:max-w-sm"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="role-permissions-granted-only"
                checked={grantedOnly}
                onCheckedChange={(checked) => setGrantedOnly(checked === true)}
              />
              <Label
                htmlFor="role-permissions-granted-only"
                className="whitespace-nowrap text-xs font-medium text-foreground"
              >
                Chỉ hiện quyền đã cấp
              </Label>
            </div>
          </div>

          {catalogQuery.isError || rolePermissionsQuery.isError || rolesQuery.isError ? (
            <div
              role="alert"
              className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
            >
              <span className="flex items-center gap-2">
                <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                Không thể tải quyền của vai trò.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void Promise.all([catalogQuery.refetch(), reload()])
                }
              >
                <RefreshCw className="size-3.5" />
                Thử lại
              </Button>
            </div>
          ) : !roleId ? (
            <div className="py-16 text-center">
              <ShieldCheck aria-hidden="true" className="mx-auto mb-3 size-9 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Chọn vai trò để phân quyền</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                Các quyền được nhóm theo module. Thay đổi có hiệu lực từ lần đăng nhập tiếp theo của
                người dùng.
              </p>
            </div>
          ) : (
            <>
              {saved && !saved.active ? (
                <p className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  Vai trò đang ngừng hoạt động nên không thể thay đổi quyền. Kích hoạt lại vai trò ở màn
                  Vai trò trước.
                </p>
              ) : null}
              {saveMutation.error ? (
                <div
                  role="alert"
                  className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-3 text-xs text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-destructive" />
                    {rolePermissionsErrorMessage(saveMutation.error)}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => void reload()}>
                    <RefreshCw className="size-3.5" />
                    Tải lại
                  </Button>
                </div>
              ) : null}

              <div className="flex-1">
                <RolePermissionTable
                  groups={groups}
                  moduleCodes={moduleCodes}
                  isLoading={catalogQuery.isLoading || rolePermissionsQuery.isLoading}
                  readOnly={readOnly}
                  forceExpanded={search.trim() !== "" || grantedOnly}
                  isGranted={isGranted}
                  pendingChange={(code) => pendingChangeOf(draft, code)}
                  isLocked={(code) => isProtectedPermission(roleCode, code, granted)}
                  onChange={change}
                />
              </div>

              {/* Offsets the bottom padding of the scrolling main area, so no row shows below the bar. */}
              <div className="sticky -bottom-5 z-10 flex flex-col gap-2 rounded-b-lg border-t border-border bg-card px-4 py-3 sm:-bottom-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  Thay đổi chờ lưu:{" "}
                  <span className="font-semibold tabular-nums text-status-success">
                    {draft.grant.size}
                  </span>{" "}
                  cấp ·{" "}
                  <span className="font-semibold tabular-nums text-status-danger">
                    {draft.revoke.size}
                  </span>{" "}
                  gỡ
                </p>
                {canAssign ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={discard}
                      disabled={!hasPendingChanges(draft) || saveMutation.isPending}
                    >
                      Huỷ thay đổi
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void save()}
                      disabled={!hasPendingChanges(draft) || readOnly}
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu quyền"
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}
    </ScreenLayout>
  )
}
