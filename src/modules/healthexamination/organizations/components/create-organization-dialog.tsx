"use client"

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
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from "../schemas"
import { useCreateOrganization } from "../hooks/use-organizations"
import { createOrganizationErrorMessage } from "../utils/organization-errors"

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (organizationId: string) => void
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOrganizationDialogProps) {
  const {
    mutateAsync: createOrganization,
    isPending,
    error: createError,
  } = useCreateOrganization()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      taxCode: "",
      email: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      address: "",
    },
  })

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      const created = await createOrganization({
        name: values.name,
        taxCode: values.taxCode || undefined,
        email: values.email,
        address: values.address,
        contactName: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
      })
      reset()
      onOpenChange(false)
      onCreated?.(created.id)
    } catch {
      // The mutation error is rendered in the dialog.
    }
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-base font-bold text-foreground">
            Thêm đơn vị mới
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập thông tin đơn vị tham gia khám sức khỏe định kỳ.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {createError && (
            <p role="alert" className="text-xs text-destructive">
              {createOrganizationErrorMessage(createError)}
            </p>
          )}
          <fieldset className="space-y-4">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              Thông tin đơn vị
            </legend>
            <OrganizationTextField
              id="create-name"
              label="Tên đơn vị"
              required
              placeholder="VD: Công ty Cổ phần ABC"
              autoComplete="organization"
              registration={register("name")}
              error={errors.name?.message}
            />
            <OrganizationTextField
              id="create-taxCode"
              label="Mã số thuế"
              placeholder="VD: 0101234567"
              inputMode="numeric"
              registration={register("taxCode")}
              error={errors.taxCode?.message}
            />
            <OrganizationTextField
              id="create-email"
              label="Email đơn vị"
              required
              type="email"
              placeholder="VD: lienhe@congty.vn"
              registration={register("email")}
              error={errors.email?.message}
            />
            <OrganizationTextField
              id="create-address"
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
              id="create-contact-name"
              label="Người liên hệ"
              required
              placeholder="VD: Nguyễn Văn A"
              autoComplete="name"
              registration={register("contactPerson")}
              error={errors.contactPerson?.message}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <OrganizationTextField
                id="create-contact-phone"
                label="Số điện thoại"
                required
                type="tel"
                placeholder="VD: 0912 345 678"
                registration={register("contactPhone")}
                error={errors.contactPhone?.message}
              />
              <OrganizationTextField
                id="create-contact-email"
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
              {isPending ? "Đang tạo..." : "Tạo đơn vị"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
