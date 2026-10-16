"use client"

import * as React from "react"
import { Controller, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormTextField, Info, Loader2, RefreshCw, ShieldCheck, toast } from "@/shared/ui"
import {
  createRoleSchema,
  EMPTY_CREATE_ROLE_FORM,
  ROLE_CODE_MAX_LENGTH,
  ROLE_DESCRIPTION_MAX_LENGTH,
  ROLE_NAME_MAX_LENGTH,
  updateRoleSchema,
  type CreateRoleFormValues,
  type UpdateRoleFormValues,
  type ValidatedCreateRoleFormValues,
  type ValidatedUpdateRoleFormValues,
} from "../schemas/role.schema"
import { useCreateRole, useUpdateRole } from "../hooks/use-roles"
import type { RoleSummary } from "../types/role"
import { isRoleVersionConflict, roleFieldErrors, roleFormErrorMessage } from "../utils/role-errors"
import { isRoleNameTaken, roleDisplayDescription, roleDisplayName } from "../utils/role-labels"
import { ADMINISTRATOR_ROLE_CODE, PATIENT_ROLE_CODE } from "../utils/role-permission-draft"

interface RoleFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Role to edit (SRS 1.3.3); omitted to create one (SRS 1.3.2). */
  role?: RoleSummary
  /**
   * Active roles offered by "Copy permissions from" when creating. Omitted hides the field: copying
   * grants permissions, so it needs the permission to assign them.
   */
  copySources?: RoleSummary[]
  /** Every role, to reject a name already shown for another role. */
  existingRoles?: RoleSummary[]
  /** Reloads the edited role after a conflict; resolves to its latest version, if it still exists. */
  onReload?: () => Promise<RoleSummary | undefined>
  /** Shown as "Sửa quyền" when editing and the session may view role permissions. */
  onEditPermissions?: (role: RoleSummary) => void
}

const NO_COPY = ""
const DUPLICATE_NAME_MESSAGE = "Tên vai trò đã tồn tại"

/**
 * New Role and Edit Role panel sliding in from the right over the Role List. Closing it with unsaved
 * changes asks first, like the examination detail entry sheet.
 */
export function RoleFormSheet({
  open,
  onOpenChange,
  role,
  copySources,
  existingRoles,
  onReload,
  onEditPermissions,
}: RoleFormSheetProps) {
  const [dirty, setDirty] = React.useState(false)
  // What to do once the user agrees to drop unsaved changes: close the panel, or close it and open
  // the Role Permissions screen. Null while no confirmation is asked.
  const [pendingLeave, setPendingLeave] = React.useState<(() => void) | null>(null)

  const close = () => {
    setDirty(false)
    onOpenChange(false)
  }

  /** Runs `leave` at once, or after confirmation when the form has unsaved changes. */
  const leaveSafely = (leave: () => void) => {
    if (dirty) setPendingLeave(() => leave)
    else leave()
  }

  const requestClose = (next: boolean) => {
    if (next) onOpenChange(true)
    else leaveSafely(close)
  }

  const editPermissions = onEditPermissions
    ? (target: RoleSummary) =>
        leaveSafely(() => {
          close()
          onEditPermissions(target)
        })
    : undefined

  // Closing the sheet forgets the unsaved state (adjusted while rendering, not in an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) setDirty(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={requestClose}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open ? (
            role ? (
              <EditRoleForm
                key={role.id}
                role={role}
                existingRoles={existingRoles ?? []}
                onDirtyChange={setDirty}
                onCancel={() => requestClose(false)}
                onSaved={close}
                onReload={onReload}
                onEditPermissions={editPermissions}
              />
            ) : (
              <CreateRoleForm
                copySources={copySources}
                existingRoles={existingRoles ?? []}
                onDirtyChange={setDirty}
                onCancel={() => requestClose(false)}
                onSaved={close}
              />
            )
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={pendingLeave !== null}
        onOpenChange={(next) => {
          if (!next) setPendingLeave(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bỏ thay đổi chưa lưu?</DialogTitle>
            <DialogDescription>Các thay đổi của vai trò chưa được lưu và sẽ bị mất.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingLeave(null)}>
              Tiếp tục chỉnh sửa
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const leave = pendingLeave
                setPendingLeave(null)
                leave?.()
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

interface FormProps {
  onDirtyChange: (dirty: boolean) => void
  onCancel: () => void
  onSaved: () => void
}

function CreateRoleForm({
  copySources,
  existingRoles,
  onDirtyChange,
  onCancel,
  onSaved,
}: FormProps & { copySources?: RoleSummary[]; existingRoles: RoleSummary[] }) {
  const createMutation = useCreateRole()
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<CreateRoleFormValues, unknown, ValidatedCreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: EMPTY_CREATE_ROLE_FORM,
  })

  React.useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])

  const copyItems = React.useMemo(
    () => [
      { value: NO_COPY, label: "Không sao chép" },
      ...(copySources ?? []).map((source) => ({
        value: source.id,
        label: `${roleDisplayName(source)} (${source.permissionCount} quyền)`,
      })),
    ],
    [copySources]
  )
  const pending = createMutation.isPending

  const onSubmit = async (values: ValidatedCreateRoleFormValues) => {
    if (isRoleNameTaken(values.name, existingRoles)) {
      setError("name", { type: "duplicate", message: DUPLICATE_NAME_MESSAGE })
      return
    }
    try {
      const created = await createMutation.mutateAsync({
        code: values.code,
        name: values.name,
        description: values.description,
        copyFromRoleId: values.copyFromRoleId || undefined,
        active: values.active,
      })
      toast.success(`Đã tạo vai trò ${created.name}.`)
      onSaved()
    } catch (error) {
      for (const fieldError of roleFieldErrors(error)) {
        setError(fieldError.field, { type: "server", message: fieldError.message })
      }
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>Thêm vai trò</SheetTitle>
        <SheetDescription>
          Tạo vai trò, sau đó cấp quyền cho vai trò ở màn Phân quyền vai trò.
        </SheetDescription>
      </SheetHeader>

      <fieldset disabled={pending} className="m-0 min-w-0 flex-1 space-y-5 border-0 px-6 pb-4">
        {createMutation.error && roleFieldErrors(createMutation.error).length === 0 ? (
          <p role="alert" className="text-xs text-destructive">
            {roleFormErrorMessage(createMutation.error, "create")}
          </p>
        ) : null}

        <FormTextField
          id="role-name"
          label="Tên vai trò"
          required
          placeholder="VD: Kỹ thuật viên xét nghiệm"
          autoComplete="off"
          maxLength={ROLE_NAME_MAX_LENGTH}
          registration={register("name")}
          error={errors.name?.message}
        />

        <div className="space-y-1.5">
          <FormTextField
            id="role-code"
            label="Mã vai trò"
            required
            placeholder="VD: KY_THUAT_VIEN"
            autoComplete="off"
            maxLength={ROLE_CODE_MAX_LENGTH}
            registration={register("code", {
              setValueAs: (value: string) => value.toUpperCase(),
            })}
            error={errors.code?.message}
          />
          {!errors.code ? (
            <p className="text-xs text-muted-foreground">
              Chữ in hoa, chữ số và dấu gạch dưới. Không thể đổi sau khi tạo.
            </p>
          ) : null}
        </div>

        <DescriptionField register={register} errors={errors} />

        {copySources ? (
          <div className="space-y-1.5">
            <Label htmlFor="role-copy-from" className="text-xs font-medium text-foreground">
              Sao chép quyền từ
            </Label>
            <Controller
              control={control}
              name="copyFromRoleId"
              render={({ field }) => (
                <Select
                  items={copyItems}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? NO_COPY)}
                  disabled={pending}
                >
                  <SelectTrigger id="role-copy-from" className="h-9 w-full bg-card text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {copyItems.map((item) => (
                      <SelectItem key={item.value || "none"} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        ) : null}

        <ActiveField control={control} />
      </fieldset>

      <SheetFooter className="flex-col gap-2 border-t border-border sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo vai trò"
          )}
        </Button>
      </SheetFooter>
    </form>
  )
}

/** Prefills the Vietnamese name and description shown on screen. */
function toEditValues(role: RoleSummary): UpdateRoleFormValues {
  return {
    name: roleDisplayName(role),
    description: roleDisplayDescription(role) ?? "",
    active: role.active,
  }
}

function EditRoleForm({
  role,
  existingRoles,
  onDirtyChange,
  onCancel,
  onSaved,
  onReload,
  onEditPermissions,
}: FormProps & {
  role: RoleSummary
  existingRoles: RoleSummary[]
  onReload?: () => Promise<RoleSummary | undefined>
  onEditPermissions?: (role: RoleSummary) => void
}) {
  const updateMutation = useUpdateRole(role.id)
  // The version the next save is based on. It only moves when the user reloads after a 409.
  const [base, setBase] = React.useState(role)
  const [reloading, setReloading] = React.useState(false)
  const [reloadFailed, setReloadFailed] = React.useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateRoleFormValues, unknown, ValidatedUpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: toEditValues(role),
  })

  React.useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])

  const pending = updateMutation.isPending
  const isConflict = isRoleVersionConflict(updateMutation.error)
  const isAdministrator = base.code === ADMINISTRATOR_ROLE_CODE
  const isPatient = base.code === PATIENT_ROLE_CODE

  // After a 409 the form keeps the user's input. Only an explicit reload replaces it, and the edit
  // is never resubmitted automatically.
  const reload = async () => {
    if (!onReload) return
    setReloading(true)
    setReloadFailed(false)
    try {
      const latest = await onReload()
      if (!latest) {
        setReloadFailed(true)
        return
      }
      setBase(latest)
      reset(toEditValues(latest))
      updateMutation.reset()
    } catch {
      setReloadFailed(true)
    } finally {
      setReloading(false)
    }
  }

  const onSubmit = async (values: ValidatedUpdateRoleFormValues) => {
    // A field left as its Vietnamese display text keeps the stored value, so changing only the
    // status neither renames a seeded role nor collides with another role's Vietnamese name.
    const shown = toEditValues(base)
    const nameChanged = values.name !== shown.name.trim()
    if (nameChanged && isRoleNameTaken(values.name, existingRoles, base.id)) {
      setError("name", { type: "duplicate", message: DUPLICATE_NAME_MESSAGE })
      return
    }
    try {
      const updated = await updateMutation.mutateAsync({
        name: nameChanged ? values.name : base.name,
        description:
          values.description.trim() === shown.description.trim()
            ? base.description
            : values.description,
        active: values.active,
        rowVersion: base.rowVersion,
      })
      toast.success(`Đã cập nhật vai trò ${roleDisplayName(updated)}.`)
      onSaved()
    } catch (error) {
      for (const fieldError of roleFieldErrors(error)) {
        if (fieldError.field !== "code") {
          setError(fieldError.field, { type: "server", message: fieldError.message })
        }
      }
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>Sửa vai trò</SheetTitle>
        <SheetDescription>{roleDisplayName(base)}</SheetDescription>
      </SheetHeader>

      <fieldset
        disabled={pending || reloading}
        className="m-0 min-w-0 flex-1 space-y-5 border-0 px-6 pb-4"
      >
        {updateMutation.error && roleFieldErrors(updateMutation.error).length === 0 ? (
          <div
            role="alert"
            className="space-y-2 rounded-lg border border-border bg-muted p-3 text-xs text-foreground"
          >
            <p>{roleFormErrorMessage(updateMutation.error, "edit")}</p>
            {isConflict && onReload ? (
              <Button type="button" variant="outline" size="sm" onClick={() => void reload()}>
                <RefreshCw className="size-3.5" />
                Tải lại
              </Button>
            ) : null}
          </div>
        ) : null}
        {reloadFailed ? (
          <p role="alert" className="text-xs text-destructive">
            Không thể tải lại vai trò. Vui lòng đóng và mở lại danh sách.
          </p>
        ) : null}

        <FormTextField
          id="role-name"
          label="Tên vai trò"
          required
          autoComplete="off"
          maxLength={ROLE_NAME_MAX_LENGTH}
          registration={register("name")}
          error={errors.name?.message}
        />

        <div className="space-y-1.5">
          <Label htmlFor="role-code" className="text-xs font-medium text-foreground">
            Mã vai trò
          </Label>
          <Input id="role-code" value={base.code} readOnly disabled className="font-mono" />
          <p className="text-xs text-muted-foreground">Mã vai trò không thể thay đổi sau khi tạo.</p>
        </div>

        <DescriptionField register={register} errors={errors} />

        <ActiveField
          control={control}
          disabled={isAdministrator || isPatient}
          hint={
            isAdministrator
              ? "Vai trò Quản trị viên luôn hoạt động để còn người quản trị được vai trò."
              : isPatient
                ? "Vai trò Bệnh nhân luôn hoạt động vì mọi tài khoản cổng bệnh nhân đều dùng vai trò này."
                : "Vai trò ngừng hoạt động không cấp quyền nào cho người dùng của vai trò."
          }
        />

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{base.userCount}</span> người
            dùng ·{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {base.permissionCount}
            </span>{" "}
            quyền
          </span>
          {onEditPermissions ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditPermissions(base)}
              className="text-primary"
            >
              <ShieldCheck className="size-3.5" />
              Sửa quyền
            </Button>
          ) : null}
        </div>
      </fieldset>

      <SheetFooter className="flex-col gap-2 border-t border-border sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending || reloading || !isDirty}>
          {pending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </SheetFooter>
    </form>
  )
}

function DescriptionField({
  register,
  errors,
}: {
  register: UseFormRegister<CreateRoleFormValues> | UseFormRegister<UpdateRoleFormValues>
  errors: FieldErrors<CreateRoleFormValues> | FieldErrors<UpdateRoleFormValues>
}) {
  const error = errors.description?.message
  return (
    <div className="space-y-1.5">
      <Label htmlFor="role-description" className="text-xs font-medium text-foreground">
        Mô tả
      </Label>
      <Textarea
        id="role-description"
        rows={3}
        maxLength={ROLE_DESCRIPTION_MAX_LENGTH}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "role-description-error" : undefined}
        {...(register as UseFormRegister<UpdateRoleFormValues>)("description")}
      />
      {error ? (
        <p id="role-description-error" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function ActiveField({
  control,
  disabled = false,
  hint = "Vai trò ngừng hoạt động không cấp quyền nào cho người dùng của vai trò.",
}: {
  control: Control<CreateRoleFormValues> | Control<UpdateRoleFormValues>
  disabled?: boolean
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Controller
        control={control as Control<UpdateRoleFormValues>}
        name="active"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="role-active"
              checked={field.value}
              disabled={disabled}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            <Label htmlFor="role-active" className="text-xs font-medium text-foreground">
              Hoạt động
            </Label>
          </div>
        )}
      />
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        {hint}
      </p>
    </div>
  )
}
