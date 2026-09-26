import { Skeleton } from "@/components/ui/skeleton"

export type ScreenLoadingVariant = "list" | "worklist" | "detail" | "encounter"

export interface ScreenLoadingSkeletonProps {
  variant?: ScreenLoadingVariant
}

const actionSkeletonWidths = {
  list: ["w-36"],
  worklist: ["w-32", "w-36"],
  detail: ["w-36", "w-36"],
  encounter: [],
} as const

function HeaderSkeleton({ variant }: { variant: ScreenLoadingVariant }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {actionSkeletonWidths[variant].length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {actionSkeletonWidths[variant].map((width, idx) => (
            <Skeleton key={`${width}-${idx}`} className={`h-9 ${width} rounded-md`} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SummarySkeleton({ variant }: { variant: ScreenLoadingVariant }) {
  if (variant === "detail") {
    return (
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-28 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "encounter") {
    return <Skeleton className="h-44 w-full rounded-lg" />
  }

  if (variant === "worklist") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return null
}

export function ScreenLoadingSkeleton({
  variant = "list",
}: ScreenLoadingSkeletonProps) {
  const showToolbar = variant === "list" || variant === "worklist"

  return (
    <div
      role="status"
      aria-label="Đang tải nội dung…"
      className="w-full space-y-5"
    >
      <HeaderSkeleton variant={variant} />
      <SummarySkeleton variant={variant} />
      {showToolbar ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full max-w-md rounded-md" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      ) : null}
      {variant === "detail" || variant === "encounter" ? (
        <Skeleton className="h-10 w-64 rounded-md" />
      ) : null}
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
