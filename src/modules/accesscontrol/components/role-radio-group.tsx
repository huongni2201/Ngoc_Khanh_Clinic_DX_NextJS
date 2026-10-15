"use client"

import type { UseFormRegisterReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "@/shared/ui"
import type { RoleOption } from "../types/staff-member"
import { roleLabel } from "../utils/staff-member-labels"

interface RoleRadioGroupProps {
  roles: RoleOption[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  /** React Hook Form registration of the `roleCode` field. */
  registration: UseFormRegisterReturn
  error?: string
}

/**
 * The one role of a new staff account (an account holds exactly one role), loaded from
 * `GET /api/v1/roles`.
 */
export function RoleRadioGroup({
  roles,
  isLoading,
  isError,
  onRetry,
  registration,
  error,
}: RoleRadioGroupProps) {
  const errorId = "staff-member-role-error"

  return (
    <fieldset
      className="m-0 min-w-0 space-y-2 border-0 p-0"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-2 text-xs font-medium text-foreground">
        Vai trò{" "}
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
        <span className="sr-only">(bắt buộc)</span>
        <span className="ml-1 font-normal text-muted-foreground">(mỗi tài khoản một vai trò)</span>
      </legend>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Đang tải vai trò">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted p-3 text-xs text-foreground"
        >
          Không tải được danh sách vai trò.
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : !roles || roles.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
          Chưa có vai trò nào có thể gán.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {roles.map((role) => {
            const id = `staff-member-role-${role.code}`
            return (
              <label
                key={role.id}
                htmlFor={id}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted has-checked:border-primary"
              >
                <input
                  id={id}
                  type="radio"
                  value={role.code}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
                  {...registration}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {roleLabel(role.code, role)}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {role.code}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      )}

      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
