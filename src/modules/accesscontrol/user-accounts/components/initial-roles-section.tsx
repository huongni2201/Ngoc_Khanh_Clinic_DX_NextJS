"use client"

import { useId } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { isApiErrorStatus } from "@/shared/api/api-client"
import type { AssignableRole } from "../types"
import { roleLabel, roleSummary } from "../utils/role-labels"

/** Role checkboxes of a STAFF account (SRS III.1.2.2 [8]); not rendered for a PATIENT account. */
interface InitialRolesSectionProps {
  roles: AssignableRole[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  selectedRoleIds: string[]
  onChange: (roleIds: string[]) => void
  /** Validation message of the role selection. */
  validationError?: string
}

export function InitialRolesSection({
  roles,
  isLoading,
  error,
  onRetry,
  selectedRoleIds,
  onChange,
  validationError: rolesError,
}: InitialRolesSectionProps) {
  const id = useId()

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Đang tải danh sách vai trò" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {isApiErrorStatus(error, 403)
              ? "Bạn không có quyền xem danh sách vai trò."
              : "Không thể tải danh sách vai trò."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!roles || roles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Chưa có vai trò nào đang hoạt động để gán.
      </p>
    )
  }

  const toggle = (roleId: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedRoleIds.filter((selected) => selected !== roleId), roleId]
        : selectedRoleIds.filter((selected) => selected !== roleId)
    )
  }

  const hintId = `${id}-hint`

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Vai trò ban đầu"
        aria-describedby={hintId}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {roles.map((role) => {
          const checked = selectedRoleIds.includes(role.roleId)
          const labelId = `${id}-${role.roleId}`
          return (
            <label
              key={role.roleId}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors",
                checked
                  ? "border-primary bg-selected ring-1 ring-primary"
                  : "border-border bg-card hover:bg-hover"
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => toggle(role.roleId, value === true)}
                aria-labelledby={labelId}
                aria-invalid={rolesError ? true : undefined}
                className="mt-0.5"
              />
              <span className="min-w-0 flex-1">
                <span id={labelId} className="block text-sm font-semibold text-foreground">
                  {roleLabel(role.code, role.name)}
                </span>
                {roleSummary(role) ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {roleSummary(role)}
                  </span>
                ) : null}
                <span className="mt-2 block font-mono text-[11px] text-muted-foreground">
                  {role.code}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <p id={hintId} className={cn("text-xs", rolesError ? "text-destructive" : "text-muted-foreground")}>
        {rolesError ??
          "Chọn ít nhất một vai trò. Vai trò Bệnh nhân chỉ dành cho tài khoản bệnh nhân."}
      </p>
    </div>
  )
}
