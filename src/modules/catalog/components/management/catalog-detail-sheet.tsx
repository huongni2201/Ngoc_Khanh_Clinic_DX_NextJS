"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { StatusPill } from "@/shared/ui"
import { InfoList, type InfoListItem } from "@/shared/ui/info-list"
import { formatTimestamp } from "../../utils/management/catalog-management-utils"

export interface DetailRow {
  label: string
  value: React.ReactNode
  mono?: boolean
}

export interface CatalogDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  active: boolean
  rows: DetailRow[]
  createdAt: string | null
  updatedAt: string | null
  actions?: React.ReactNode
}

/**
 * Right-side sheet showing full detail of a catalog record.
 * Used by all 5 resource types. Inherits InfoList for consistent, semantic presentation.
 */
export function CatalogDetailSheet({
  open,
  onOpenChange,
  title,
  description,
  active,
  rows,
  createdAt,
  updatedAt,
  actions,
}: CatalogDetailSheetProps) {
  const mainItems: InfoListItem[] = rows.map((row) => ({
    label: row.label,
    mono: row.mono,
    value: <p>{row.value ?? "—"}</p>,
  }))

  const auditItems: InfoListItem[] = [
    {
      label: "Ngày tạo",
      mono: true,
      value: <p>{formatTimestamp(createdAt)}</p>,
    },
    {
      label: "Cập nhật lần cuối",
      mono: true,
      value: <p>{formatTimestamp(updatedAt)}</p>,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border pl-6 pr-14 pb-4 pt-6 text-left">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <SheetTitle className="text-base font-bold leading-tight text-foreground">
                {title}
              </SheetTitle>
              <StatusPill tone={active ? "success" : "neutral"}>
                {active ? "Đang sử dụng" : "Ngừng sử dụng"}
              </StatusPill>
            </div>
            {description && (
              <SheetDescription className="text-xs text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <InfoList items={mainItems} />

          <div aria-hidden="true" className="border-t border-border" />

          <InfoList items={auditItems} />
        </div>

        {actions && (
          <div className="shrink-0 border-t border-border px-6 py-4 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
