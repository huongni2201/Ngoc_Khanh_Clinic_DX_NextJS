"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateExaminationSession, useUpdateExaminationSession } from "../../hooks/use-sessions"
import {
  SESSION_ADDRESS_MAX_LENGTH,
  sessionFormSchema,
  type SessionFormInputValues,
  type SessionFormValues,
} from "../../schemas/session.schema"
import type { ExaminationSession } from "../../types"
import { describeSchedulingError } from "../../utils/session-errors"
import { SESSION_ACTIVITY_LABELS } from "../../utils/session-labels"

const FORM_ID = "session-form"
const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  )
}

function emptyValues(session?: ExaminationSession | null): SessionFormInputValues {
  return {
    sessionDate: session?.sessionDate ?? "",
    activity: session?.activity ?? "ALL",
    siteType: session?.siteType ?? "CLINIC",
    siteAddress: session?.siteAddress ?? "",
    reserveForAgreement: false,
  }
}

export interface SessionFormDialogProps {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  /** Create only: offered as "dành riêng cho thỏa thuận này" when the dialog is opened from one. */
  agreement?: { id: string; name: string }
  /** Edit only: the session as last read; its version is the one the save is based on. */
  session?: ExaminationSession | null
  onSaved?: (session: ExaminationSession) => void
}

/** Creates or edits one session (a date, an activity and a site). There is no capacity or shift. */
export function SessionFormDialog({
  mode,
  open,
  onOpenChange,
  organizationId,
  agreement,
  session,
  onSaved,
}: SessionFormDialogProps) {
  const isEdit = mode === "edit"
  const [failure, setFailure] = React.useState<string | null>(null)
  const createMutation = useCreateExaminationSession()
  const updateMutation = useUpdateExaminationSession()
  const pending = createMutation.isPending || updateMutation.isPending

  const form = useForm<SessionFormInputValues, unknown, SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: emptyValues(session),
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form
  const siteType = useWatch({ control, name: "siteType" })

  // Fills the form once per opening, from the session when editing.
  const wasOpen = React.useRef(false)
  React.useEffect(() => {
    if (open && !wasOpen.current) reset(emptyValues(isEdit ? session : null))
    wasOpen.current = open
  }, [open, isEdit, session, reset])

  const close = (next: boolean) => {
    if (pending) return
    if (!next) setFailure(null)
    onOpenChange(next)
  }

  const onSubmit = async (values: SessionFormValues) => {
    setFailure(null)
    const input = {
      sessionDate: values.sessionDate,
      activity: values.activity,
      siteType: values.siteType,
      siteAddress: values.siteType === "CLINIC" ? "" : values.siteAddress,
    }
    try {
      const saved =
        isEdit && session
          ? await updateMutation.mutateAsync({
              organizationId,
              sessionId: session.id,
              rowVersion: session.rowVersion,
              ...input,
            })
          : await createMutation.mutateAsync({
              organizationId,
              ...input,
              ...(agreement && values.reserveForAgreement ? { agreementId: agreement.id } : {}),
            })
      onSaved?.(saved)
      onOpenChange(false)
    } catch (error) {
      setFailure(describeSchedulingError(error, isEdit ? "update-session" : "create-session").message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-[520px] max-w-[calc(100%-2rem)] p-6" showCloseButton={!pending}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEdit ? "Sửa lịch khám" : "Tạo lịch khám"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Một lịch khám là một ngày, một địa điểm và một loại hoạt động. Không giới hạn số người
            và không chia ca.
          </DialogDescription>
        </DialogHeader>

        {failure && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{failure}</AlertDescription>
          </Alert>
        )}

        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="session-date">
              Ngày khám <span className="text-destructive">*</span>
            </Label>
            <Input
              id="session-date"
              type="date"
              aria-invalid={Boolean(errors.sessionDate)}
              disabled={pending}
              {...register("sessionDate")}
            />
            <FieldError message={errors.sessionDate?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-activity">
              Loại hoạt động <span className="text-destructive">*</span>
            </Label>
            <select
              id="session-activity"
              className={SELECT_CLASS}
              disabled={pending}
              {...register("activity")}
            >
              {Object.entries(SESSION_ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldError message={errors.activity?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-site-type">
              Địa điểm <span className="text-destructive">*</span>
            </Label>
            <select
              id="session-site-type"
              className={SELECT_CLASS}
              disabled={pending}
              {...register("siteType")}
            >
              <option value="CLINIC">Tại phòng khám</option>
              <option value="ORGANIZATION_SITE">Tại đơn vị</option>
            </select>
            <FieldError message={errors.siteType?.message} />
          </div>

          {siteType === "ORGANIZATION_SITE" && (
            <div className="space-y-1.5">
              <Label htmlFor="session-site-address">
                Địa chỉ nơi khám <span className="text-destructive">*</span>
              </Label>
              <Input
                id="session-site-address"
                maxLength={SESSION_ADDRESS_MAX_LENGTH}
                aria-invalid={Boolean(errors.siteAddress)}
                disabled={pending}
                {...register("siteAddress")}
              />
              <FieldError message={errors.siteAddress?.message} />
            </div>
          )}

          {!isEdit && agreement && (
            <Controller
              name="reserveForAgreement"
              control={control}
              render={({ field }) => (
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    disabled={pending}
                    aria-label="Chỉ dành cho thỏa thuận này"
                  />
                  <span>
                    Chỉ dành cho thỏa thuận “{agreement.name}”
                    <span className="block text-xs text-muted-foreground">
                      Bỏ chọn để các thỏa thuận khác của đơn vị cùng dùng lịch này.
                    </span>
                  </span>
                </label>
              )}
            />
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => close(false)} disabled={pending}>
            Đóng
          </Button>
          <Button type="submit" form={FORM_ID} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {pending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo lịch khám"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
