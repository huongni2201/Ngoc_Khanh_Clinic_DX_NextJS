import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface InfoListItem {
  label: string
  /** Empty values render as an em dash so a missing field is visible, not blank. */
  value?: ReactNode
  /** Render the value in the monospace face (codes, tax numbers, phone numbers). */
  mono?: boolean
}

export interface InfoListProps {
  items: readonly InfoListItem[]
  /** `stacked` puts the label above the value (narrow rails); `inline` uses two columns. */
  layout?: "stacked" | "inline"
  className?: string
}

/** Read-only label/value pairs on one semantic `<dl>`. */
export function InfoList({ items, layout = "stacked", className }: InfoListProps) {
  return (
    <dl
      data-slot="info-list"
      className={cn(layout === "inline" ? "divide-y divide-divider" : "space-y-3.5", className)}
    >
      {items.map((item) => {
        const hasValue = item.value !== undefined && item.value !== null && item.value !== ""
        return (
          <div
            key={item.label}
            className={cn(
              layout === "inline" &&
                "grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-4"
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
            <dd
              className={cn(
                "min-w-0 break-words text-sm text-foreground",
                layout === "stacked" && "mt-0.5",
                item.mono && "font-mono text-[13px] tabular-nums",
                !hasValue && "text-muted-foreground"
              )}
            >
              {hasValue ? item.value : "—"}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
