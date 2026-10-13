import type { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface SectionCardProps {
  step: number
  title: string
  titleId: string
  /** Right side of the header, e.g. the selected role counter. */
  aside?: ReactNode
  children: ReactNode
}

/** One numbered step of the create account form. */
export function SectionCard({ step, title, titleId, aside, children }: SectionCardProps) {
  return (
    <Card role="region" aria-labelledby={titleId} className="gap-0 py-0">
      <CardHeader className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5 [.border-b]:pb-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-selected text-xs font-semibold text-primary"
          >
            {step}
          </span>
          <h2
            id={titleId}
            className="truncate text-xs font-semibold uppercase tracking-wide text-secondary-text"
          >
            {title}
          </h2>
        </div>
        {aside ? <div className="shrink-0 text-xs text-muted-foreground">{aside}</div> : null}
      </CardHeader>
      <CardContent className="space-y-5 px-5 py-5">{children}</CardContent>
    </Card>
  )
}
