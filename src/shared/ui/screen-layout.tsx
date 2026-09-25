import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface ScreenLayoutProps {
  children: ReactNode
  className?: string
  "data-slot"?: string
}

/**
 * Standard page canvas for authenticated operational screens.
 * Keeps vertical rhythm and width behavior consistent without owning domain logic.
 */
export function ScreenLayout({
  children,
  className,
  "data-slot": dataSlot = "screen-layout",
}: ScreenLayoutProps) {
  return (
    <div
      data-slot={dataSlot}
      className={cn("flex min-w-0 w-full flex-1 flex-col gap-5", className)}
    >
      {children}
    </div>
  )
}
