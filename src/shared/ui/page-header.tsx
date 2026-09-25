import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export interface PageBreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  breadcrumbs?: readonly PageBreadcrumbItem[]
  title: ReactNode
  titleAccessory?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  breadcrumbs,
  title,
  titleAccessory,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("min-w-0 space-y-3", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((item, index) => {
              const isCurrent = index === breadcrumbs.length - 1

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  {index > 0 ? (
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  ) : null}
                  {item.href && !isCurrent ? (
                    <Link
                      href={item.href}
                      className="truncate transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "truncate",
                        isCurrent && "font-medium text-foreground"
                      )}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-pretty text-2xl font-semibold leading-[1.25] tracking-tight text-foreground">
              {title}
            </h1>
            {titleAccessory}
          </div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
