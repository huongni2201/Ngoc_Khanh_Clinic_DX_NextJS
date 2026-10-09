"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OrganizationTextField } from "./organization-text-field"
import { ApiClientError } from "@/shared/api/api-client"
import { OrganizationDetail } from "../types"
import {
  updateOrganizationSchema,
  type UpdateOrganizationFormValues,
} from "../schemas"
import { useReloadOrganization, useUpdateOrganization } from "../hooks/use-organizations"

interface EditOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationDetail
}

export function EditOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: EditOrganizationDialogProps) {
  const {
    mutateAsync: updateOrganization,
    isPending,
    error: updateError,
    reset: resetUpdateError,
  } = useUpdateOrganization(organization.id)
  const {
    mutateAsync: reloadOrganization,
    isPending: isReloading,
    error: reloadError,
  } = useReloadOrganization(organization.id)
  // The version the next save is based on. It only moves when the user reloads after a 409.
  const [baseVersion, setBaseVersion] = React.useState(organization.rowVersion)
  const initializedRef = React.useRef(false)
  const isConflict = updateError instanceof ApiClientError && updateError.status === 409

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      taxCode: organization.taxCode || "",
      phone: organization.phone,
      email: organization.email,
      contactName: organization.contactName,
      contactPhone: organization.contactPhone,
      contactEmail: organization.contactEmail,
      address: organization.address,
    },
  })

  const toFormValues = React.useCallback(
    (source: OrganizationDetail): UpdateOrganizationFormValues => ({
      name: source.name,
      taxCode: source.taxCode || "",
      phone: source.phone,
      email: source.email,
      contactName: source.contactName,
      contactPhone: source.contactPhone,
      contactEmail: source.contactEmail,
      address: source.address,
    }),
    []
  )

  // Fills the form once per opening. A background refetch while the dialog is open never replaces
  // what the user typed; only the explicit reload after a 409 does.
  React.useEffect(() => {
    if (!open) {
      initializedRef.current = false
      return
    }
    if (!initializedRef.current) {
      initializedRef.current = true
      reset(toFormValues(organization))
      setBaseVersion(organization.rowVersion)
    }
  }, [open, organization, reset, toFormValues])

  // After a 409 the form keeps the user's input. Only an explicit reload replaces it, and the
  // edit is never resubmitted automatically.
  const handleReload = async () => {
    try {
      const latest = await reloadOrganization()
      reset(toFormValues(latest))
      setBaseVersion(latest.rowVersion)
      resetUpdateError()
    } catch {
      // The reload error is rendered in the dialog.
    }
  }

  const onSubmit = async (values: UpdateOrganizationFormValues) => {
    try {
      await updateOrganization({
        name: values.name,
        taxCode: values.taxCode || undefined,
        phone: values.phone,
        email: values.email,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        address: values.address,
        rowVersion: baseVersion,
      })
      onOpenChange(false)
    } catch {
      // The mutation error is rendered in the dialog.
    }
  }

  const handleCancel = () => {
    reset(toFormValues(organization))
    resetUpdateError()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-base font-bold text-foreground">
            Chỉnh sửa đơn vị
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cập nhật thông tin chi tiết của {organization.name}.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {updateError && (
            <div role="alert" className="space-y-2 text-xs text-destructive">
              <p>{updateError.message || "Không thể cập nhật đơn vị."}</p>
              {isConflict && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReload}
                  disabled={isReloading}
                  className="h-8 text-xs"
                >
                  {isReloading ? "Đang tải..." : "Tải lại dữ liệu mới nhất"}
                </Button>
              )}
            </div>
          )}
          {reloadError && (
            <p role="alert" className="text-xs text-destructive">
              {reloadError.message || "Không thể tải lại dữ liệu đơn vị."}
            </p>
          )}
          <fieldset className="space-y-4">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              Thông tin đơn vị
            </legend>
            <OrganizationTextField
              id="edit-name"
              label="Tên đơn vị"
              required
              placeholder="VD: Công ty Cổ phần ABC"
              autoComplete="organization"
              registration={register("name")}
              error={errors.name?.message}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <OrganizationTextField
                id="edit-taxCode"
                label="Mã số thuế"
                placeholder="VD: 0101234567"
                inputMode="numeric"
                registration={register("taxCode")}
                error={errors.taxCode?.message}
              />
              <OrganizationTextField
                id="edit-phone"
                label="Điện thoại đơn vị"
                type="tel"
                placeholder="VD: 024 3822 1234"
                registration={register("phone")}
                error={errors.phone?.message}
              />
            </div>
            <OrganizationTextField
              id="edit-email"
              label="Email đơn vị"
              required
              type="email"
              placeholder="VD: lienhe@congty.vn"
              registration={register("email")}
              error={errors.email?.message}
            />
            <OrganizationTextField
              id="edit-address"
              label="Địa chỉ"
              required
              placeholder="VD: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
              autoComplete="street-address"
              registration={register("address")}
              error={errors.address?.message}
            />
          </fieldset>

          <div aria-hidden="true" className="border-t border-border" />

          <fieldset className="space-y-4">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              Người liên hệ
            </legend>
            <OrganizationTextField
              id="edit-contact-name"
              label="Người liên hệ"
              required
              placeholder="VD: Nguyễn Văn A"
              autoComplete="name"
              registration={register("contactName")}
              error={errors.contactName?.message}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <OrganizationTextField
                id="edit-contact-phone"
                label="Số điện thoại"
                required
                type="tel"
                placeholder="VD: 0912 345 678"
                registration={register("contactPhone")}
                error={errors.contactPhone?.message}
              />
              <OrganizationTextField
                id="edit-contact-email"
                label="Email người liên hệ"
                required
                type="email"
                placeholder="VD: nguyenvana@congty.vn"
                registration={register("contactEmail")}
                error={errors.contactEmail?.message}
              />
            </div>
          </fieldset>
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-medium"
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
