import * as React from "react"

interface AgreementFormStepHeaderProps {
  /** Step number shown in the badge. Decorative: the title names the section. */
  step: number
  title: string
  headingId: string
  description?: React.ReactNode
  /** Optional control aligned to the right of the heading. */
  aside?: React.ReactNode
}

/** Numbered heading of one step of the agreement form. */
export function AgreementFormStepHeader({
  step,
  title,
  headingId,
  description,
  aside,
}: AgreementFormStepHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 select-none items-center justify-center rounded-md bg-primary text-xs font-semibold tabular-nums text-primary-foreground"
        >
          {step}
        </span>
        <div className="min-w-0">
          <h3 id={headingId} className="text-sm font-semibold leading-6 text-foreground">
            {title}
          </h3>
          {description && (
            <div className="text-xs leading-5 text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {aside}
    </div>
  )
}
