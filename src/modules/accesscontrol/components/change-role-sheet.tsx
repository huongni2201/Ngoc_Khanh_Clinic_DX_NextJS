"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, Info, Loader2, RefreshCw, SearchField, toast } from "@/shared/ui"
import { useIsMutating } from "@tanstack/react-query"
import { CHANGE_ACCOUNT_ROLE_MUTATION_KEY, useChangeAccountRole } from "../hooks/use-staff-members"
import { usePermissionCatalog, useRolePermissions } from "../hooks/use-roles"
import type { RoleOption, StaffAccount, StaffMember } from "../types/staff-member"
import { toDisplayCatalog } from "../utils/permission-labels"
import { groupByModule } from "../utils/role-permission-draft"
import { changeRoleErrorMessage } from "../utils/staff-member-errors"
import { sortRolesByDisplayName } from "../utils/role-labels"
import { roleLabel } from "../utils/staff-member-labels"

interface ChangeRoleSheetProps {
  /** The staff member whose account changes role; null closes the panel. */
  staffMember: StaffMember | null
  onClose: () => void
  /** Active roles other than PATIENT (GET /api/v1/roles). */
  roles: RoleOption[] | undefined
  rolesLoading: boolean
  rolesError: boolean
  onRetryRoles: () => void
  /** Whether the session may read role permissions, for [View Permissions] (3-AF-01). */
  canViewPermissions: boolean
}

/**
 * Change Role panel (SRS UC-010 Change User Role): the account holds exactly one role, which the
 * Administrator replaces by another active staff role. The new role applies at the next sign-in.
 */
export function ChangeRoleSheet({ staffMember, onClose, ...props }: ChangeRoleSheetProps) {
  const account = staffMember?.account
  // A save in flight keeps the panel open, so its result (or its error) is always shown.
  const saving = useIsMutating({ mutationKey: CHANGE_ACCOUNT_ROLE_MUTATION_KEY }) > 0
  return (
    <Sheet
      open={Boolean(account)}
      onOpenChange={(open) => {
        if (!open && !saving) onClose()
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {staffMember && account ? (
          <ChangeRoleForm
            key={account.id}
            staffMember={staffMember}
            account={account}
            onClose={onClose}
            {...props}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function ChangeRoleForm({
  staffMember,
  account,
  onClose,
  roles,
  rolesLoading,
  rolesError,
  onRetryRoles,
  canViewPermissions,
}: Omit<ChangeRoleSheetProps, "staffMember"> & { staffMember: StaffMember; account: StaffAccount }) {
  const changeRole = useChangeAccountRole()
  const [search, setSearch] = React.useState("")
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null)
  const [showPermissions, setShowPermissions] = React.useState(false)

  const currentRole = roles?.find((role) => role.code === account.roleCode)
  const selectedRole = roles?.find((role) => role.code === selectedCode)
  const keyword = search.trim().toLocaleLowerCase("vi")
  const matching = sortRolesByDisplayName(roles ?? []).filter(
    (role) => !keyword || roleLabel(role.code, role).toLocaleLowerCase("vi").includes(keyword)
  )
  const pending = changeRole.isPending
  const canSave = Boolean(selectedRole) && selectedCode !== account.roleCode && !pending

  const save = async () => {
    if (!selectedRole || selectedRole.code === account.roleCode) return
    try {
      await changeRole.mutateAsync({
        accountId: account.id,
        input: { roleCode: selectedRole.code, rowVersion: account.rowVersion },
      })
      // MSG10
      toast.success(
        `Đã đổi vai trò của ${account.username} thành ${roleLabel(selectedRole.code, selectedRole)}. Thay đổi có hiệu lực từ lần đăng nhập tiếp theo.`
      )
      onClose()
    } catch {
      // Shown above the role list; the selection is kept.
    }
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>Đổi vai trò</SheetTitle>
        <SheetDescription>
          {staffMember.fullName} · <span className="font-mono">{account.username}</span>
        </SheetDescription>
      </SheetHeader>

      <fieldset disabled={pending} className="m-0 min-w-0 flex-1 space-y-4 border-0 px-6 pb-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Vai trò hiện tại</p>
          <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {roleLabel(account.roleCode, currentRole)}
          </span>
        </div>

        {changeRole.error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-border bg-muted p-3 text-xs text-foreground"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-destructive" />
            {changeRoleErrorMessage(changeRole.error, {
              username: account.username,
              roleName: selectedRole ? roleLabel(selectedRole.code, selectedRole) : "đã chọn",
            })}
          </p>
        ) : null}

        <div className="space-y-2">
          <p id="change-role-new-role" className="text-xs font-medium text-foreground">
            Vai trò mới <span className="text-destructive">*</span>
          </p>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên vai trò..."
            label="Tìm vai trò"
            maxLength={100}
          />
          {rolesLoading ? (
            <p className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Đang tải vai trò...
            </p>
          ) : rolesError ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3 text-xs">
              Không thể tải danh sách vai trò.
              <Button type="button" variant="outline" size="sm" onClick={onRetryRoles}>
                <RefreshCw className="size-3.5" />
                Thử lại
              </Button>
            </div>
          ) : matching.length === 0 ? (
            // MSG01
            <p className="py-2 text-xs text-muted-foreground">Không có kết quả tìm kiếm.</p>
          ) : (
            // Native radios, like the role choice of the New Staff Member dialog: arrow keys move the
            // selection and screen readers announce the group.
            <div role="radiogroup" aria-labelledby="change-role-new-role" className="space-y-1.5">
              {matching.map((role) => {
                const id = `change-role-${role.code}`
                const current = role.code === account.roleCode
                return (
                  <label
                    key={role.code}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted/60 has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input
                      id={id}
                      type="radio"
                      name="change-role-new-role"
                      value={role.code}
                      checked={role.code === selectedCode}
                      onChange={() => {
                        setSelectedCode(role.code)
                        setShowPermissions(false)
                        changeRole.reset()
                      }}
                      className="size-4 shrink-0 cursor-pointer accent-primary"
                    />
                    <span className="flex-1 text-foreground">
                      {roleLabel(role.code, role)}
                      {current ? (
                        <span className="ml-1 text-xs text-muted-foreground">(hiện tại)</span>
                      ) : null}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {role.permissionCount} quyền
                    </span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {selectedRole ? (
          <div className="space-y-2 rounded-lg bg-muted/60 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-foreground">
                <span className="font-semibold">{roleLabel(selectedRole.code, selectedRole)}</span>
                {": "}
                <span className="tabular-nums">{selectedRole.permissionCount}</span> quyền
              </span>
              {canViewPermissions ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-primary"
                  aria-expanded={showPermissions}
                  onClick={() => setShowPermissions((shown) => !shown)}
                >
                  {showPermissions ? "Ẩn quyền" : "Xem quyền"}
                </Button>
              ) : null}
            </div>
            {showPermissions ? <RolePermissionList roleId={selectedRole.id} /> : null}
          </div>
        ) : null}

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Người dùng nhận quyền của vai trò mới từ lần đăng nhập tiếp theo.
        </p>
      </fieldset>

      <SheetFooter className="flex-col gap-2 border-t border-border sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          Hủy
        </Button>
        <Button type="button" onClick={() => void save()} disabled={!canSave}>
          {pending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </SheetFooter>
    </div>
  )
}

/** Read-only permissions of the selected role, grouped by module (UC-010 3-AF-01). */
function RolePermissionList({ roleId }: { roleId: string }) {
  const grants = useRolePermissions(roleId)
  const catalog = usePermissionCatalog()
  const groups = React.useMemo(() => {
    const granted = new Set(grants.data?.permissionCodes ?? [])
    return groupByModule(
      toDisplayCatalog(catalog.data ?? []).filter((permission) => granted.has(permission.code))
    )
  }, [grants.data, catalog.data])

  if (grants.isLoading || catalog.isLoading) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Đang tải quyền...
      </p>
    )
  }
  if (grants.isError || catalog.isError) {
    return <p className="text-destructive">Không thể tải quyền của vai trò.</p>
  }
  if (groups.length === 0) {
    return <p className="text-muted-foreground">Vai trò chưa có quyền nào.</p>
  }
  return (
    <div className="space-y-2" aria-label="Quyền của vai trò">
      {groups.map((group) => (
        <div key={group.module}>
          <p className="font-semibold text-foreground">{group.module}</p>
          <ul className="mt-0.5 space-y-0.5 pl-1">
            {group.permissions.map((permission) => (
              <li key={permission.code} className="flex items-start gap-1.5 text-muted-foreground">
                <Check aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-status-success" />
                {permission.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
