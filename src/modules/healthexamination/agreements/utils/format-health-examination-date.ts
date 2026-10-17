import { format, isValid, parseISO } from "date-fns"

export function formatHealthExaminationDate(value?: string) {
  if (!value) return "—"

  const date = parseISO(value)
  return isValid(date) ? format(date, "dd/MM/yyyy") : value
}

/** The period an agreement applies, "dd/MM/yyyy – dd/MM/yyyy", with an open end shown as "Từ"/"Đến". */
export function formatValidityRange(validFrom?: string | null, validTo?: string | null) {
  const from = validFrom ? formatHealthExaminationDate(validFrom) : undefined
  const to = validTo ? formatHealthExaminationDate(validTo) : undefined
  if (from && to) return from === to ? from : `${from} – ${to}`
  if (from) return `Từ ${from}`
  if (to) return `Đến ${to}`
  return "Chưa thiết lập"
}
