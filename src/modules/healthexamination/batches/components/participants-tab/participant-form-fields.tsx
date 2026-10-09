"use client"

import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  PARTICIPANT_ADDRESS_MAX_LENGTH,
  PARTICIPANT_IDENTIFICATION_MAX_LENGTH,
  PARTICIPANT_NAME_MAX_LENGTH,
  PARTICIPANT_NOTE_MAX_LENGTH,
  PARTICIPANT_TEXT_MAX_LENGTH,
} from "../../schemas/participant.schema"
import type { HealthExaminationBatchDay, ParticipantFormValues } from "../../types"
import { PARTICIPANT_SEX_VALUES } from "../../types/transport"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import { PARTICIPANT_SEX_LABELS } from "../../utils/participant-labels"

interface ParticipantFormFieldsProps {
  register: UseFormRegister<ParticipantFormValues>
  errors: FieldErrors<ParticipantFormValues>
  /** The days of the batch the Participant can be scheduled on. */
  days: HealthExaminationBatchDay[]
  /** The CCCD cannot change once the Participant was prepared for a visit. */
  identityLocked: boolean
  disabled: boolean
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  )
}

export function ParticipantFormFields({
  register,
  errors,
  days,
  identityLocked,
  disabled,
}: ParticipantFormFieldsProps) {
  // Locked until the detail has filled the form, so early typing is never overwritten.
  return (
    <fieldset
      disabled={disabled}
      className="m-0 min-w-0 border-0 p-0 grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="space-y-1.5 md:col-span-2">
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
        <Label htmlFor="participant-identification-issue-date">Ngày cấp CCCD</Label>
        <Input
          id="participant-identification-issue-date"
          type="date"
          aria-invalid={Boolean(errors.identificationIssueDate)}
          {...register("identificationIssueDate")}
        />
        <FieldError message={errors.identificationIssueDate?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="participant-identification-issue-place">Nơi cấp CCCD</Label>
        <Input
          id="participant-identification-issue-place"
          maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
          aria-invalid={Boolean(errors.identificationIssuePlace)}
          {...register("identificationIssuePlace")}
        />
        <FieldError message={errors.identificationIssuePlace?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="participant-ethnicity">Dân tộc</Label>
        <Input
          id="participant-ethnicity"
          maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
          aria-invalid={Boolean(errors.ethnicity)}
          {...register("ethnicity")}
        />
        <FieldError message={errors.ethnicity?.message} />
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

      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="participant-address">Chỗ ở</Label>
        <Input
          id="participant-address"
          maxLength={PARTICIPANT_ADDRESS_MAX_LENGTH}
          aria-invalid={Boolean(errors.address)}
          {...register("address")}
        />
        <FieldError message={errors.address?.message} />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="participant-workplace">Nơi làm việc</Label>
        <Input
          id="participant-workplace"
          maxLength={PARTICIPANT_TEXT_MAX_LENGTH}
          aria-invalid={Boolean(errors.workplace)}
          {...register("workplace")}
        />
        <FieldError message={errors.workplace?.message} />
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

      <div className="space-y-1.5 md:col-span-2">
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

      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="participant-note">Ghi chú</Label>
        <Textarea
          id="participant-note"
          rows={3}
          maxLength={PARTICIPANT_NOTE_MAX_LENGTH}
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
        <FieldError message={errors.note?.message} />
      </div>
    </fieldset>
  )
}
