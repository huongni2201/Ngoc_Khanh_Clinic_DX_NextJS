"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useCreateParticipant,
  useFindCancelledParticipant,
  useParticipantDetail,
  useUpdateParticipant,
} from "../../hooks/use-health-examination-batches"
import {
  PARTICIPANT_IDENTIFICATION_MAX_LENGTH,
  PARTICIPANT_NAME_MAX_LENGTH,
  PARTICIPANT_TEXT_MAX_LENGTH,
  participantFormSchema,
  type ValidatedParticipantFormValues,
} from "../../schemas/participant.schema"
import type {
  HealthExaminationBatchDay,
  HealthExaminationParticipant,
  ParticipantDetail,
  ParticipantFormValues,
} from "../../types"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import {
  buildEmptyParticipantFormValues,
  buildParticipantFormValues,
  toParticipantInput,
} from "../../utils/participant-form-values"
import { PARTICIPANT_SEX_LABELS } from "../../utils/participant-labels"
import {
  describeParticipantWriteError,
  type ParticipantWriteFailure,
} from "../../utils/participant-write-errors"
import { PARTICIPANT_SEX_VALUES } from "../../types/transport"

const FORM_ID = "participant-form"

export interface ParticipantFormDialogProps {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** The days of the batch the Participant can be scheduled on. */
  days: HealthExaminationBatchDay[]
  /** Required in edit mode. */
  participantId?: string
  /** Called after a successful save, and when the dialog closes because the backend refused it. */
  onSaved?: (participant: ParticipantDetail) => void
  onNotice?: (message: string) => void
  /**
   * Add mode only. Called when the user chooses to reactivate the cancelled Participant that holds
   * the CCCD they tried to add. When omitted the suggestion is not offered.
   */
  onReactivateCandidate?: (participant: HealthExaminationParticipant) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  )
}

/**
 * Adds or edits one Participant. Edit fills the form from the full detail (the list only holds the
 * masked CCCD) and saves with the version that detail carried. The CCCD is locked once the
 * Participant was prepared for a visit. The backend stays the judge of every rule.
 */
export function ParticipantFormDialog({
  mode,
  open,
  onOpenChange,
  organizationId,
  batchId,
  days,
  participantId,
  onSaved,
  onNotice,
  onReactivateCandidate,
}: ParticipantFormDialogProps) {
  const isEdit = mode === "edit"
  const defaultDayId = days.length === 1 ? days[0].id : ""
  const [failure, setFailure] = React.useState<ParticipantWriteFailure | null>(null)
  // The cancelled Participant that holds the CCCD a failed add tried to use.
  const [cancelledMatch, setCancelledMatch] = React.useState<HealthExaminationParticipant | null>(
    null
  )

  // A suggestion belongs to one opening of the dialog: drop it whenever the dialog closes, however
  // it closed.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) setCancelledMatch(null)
  }

  const detailQuery = useParticipantDetail(organizationId, batchId, participantId, {
    enabled: open && isEdit,
  })
  const detail = detailQuery.data
  const createMutation = useCreateParticipant()
  const updateMutation = useUpdateParticipant()
  const findCancelled = useFindCancelledParticipant()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<ParticipantFormValues, unknown, ValidatedParticipantFormValues>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: buildEmptyParticipantFormValues(defaultDayId),
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = form

  // Fills the form once per opening: empty for a new Participant, from the detail for an edit.
  const initializedRef = React.useRef(false)
  React.useEffect(() => {
    if (!open) {
      initializedRef.current = false
      return
    }
    if (initializedRef.current) return
    if (!isEdit) {
      initializedRef.current = true
      reset(buildEmptyParticipantFormValues(defaultDayId))
    } else if (detail) {
      initializedRef.current = true
      reset(buildParticipantFormValues(detail))
    }
  }, [open, isEdit, detail, defaultDayId, reset])

  const close = React.useCallback(
    (next: boolean) => {
      if (isPending) return
      if (!next) {
        setFailure(null)
        setCancelledMatch(null)
        createMutation.reset()
        updateMutation.reset()
      }
      onOpenChange(next)
    },
    [isPending, createMutation, updateMutation, onOpenChange]
  )

  // A failed read of the detail (no permission, deleted) closes the dialog with a notice.
  const detailError = detailQuery.error
  React.useEffect(() => {
    if (!open || !isEdit || !detailError) return
    const described = describeParticipantWriteError(detailError, "read")
    if (described.kind === "forbidden" || described.kind === "not-found") {
      onNotice?.(described.message)
      onOpenChange(false)
    }
  }, [open, isEdit, detailError, onNotice, onOpenChange])

  const onSubmit = async (values: ValidatedParticipantFormValues) => {
    setFailure(null)
    setCancelledMatch(null)
    const input = toParticipantInput(values)
    try {
      const saved =
        isEdit && detail
          ? await updateMutation.mutateAsync({
              ...input,
              organizationId,
              batchId,
              participantId: detail.id,
              rowVersion: detail.rowVersion,
            })
          : await createMutation.mutateAsync({ ...input, organizationId, batchId })
      onSaved?.(saved)
      onOpenChange(false)
    } catch (error) {
      const described = describeParticipantWriteError(error, isEdit ? "update" : "create")
      if (described.kind === "duplicate-identity") {
        setError("identificationNumber", { type: "server", message: described.message })
        if (!isEdit && onReactivateCandidate) {
          // A lookup failure keeps the plain duplicate message above.
          const match = await findCancelled
            .mutateAsync({ organizationId, batchId, identificationNumber: input.identificationNumber })
            .catch(() => null)
          setCancelledMatch(match)
        }
        return
      }
      if (described.kind === "stale-version" && isEdit) {
        // Replace the form with the latest data so the next save uses the current version.
        const latest = await detailQuery.refetch()
        if (latest.data) reset(buildParticipantFormValues(latest.data))
        setFailure(described)
        return
      }
      if (described.kind === "forbidden" || described.kind === "not-found") {
        onNotice?.(described.message)
        onOpenChange(false)
        return
      }
      setFailure(described)
    }
  }

  const identityLocked = isEdit && Boolean(detail?.patientLinked)
  const loadingDetail = isEdit && !detail && !detailError
  const loadFailed = isEdit && Boolean(detailError) && !detail
  const title = isEdit ? "Cập nhật người khám" : "Thêm người khám"

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="sm:max-w-[720px] max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden"
        showCloseButton
      >
        <DialogHeader className="pb-4 shrink-0 text-left">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Chỉnh sửa thông tin người khám trong đợt khám."
              : "Thêm một người khám vào danh sách của đợt khám."}
          </DialogDescription>
        </DialogHeader>

        {loadFailed && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span>{describeParticipantWriteError(detailError, "read").message}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void detailQuery.refetch()}
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form
          id={FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 -mr-1"
        >
          {failure && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{failure.message}</AlertDescription>
            </Alert>
          )}

          {cancelledMatch && onReactivateCandidate && (
            <Alert className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span>
                  CCCD này thuộc người khám{" "}
                  <span className="font-semibold text-foreground">{cancelledMatch.fullName}</span> đã
                  bị hủy.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReactivateCandidate(cancelledMatch)}
                >
                  Khôi phục người khám này
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Locked until the detail has filled the form, so early typing is never overwritten. */}
          <fieldset
            disabled={loadingDetail || loadFailed}
            className="m-0 min-w-0 border-0 p-0 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor="participant-code">Mã người khám</Label>
              <Input
                id="participant-code"
                maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
                aria-invalid={Boolean(errors.participantCode)}
                {...register("participantCode")}
              />
              <FieldError message={errors.participantCode?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-full-name">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="participant-full-name"
                maxLength={PARTICIPANT_NAME_MAX_LENGTH}
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
              <FieldError message={errors.fullName?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-date-of-birth">
                Ngày sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="participant-date-of-birth"
                type="date"
                aria-invalid={Boolean(errors.dateOfBirth)}
                {...register("dateOfBirth")}
              />
              <FieldError message={errors.dateOfBirth?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-sex">
                Giới tính <span className="text-destructive">*</span>
              </Label>
              <select
                id="participant-sex"
                aria-invalid={Boolean(errors.sex)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                {...register("sex")}
              >
                <option value="">Chọn giới tính</option>
                {PARTICIPANT_SEX_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PARTICIPANT_SEX_LABELS[value]}
                  </option>
                ))}
              </select>
              <FieldError message={errors.sex?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-identification-number">
                CCCD <span className="text-destructive">*</span>
              </Label>
              <Input
                id="participant-identification-number"
                inputMode="numeric"
                autoComplete="off"
                maxLength={PARTICIPANT_IDENTIFICATION_MAX_LENGTH}
                disabled={identityLocked}
                aria-invalid={Boolean(errors.identificationNumber)}
                aria-describedby={identityLocked ? "participant-identification-note" : undefined}
                {...register("identificationNumber")}
              />
              {identityLocked && (
                <p id="participant-identification-note" className="text-[11px] text-muted-foreground">
                  Không thể đổi CCCD sau khi người khám đã được chuẩn bị lượt khám.
                </p>
              )}
              <FieldError message={errors.identificationNumber?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-batch-day">
                Ngày khám <span className="text-destructive">*</span>
              </Label>
              <select
                id="participant-batch-day"
                aria-invalid={Boolean(errors.batchDayId)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                {...register("batchDayId")}
              >
                <option value="">Chọn ngày khám</option>
                {days.map((day) => (
                  <option key={day.id} value={day.id}>
                    {formatHealthExaminationDate(day.examinationDate)}
                  </option>
                ))}
              </select>
              <FieldError message={errors.batchDayId?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-department">
                Đơn vị/Phòng ban <span className="text-destructive">*</span>
              </Label>
              <Input
                id="participant-department"
                maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
                aria-invalid={Boolean(errors.departmentName)}
                {...register("departmentName")}
              />
              <FieldError message={errors.departmentName?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-position">
                Chức vụ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="participant-position"
                maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
                aria-invalid={Boolean(errors.positionName)}
                {...register("positionName")}
              />
              <FieldError message={errors.positionName?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-phone">Số điện thoại</Label>
              <Input
                id="participant-phone"
                type="tel"
                maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participant-email">Email</Label>
              <Input
                id="participant-email"
                type="email"
                maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>
          </fieldset>
        </form>

        <div className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={() => close(false)} disabled={isPending}>
            Đóng
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending || loadingDetail || loadFailed}
          >
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm người khám"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
