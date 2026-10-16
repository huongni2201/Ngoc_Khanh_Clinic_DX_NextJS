"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "@/shared/ui/product-icon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useRecordExaminationDetail } from "../../hooks/use-examination-details"
import type { ExaminationDetailRow, HealthExaminationAgreementService } from "../../types"
import { MISSING_SERVICE_NAME } from "../../utils/agreement-form-values"
import {
  areExaminationEntryValuesEqual,
  buildExaminationEntryDefaults,
  type ExaminationEntryValues,
} from "../../utils/examination-detail-entry-defaults"
import {
  getExaminationStatus,
  getExaminationStatusLabel,
} from "../../utils/examination-detail-labels"
import {
  describeExaminationDetailRecordError,
  type ExaminationDetailRecordFailure,
} from "../../utils/examination-detail-record-errors"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface ExaminationDetailEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  agreementId: string
  /** The agreement services, in display order. */
  services: HealthExaminationAgreementService[]
  /** The Participant being edited; null while the sheet is closed. */
  row: ExaminationDetailRow | null
  /** Called with the stored row after a successful save. */
  onSaved: (row: ExaminationDetailRow) => void
  /** Save and open the next Participant of the current page. Omitted on the last row. */
  onSaveAndNext?: (row: ExaminationDetailRow) => void
  /** Reloads the roster after the Participant changed elsewhere. */
  onReload: () => Promise<unknown> | void
}

const STATUS_TONES = {
  UNCONFIRMED: "bg-muted text-muted-foreground",
  NO_SHOW: "bg-muted text-muted-foreground",
  ATTENDED_PENDING: "bg-status-in-progress-bg text-status-in-progress",
  RECONCILED: "bg-status-completed-bg text-status-completed",
} as const

/**
 * Manual entry of the services performed for one Participant. Attendance is not entered here: it
 * comes from the sessions the Participant is assigned to. The form is rebuilt whenever the stored
 * row changes, so a saved or reloaded Participant always shows what the backend holds.
 */
export function ExaminationDetailEntrySheet({
  open,
  onOpenChange,
  organizationId,
  agreementId,
  services,
  row,
  onSaved,
  onSaveAndNext,
  onReload,
}: ExaminationDetailEntrySheetProps) {
  const [dirty, setDirty] = React.useState(false)
  const [confirmDiscardOpen, setConfirmDiscardOpen] = React.useState(false)
  const [savedName, setSavedName] = React.useState<string | null>(null)

  const requestClose = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    if (dirty) {
      setConfirmDiscardOpen(true)
      return
    }
    onOpenChange(false)
  }

  // Closing the sheet forgets the unsaved state (adjusted while rendering, not in an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) {
      setDirty(false)
      setSavedName(null)
    }
  }

  return (
    <>
      <Sheet open={open && row !== null} onOpenChange={requestClose}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {row && (
            <EntryForm
              key={`${row.id}:${row.rowVersion}`}
              organizationId={organizationId}
              agreementId={agreementId}
              services={services}
              row={row}
              savedName={savedName}
              onDirtyChange={setDirty}
              onCancel={() => requestClose(false)}
              onReload={onReload}
              onSaved={(saved) => {
                setSavedName(saved.fullName)
                onSaved(saved)
              }}
              onSaveAndNext={
                onSaveAndNext
                  ? (saved) => {
                      setSavedName(null)
                      onSaveAndNext(saved)
                    }
                  : undefined
              }
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bỏ thay đổi chưa lưu?</DialogTitle>
            <DialogDescription>
              Các thay đổi trong chi tiết khám của người khám này chưa được lưu và sẽ bị mất.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDiscardOpen(false)}>
              Tiếp tục chỉnh sửa
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmDiscardOpen(false)
                setDirty(false)
                onOpenChange(false)
              }}
            >
              Bỏ thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface EntryFormProps {
  organizationId: string
  agreementId: string
  services: HealthExaminationAgreementService[]
  row: ExaminationDetailRow
  savedName: string | null
  onDirtyChange: (dirty: boolean) => void
  onCancel: () => void
  onReload: () => Promise<unknown> | void
  onSaved: (row: ExaminationDetailRow) => void
  onSaveAndNext?: (row: ExaminationDetailRow) => void
}

function EntryForm({
  organizationId,
  agreementId,
  services,
  row,
  savedName,
  onDirtyChange,
  onCancel,
  onReload,
  onSaved,
  onSaveAndNext,
}: EntryFormProps) {
  const initial = React.useMemo(() => buildExaminationEntryDefaults(row), [row])
  const [values, setValues] = React.useState<ExaminationEntryValues>(initial)
  const [failure, setFailure] = React.useState<ExaminationDetailRecordFailure | null>(null)
  const [reloading, setReloading] = React.useState(false)
  const record = useRecordExaminationDetail()
  const pending = record.isPending
  const dirty = !areExaminationEntryValuesEqual(values, initial)
  const status = getExaminationStatus(row)
  const performedCount = values.performedAgreementServiceIds.length
  const allSelected = services.length > 0 && performedCount === services.length

  React.useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])

  const change = (patch: Partial<ExaminationEntryValues>) => {
    setValues((current) => ({ ...current, ...patch }))
    setFailure(null)
  }

  const toggleService = (serviceId: string, checked: boolean) => {
    const next = checked
      ? [...values.performedAgreementServiceIds, serviceId]
      : values.performedAgreementServiceIds.filter((id) => id !== serviceId)
    change({ performedAgreementServiceIds: next })
  }

  const toggleAll = () => {
    if (allSelected) {
      change({ performedAgreementServiceIds: [] })
      return
    }
    // A service that is no longer offered can only stay as it already is.
    const keep = new Set(row.performedAgreementServiceIds)
    change({
      performedAgreementServiceIds: services
        .filter((service) => service.active !== false || keep.has(service.id))
        .map((service) => service.id),
    })
  }

  const save = async (andNext: boolean) => {
    if (pending || !dirty) return
    setFailure(null)
    try {
      const saved = await record.mutateAsync({
        organizationId,
        agreementId,
        participantId: row.id,
        performedAgreementServiceIds: values.performedAgreementServiceIds,
        rowVersion: row.rowVersion,
      })
      if (andNext && onSaveAndNext) onSaveAndNext(saved)
      else onSaved(saved)
    } catch (error) {
      setFailure(describeExaminationDetailRecordError(error))
    }
  }

  const reload = async () => {
    setReloading(true)
    try {
      await onReload()
    } finally {
      setReloading(false)
    }
  }

  return (
    <form
      className="flex h-full flex-col"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void save(false)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          void save(false)
        }
      }}
    >
      <SheetHeader className="pr-12">
        <SheetTitle>Cập nhật chi tiết khám</SheetTitle>
        <SheetDescription>
          Ghi nhận các hạng mục đã khám. Việc đến hay không đến được ghi nhận ở Lịch khám.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-4">
        <section aria-label="Thông tin người khám" className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{row.fullName}</p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                STATUS_TONES[status]
              )}
            >
              {getExaminationStatusLabel(row)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Mã người khám: {row.participantCode ?? "—"} · {row.departmentName}
          </p>
          <p className="text-xs text-muted-foreground">
            Lịch khám tới:{" "}
            {row.nextSessionDate ? formatHealthExaminationDate(row.nextSessionDate) : "chưa có"}
            {row.lastAttendedDate
              ? ` · Lần khám gần nhất: ${formatHealthExaminationDate(row.lastAttendedDate)}`
              : ""}
          </p>
        </section>

        <fieldset className="space-y-2" disabled={pending}>
          <div className="flex items-center justify-between gap-2">
            <legend className="text-xs font-medium">
              Hạng mục đã khám ({performedCount}/{services.length})
            </legend>
            {services.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={toggleAll}
              >
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
            )}
          </div>
          <ul className="space-y-1">
            {services.map((service) => {
              const checked = values.performedAgreementServiceIds.includes(service.id)
              const retired = service.active === false
              const name = service.name ?? MISSING_SERVICE_NAME
              const disabled = retired && !checked
              return (
                <li key={service.id}>
                  <label
                    className={cn(
                      "flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-xs",
                      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-hover/50"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(next) => toggleService(service.id, next === true)}
                    />
                    <span className="flex-1 text-foreground">{name}</span>
                    {retired && (
                      <span className="text-[11px] text-muted-foreground">Không còn áp dụng</span>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>

        {failure && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Không thể lưu chi tiết khám</AlertTitle>
            <AlertDescription>
              <p>{failure.message}</p>
              {failure.needsReload && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={reloading}
                  onClick={() => void reload()}
                >
                  {reloading ? "Đang tải..." : "Tải lại dữ liệu"}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {savedName && !failure && !dirty && (
          <Alert>
            <CheckCircle2 />
            <AlertDescription>
              <p role="status">Đã cập nhật chi tiết khám của {savedName}.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <SheetFooter className="flex-col gap-2 border-t border-border sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" variant={onSaveAndNext ? "outline" : "default"} disabled={pending || !dirty}>
          {pending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu"
          )}
        </Button>
        {onSaveAndNext && (
          <Button type="button" disabled={pending || !dirty} onClick={() => void save(true)}>
            Lưu & người tiếp theo
          </Button>
        )}
      </SheetFooter>
    </form>
  )
}
