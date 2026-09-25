import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
} from "@hugeicons/core-free-icons"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  href?: string
} & React.ComponentProps<typeof Button>

function PaginationLink({
  className,
  isActive,
  size = "icon",
  variant,
  href,
  disabled,
  ...props
}: PaginationLinkProps) {
  const resolvedVariant = variant ?? (isActive ? "default" : "ghost")

  const linkClasses = cn(
    "cursor-pointer select-none text-xs transition-colors rounded-lg",
    size === "icon" && "size-8 min-w-8 p-0 font-medium",
    isActive
      ? "bg-primary text-primary-foreground font-semibold border border-transparent shadow-xs hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground"
      : "text-secondary-foreground hover:text-foreground hover:bg-surface-alt font-normal",
    disabled && "cursor-not-allowed opacity-50 pointer-events-none text-muted-foreground",
    className
  )

  if (href) {
    return (
      <Button
        variant={resolvedVariant}
        size={size}
        disabled={disabled}
        className={linkClasses}
        nativeButton={false}
        render={
          <a
            href={href}
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
          />
        }
        {...props}
      />
    )
  }

  return (
    <Button
      type="button"
      variant={resolvedVariant}
      size={size}
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={linkClasses}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  text = "Trang trước",
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Trang trước"
      size="default"
      variant="ghost"
      className={cn(
        "h-8 gap-1.5 px-2 text-xs font-normal text-secondary-foreground hover:text-foreground hover:bg-surface-alt cursor-pointer disabled:text-muted-foreground disabled:opacity-50 disabled:pointer-events-none mr-1.5",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <HugeiconsIcon
            icon={ChevronLeftIcon}
            strokeWidth={2}
            className="size-3.5"
            data-icon="inline-start"
          />
          <span className="hidden sm:inline">{text}</span>
        </>
      )}
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Trang sau",
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Trang sau"
      size="default"
      variant="ghost"
      className={cn(
        "h-8 gap-1.5 px-2 text-xs font-normal text-secondary-foreground hover:text-foreground hover:bg-surface-alt cursor-pointer disabled:text-muted-foreground disabled:opacity-50 disabled:pointer-events-none ml-1.5",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="hidden sm:inline">{text}</span>
          <HugeiconsIcon
            icon={ChevronRightIcon}
            strokeWidth={2}
            className="size-3.5"
            data-icon="inline-end"
          />
        </>
      )}
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
