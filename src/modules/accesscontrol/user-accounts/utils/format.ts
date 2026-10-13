/** `0912345678` → `0912 345 678`; other values are returned unchanged. */
export function formatMobileNumber(value: string | undefined): string | undefined {
  if (!value) return value
  return /^\d{10}$/.test(value)
    ? `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`
    : value
}

/** LocalDate `yyyy-MM-dd` → `dd/MM/yyyy`, formatted only for display. */
export function formatLocalDate(value: string | undefined): string | undefined {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

/** Up to two initials of a Vietnamese full name, e.g. `Nguyễn Văn A` → `NA`. */
export function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  const first = words[0][0] ?? ""
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}
