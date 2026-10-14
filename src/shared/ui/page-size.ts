/** Page sizes every paginated list offers. The backend caps a page at 100 rows. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export const DEFAULT_PAGE_SIZE: number = PAGE_SIZE_OPTIONS[0]

/**
 * Reads a page size from a URL parameter. Anything that is not one of the offered sizes
 * (missing, malformed, hand-edited) falls back to the default.
 */
export function parsePageSize(
  value: string | null | undefined,
  fallback: number = DEFAULT_PAGE_SIZE
): number {
  const size = Number(value)
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? size : fallback
}
