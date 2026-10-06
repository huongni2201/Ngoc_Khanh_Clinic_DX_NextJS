"use client"

import * as React from "react"
import { Plus, X } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="examination-date-input">
        Ngày khám <span className="text-destructive">*</span>
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id="examination-date-input"
          type="date"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setDraftError(null)
          }}
          aria-invalid={Boolean(message)}
          className="w-44"
        />
        <Button type="button" variant="outline" size="sm" onClick={addDate}>
          <Plus className="size-3.5" />
          Thêm ngày
        </Button>
      </div>
      {value.length > 0 && (
        <ul aria-label="Các ngày khám đã chọn" className="flex flex-wrap gap-2">
          {value.map((date) => (
            <li
              key={date}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              <span>{formatHealthExaminationDate(date)}</span>
              <button
                type="button"
                onClick={() => removeDate(date)}
                aria-label={`Bỏ ngày ${formatHealthExaminationDate(date)}`}
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p className="text-xs text-destructive" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
