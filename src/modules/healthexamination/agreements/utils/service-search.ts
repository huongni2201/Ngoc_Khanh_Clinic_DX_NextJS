/**
 * Lowercases, trims and strips Vietnamese diacritics so "mau lang" finds "Máu lắng"
 * and "dinh nhom" finds "Định nhóm máu".
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim()
}

/** Every word of the query must appear in the service name or code. An empty query matches all. */
export function matchesServiceQuery(
  item: { name: string; code: string },
  query: string
): boolean {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  const haystack = normalizeSearchText(`${item.name} ${item.code}`)
  return normalizedQuery.split(" ").every((term) => haystack.includes(term))
}

/**
 * Indexes (into `items`) of the rows to show: those matching the query, with the pinned (checked)
 * ones first. Both groups keep their catalog order. The form still addresses rows by original index.
 */
export function orderServiceRows(
  items: ReadonlyArray<{ id: string; name: string; code: string }>,
  query: string,
  pinnedIds: ReadonlySet<string>
): number[] {
  const pinned: number[] = []
  const rest: number[] = []
  items.forEach((item, index) => {
    if (!matchesServiceQuery(item, query)) return
    ;(pinnedIds.has(item.id) ? pinned : rest).push(index)
  })
  return [...pinned, ...rest]
}
