"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, StatusPill } from "@/shared/ui"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { PermissionModuleGroup } from "../utils/role-permission-draft"

interface RolePermissionTableProps {
  /** Groups to show, already filtered by the search and "show granted only". */
  groups: PermissionModuleGroup[]
  /** Every permission of each module, for the module counts and the module checkbox. */
  moduleCodes: ReadonlyMap<string, readonly string[]>
  isLoading?: boolean
  /** No checkbox can change: no permission to assign, inactive role or a save in progress. */
  readOnly?: boolean
  /** Shows every group open, for example while searching, so no match stays hidden. */
  forceExpanded?: boolean
  isGranted: (code: string) => boolean
  pendingChange: (code: string) => "grant" | "revoke" | null
  isLocked: (code: string) => boolean
  onChange: (codes: readonly string[], checked: boolean) => void
}

/**
 * Permissions of the Role Permissions screen (SRS 1.3.4 [4] and [5]), one card per module so the
 * groups stand apart. A module header grants or removes every shown permission of the module that
 * is not locked, and can fold the module away.
 */
export function RolePermissionTable({
  groups,
  moduleCodes,
  isLoading,
  readOnly,
  forceExpanded,
  isGranted,
  pendingChange,
  isLocked,
  onChange,
}: RolePermissionTableProps) {
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(new Set())

  const toggle = (module: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(module)) next.delete(module)
      else next.add(module)
      return next
    })

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center gap-3 bg-surface-alt px-4 py-3">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            {Array.from({ length: 3 }).map((__, row) => (
              <div key={row} className="flex items-center gap-3 border-t border-border px-4 py-2.5">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-xs text-muted-foreground">Không có kết quả tìm kiếm.</p>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {groups.map((group) => (
        <ModuleCard
          key={group.module}
          group={group}
          allCodes={moduleCodes.get(group.module) ?? []}
          expanded={forceExpanded || !collapsed.has(group.module)}
          canCollapse={!forceExpanded}
          onToggle={() => toggle(group.module)}
          readOnly={readOnly}
          isGranted={isGranted}
          pendingChange={pendingChange}
          isLocked={isLocked}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

function ModuleCard({
  group,
  allCodes,
  expanded,
  canCollapse,
  onToggle,
  readOnly,
  isGranted,
  pendingChange,
  isLocked,
  onChange,
}: {
  group: PermissionModuleGroup
  allCodes: readonly string[]
  expanded: boolean
  canCollapse: boolean
  onToggle: () => void
} & Pick<
  RolePermissionTableProps,
  "readOnly" | "isGranted" | "pendingChange" | "isLocked" | "onChange"
>) {
  const grantedCount = allCodes.filter(isGranted).length
  const allGranted = allCodes.length > 0 && grantedCount === allCodes.length
  // The module checkbox acts on the rows shown: a search or "show granted only" may hide some, and
  // a hidden permission must not change.
  const visibleCodes = group.permissions.map((permission) => permission.code)
  const visibleGranted = visibleCodes.filter(isGranted).length
  const changeable = visibleCodes.filter((code) => !isLocked(code))
  const progress = allCodes.length === 0 ? 0 : Math.round((grantedCount / allCodes.length) * 100)
  const titleId = React.useId()
  const listId = React.useId()

  return (
    <section
      aria-labelledby={titleId}
      data-slot="permission-module"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-3 bg-surface-alt px-4 py-3">
        <Checkbox
          aria-labelledby={titleId}
          checked={visibleGranted === visibleCodes.length}
          indeterminate={visibleGranted > 0 && visibleGranted < visibleCodes.length}
          disabled={readOnly || changeable.length === 0}
          onCheckedChange={(checked) => onChange(changeable, checked === true)}
        />
        <h3 id={titleId} className="text-base font-semibold text-foreground">
          {group.module}
        </h3>
        <span
          className={cn(
            "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-medium tabular-nums",
            allGranted
              ? "bg-status-success-bg text-status-success"
              : "border border-border bg-card text-muted-foreground"
          )}
        >
          {grantedCount}/{allCodes.length} quyền
        </span>
        <span className="flex-1" />
        <span
          aria-hidden="true"
          className="hidden h-1 w-16 overflow-hidden rounded-full bg-muted sm:block"
        >
          <span className="block h-full bg-primary" style={{ width: `${progress}%` }} />
        </span>
        {canCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={listId}
            aria-label={`${expanded ? "Thu gọn" : "Mở rộng"} nhóm ${group.module}`}
            className="size-7 p-0 text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : null}
      </div>

      {expanded ? (
        <ul id={listId} className="divide-y divide-border border-t border-border">
          {group.permissions.map((permission) => {
            const change = pendingChange(permission.code)
            const locked = isLocked(permission.code)
            return (
              <li
                key={permission.code}
                data-slot="permission-row"
                data-pending={change ?? undefined}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-hover/50"
              >
                <Checkbox
                  aria-label={`Cấp quyền ${permission.name}`}
                  checked={isGranted(permission.code)}
                  disabled={readOnly || locked}
                  onCheckedChange={(checked) => onChange([permission.code], checked === true)}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-foreground">{permission.name}</span>
                  {permission.sensitive ? (
                    <StatusPill tone="warning" className="ml-2 align-middle">
                      Nhạy cảm
                    </StatusPill>
                  ) : null}
                  {locked ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Bắt buộc với vai trò Quản trị viên
                    </span>
                  ) : null}
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-medium">
                  {change === "grant" ? (
                    <span className="text-status-success">+ Cấp</span>
                  ) : change === "revoke" ? (
                    <span className="text-status-danger">− Gỡ</span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
