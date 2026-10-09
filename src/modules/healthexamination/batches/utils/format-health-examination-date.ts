import { format, isValid, parseISO } from "date-fns"

export function formatHealthExaminationDate(value?: string) {
  if (!value) return "—"

  const date = parseISO(value)
  return isValid(date) ? format(date, "dd/MM/yyyy") : value
}
