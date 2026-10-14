"use client"

import * as React from "react"
import { Controller, useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Copy, Eye, EyeOff, Info, StatusPill, toast } from "@/shared/ui"
import {
  createStaffMemberSchema,
  EMPTY_CREATE_STAFF_MEMBER_FORM,
  STAFF_MEMBER_EMAIL_MAX_LENGTH,
  STAFF_MEMBER_NAME_MAX_LENGTH,
  STAFF_MEMBER_PHONE_MAX_LENGTH,
  type CreateStaffMemberFormValues,
  type ValidatedCreateStaffMemberFormValues,
} from "../schemas/staff-member.schema"
import { useAssignableRoles, useCreateStaffMember } from "../hooks/use-staff-members"
import { STAFF_MEMBER_SEX_VALUES } from "../types/staff-member-transport"
import type { RoleOption, StaffMember } from "../types/staff-member"
import {
  createStaffMemberErrorMessage,
  isUnavailableRoleError,
  staffMemberFieldErrors,
} from "../utils/staff-member-errors"
import {
  roleLabel,
  STAFF_ACCOUNT_STATUS_PRESENTATION,
  STAFF_MEMBER_SEX_LABELS,
} from "../utils/staff-member-labels"
import { previewUsernameBase } from "../utils/username-preview"
import { RoleCheckboxGroup } from "./role-checkbox-group"

interface CreateStaffMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface StaffTextFieldProps
  extends Pick<React.ComponentProps<typeof Input>, "type" | "placeholder" | "autoComplete" | "maxLength"> {
  id: string
  label: string
  required?: boolean
  error?: string
  registration: UseFormRegisterReturn
}

/** Labelled input of the staff member form, with its required marker and linked error. */
function StaffTextField({ id, label, required = false, error, registration, ...inputProps }: StaffTextFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
            <span className="sr-only">(bắt buộc)</span>
          </>
        ) : null}
      </Label>
      <Input
        id={id}
        {...inputProps}
        {...registration}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Creates a staff member; the backend creates its STAFF account in the same request and generates
 * the staff code and username. The result step shows them once so the administrator can hand them
 * over with the temporary password, which is cleared from the form as soon as the request succeeds.
 */
export function CreateStaffMemberDialog({ open, onOpenChange }: CreateStaffMemberDialogProps) {
  const [created, setCreated] = React.useState<StaffMember | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const createMutation = useCreateStaffMember()
  const rolesQuery = useAssignableRoles(open)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffMemberFormValues, unknown, ValidatedCreateStaffMemberFormValues>({
    resolver: zodResolver(createStaffMemberSchema),
    defaultValues: EMPTY_CREATE_STAFF_MEMBER_FORM,
  })

  const fullName = useWatch({ control, name: "fullName" })
  const usernamePreview = previewUsernameBase(fullName ?? "")
  const isPending = isSubmitting || createMutation.isPending

  const startOver = () => {
    reset(EMPTY_CREATE_STAFF_MEMBER_FORM)
    createMutation.reset()
    setCreated(null)
    setShowPassword(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) startOver()
    onOpenChange(next)
  }

  const onSubmit = async (values: ValidatedCreateStaffMemberFormValues) => {
    try {
      const staffMember = await createMutation.mutateAsync({
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth || undefined,
        sex: values.sex || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        initialPassword: values.initialPassword,
        roleCodes: values.roleCodes,
      })
      // The temporary password must not stay in memory once the account exists.
      reset(EMPTY_CREATE_STAFF_MEMBER_FORM)
      setShowPassword(false)
      setCreated(staffMember)
      toast.success(`Đã tạo nhân viên ${staffMember.staffCode}.`)
    } catch (error) {
      for (const fieldError of staffMemberFieldErrors(error)) {
        setError(fieldError.field, { type: "server", message: fieldError.message })
      }
      if (isUnavailableRoleError(error)) {
        const refreshed = await rolesQuery.refetch()
        const available = new Set((refreshed.data ?? []).map((role) => role.code))
        setValue(
          "roleCodes",
          getValues("roleCodes").filter((code) => available.has(code)),
          { shouldValidate: true }
        )
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {created ? (
          <CreatedStaffMemberResult
            staffMember={created}
            roles={rolesQuery.data}
            onCreateAnother={startOver}
            onClose={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
              <DialogTitle className="text-base font-bold text-foreground">Thêm nhân viên</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Mã nhân viên và tên đăng nhập do hệ thống tự sinh. Tài khoản được tạo cùng lúc.
              </DialogDescription>
            </DialogHeader>

            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {createMutation.error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {createStaffMemberErrorMessage(createMutation.error)}
                  </p>
                ) : null}

                <fieldset disabled={isPending} className="m-0 min-w-0 space-y-4 border-0 p-0">
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                    Thông tin nhân viên
                  </legend>
                  <StaffTextField
                    id="staff-member-full-name"
                    label="Họ và tên"
                    required
                    placeholder="VD: Nguyễn Văn An"
                    autoComplete="off"
                    maxLength={STAFF_MEMBER_NAME_MAX_LENGTH}
                    registration={register("fullName")}
                    error={errors.fullName?.message}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StaffTextField
                      id="staff-member-date-of-birth"
                      label="Ngày sinh"
                      type="date"
                      registration={register("dateOfBirth")}
                      error={errors.dateOfBirth?.message}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="staff-member-sex" className="text-xs font-medium text-foreground">
                        Giới tính
                      </Label>
                      <select
                        id="staff-member-sex"
                        aria-invalid={errors.sex ? true : undefined}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                        {...register("sex")}
                      >
                        <option value="">Chưa chọn</option>
                        {STAFF_MEMBER_SEX_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {STAFF_MEMBER_SEX_LABELS[value]}
                          </option>
                        ))}
                      </select>
                      {errors.sex?.message ? (
                        <p className="text-xs text-destructive">{errors.sex.message}</p>
                      ) : null}
                    </div>
                    <StaffTextField
                      id="staff-member-phone"
                      label="Số điện thoại"
                      type="tel"
                      placeholder="VD: 0912 345 678"
                      maxLength={STAFF_MEMBER_PHONE_MAX_LENGTH}
                      registration={register("phone")}
                      error={errors.phone?.message}
                    />
                    <StaffTextField
                      id="staff-member-email"
                      label="Email"
                      type="email"
                      placeholder="VD: an.nguyen@clinic.vn"
                      maxLength={STAFF_MEMBER_EMAIL_MAX_LENGTH}
                      registration={register("email")}
                      error={errors.email?.message}
                    />
                  </div>
                </fieldset>

                <div aria-hidden="true" className="border-t border-border" />

                <fieldset disabled={isPending} className="m-0 min-w-0 space-y-4 border-0 p-0">
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                    Tài khoản đăng nhập
                  </legend>
                  <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      Tên đăng nhập dự kiến:{" "}
                      <span className="font-mono text-foreground" data-testid="username-preview">
                        {usernamePreview ? `${usernamePreview}…` : "—"}
                      </span>{" "}
                      — số thứ tự được hệ thống cấp khi lưu.
                    </span>
                  </p>

                  <div className="space-y-1.5">
                    <Label htmlFor="staff-member-password" className="text-xs font-medium text-foreground">
                      Mật khẩu tạm{" "}
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                      <span className="sr-only">(bắt buộc)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="staff-member-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        aria-invalid={errors.initialPassword ? true : undefined}
                        aria-describedby={
                          errors.initialPassword
                            ? "staff-member-password-error"
                            : "staff-member-password-hint"
                        }
                        {...register("initialPassword")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    {errors.initialPassword?.message ? (
                      <p id="staff-member-password-error" className="text-xs text-destructive">
                        {errors.initialPassword.message}
                      </p>
                    ) : (
                      <p id="staff-member-password-hint" className="text-xs text-muted-foreground">
                        8–72 byte. Không lưu lại và không hiển thị lại sau khi tạo.
                      </p>
                    )}
                  </div>

                  <Controller
                    control={control}
                    name="roleCodes"
                    render={({ field, fieldState }) => (
                      <RoleCheckboxGroup
                        roles={rolesQuery.data}
                        isLoading={rolesQuery.isLoading}
                        isError={rolesQuery.isError}
                        onRetry={() => void rolesQuery.refetch()}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        disabled={isPending}
                      />
                    )}
                  />
                </fieldset>
              </div>

              <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending} className="font-medium">
                  {isPending ? "Đang tạo..." : "Tạo nhân viên"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface CreatedStaffMemberResultProps {
  staffMember: StaffMember
  roles: RoleOption[] | undefined
  onCreateAnother: () => void
  onClose: () => void
}

function CreatedStaffMemberResult({
  staffMember,
  roles,
  onCreateAnother,
  onClose,
}: CreatedStaffMemberResultProps) {
  const account = staffMember.account
  const accountStatus = account ? STAFF_ACCOUNT_STATUS_PRESENTATION[account.status] : null

  const copyUsername = async () => {
    if (!account) return
    try {
      await navigator.clipboard.writeText(account.username)
      toast.success("Đã sao chép tên đăng nhập.", { id: "staff-username-copied" })
    } catch {
      toast.error("Không sao chép được. Hãy ghi lại tên đăng nhập.", { id: "staff-username-copied" })
    }
  }

  return (
    <>
      <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
          <CheckCircle2 aria-hidden="true" className="size-5 text-status-success" />
          Đã tạo nhân viên và tài khoản
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Gửi tên đăng nhập và mật khẩu tạm cho nhân viên qua kênh nội bộ. Mật khẩu không hiển thị lại.
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Nhân viên</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {staffMember.fullName} · <span className="font-mono">{staffMember.staffCode}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Tên đăng nhập</dt>
          <dd className="mt-1 flex items-center gap-2">
            {account ? (
              <>
                <span className="font-mono text-sm font-medium text-foreground">{account.username}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => void copyUsername()}
                  aria-label="Sao chép tên đăng nhập"
                >
                  <Copy className="size-3.5" />
                </Button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Vai trò</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {account?.roleCodes.length
              ? account.roleCodes.map((code) => (
                  <span
                    key={code}
                    className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {roleLabel(code, roles?.find((role) => role.code === code))}
                  </span>
                ))
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Trạng thái tài khoản</dt>
          <dd className="mt-1">
            {accountStatus ? (
              <StatusPill tone={accountStatus.tone}>{accountStatus.label}</StatusPill>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onCreateAnother}>
          Thêm nhân viên khác
        </Button>
        <Button type="button" onClick={onClose}>
          Đóng
        </Button>
      </DialogFooter>
    </>
  )
}
