"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Plus, X } from "@/shared/ui/product-icon"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface ExaminationDatesFieldProps {
  value: string[]
  onChange: (dates: string[]) => void
  error?: string
}

/** Collects the examination days of a batch as distinct, ascending yyyy-MM-dd values. */
export function ExaminationDatesField({ value, onChange, error }: ExaminationDatesFieldProps) {
  const [draft, setDraft] = React.useState("")
  const [draftError, setDraftError] = React.useState<string | null>(null)

  const addDate = () => {
    if (!draft) {
      setDraftError("Vui lòng chọn ngày khám.")
      return
    }
    if (value.includes(draft)) {
      setDraftError("Ngày này đã được thêm.")
      return
    }
    onChange([...value, draft].sort())
    setDraft("")
    setDraftError(null)
  }

  const removeDate = (date: string) => onChange(value.filter((item) => item !== date))
  const message = draftError ?? error

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Label htmlFor="examination-date-input" className="text-sm font-medium text-foreground">
          Ngày khám <span className="text-destructive">*</span>
        </Label>
        {value.length > 0 && (
          <span className="text-xs tabular-nums text-muted-foreground">
            Đã thêm {value.length} ngày khám
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="examination-date-input"
          type="date"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setDraftError(null)
          }}
          aria-invalid={Boolean(message)}
          className="sm:w-56"
        />
        <Button type="button" variant="outline" className="shrink-0 gap-1.5" onClick={addDate}>
          <Plus className="size-3.5" aria-hidden="true" />
          Thêm ngày
        </Button>
      </div>

      {value.length > 0 ? (
        <ul aria-label="Các ngày khám đã chọn" className="flex flex-wrap gap-2">
          {value.map((date) => {
            const label = formatHealthExaminationDate(date)
            return (
              <li
                key={date}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface-alt py-0 pl-2 pr-1 text-xs font-medium tabular-nums text-foreground"
              >
                <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => removeDate(date)}
                  aria-label={`Bỏ ngày ${label}`}
                  className="inline-flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Thêm từng ngày trong đợt. Mỗi ngày chỉ thêm một lần.
        </p>
      )}

      {message && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
