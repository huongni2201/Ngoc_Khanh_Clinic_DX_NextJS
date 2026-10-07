import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger"

const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  info: { pill: "bg-info-bg text-info", dot: "bg-info" },
  success: { pill: "bg-status-success-bg text-status-success", dot: "bg-status-success" },
  warning: { pill: "bg-status-warning-bg text-status-warning", dot: "bg-status-warning" },
  danger: { pill: "bg-status-danger-bg text-status-danger", dot: "bg-status-danger" },
}

export interface StatusPillProps {
  tone?: StatusTone
  children: ReactNode
  className?: string
}

/**
 * Lifecycle status shown as a dot plus a text label, so the state never relies on colour alone.
 * Colours come from the semantic status tokens in globals.css.
 */
export function StatusPill({ tone = "neutral", children, className }: StatusPillProps) {
  const classes = TONE_CLASSES[tone]
  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium",
        classes.pill,
        className
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", classes.dot)} />
      {children}
    </span>
  )
}
