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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OrganizationDetail } from "../types"
import {
  updateOrganizationSchema,
  type UpdateOrganizationFormValues,
} from "../schemas"
import { useUpdateOrganization } from "../hooks/use-organizations"

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
  const { mutateAsync: updateOrganization, isPending } = useUpdateOrganization(
    organization.id
  )

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
      contactName: organization.contactName || organization.contactPerson || "",
      phone: organization.phone || organization.contactPhone || "",
      email: organization.email || "",
      address: organization.address || "",
      note: organization.note || "",
    },
  })

  // Synchronize form values whenever modal opens or organization changes
  React.useEffect(() => {
    if (open) {
      reset({
        name: organization.name,
        taxCode: organization.taxCode || "",
        contactName: organization.contactName || organization.contactPerson || "",
        phone: organization.phone || organization.contactPhone || "",
        email: organization.email || "",
        address: organization.address || "",
        note: organization.note || "",
      })
    }
  }, [open, organization, reset])

  const onSubmit = async (values: UpdateOrganizationFormValues) => {
    try {
      await updateOrganization({
        name: values.name,
        taxCode: values.taxCode || undefined,
        contactName: values.contactName,
        phone: values.phone,
        email: values.email || undefined,
        address: values.address || undefined,
        note: values.note || undefined,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update organization:", err)
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
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Tên đơn vị * */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-medium text-foreground">
              Tên đơn vị <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="VD: Công ty Cổ phần FPT"
              {...register("name")}
              className="h-9 text-xs"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Mã số thuế */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-taxCode" className="text-xs font-medium text-foreground">
              Mã số thuế
            </Label>
            <Input
              id="edit-taxCode"
              placeholder="VD: 0101243150"
              {...register("taxCode")}
              className="h-9 text-xs"
            />
            {errors.taxCode && (
              <p className="text-[11px] text-destructive">{errors.taxCode.message}</p>
            )}
          </div>

          {/* Người liên hệ * & Số điện thoại * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-contactName"
                className="text-xs font-medium text-foreground"
              >
                Người liên hệ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-contactName"
                placeholder="VD: Nguyễn Văn Hùng"
                {...register("contactName")}
                className="h-9 text-xs"
              />
              {errors.contactName && (
                <p className="text-[11px] text-destructive">
                  {errors.contactName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-phone"
                className="text-xs font-medium text-foreground"
              >
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phone"
                placeholder="VD: 0912 345 678"
                {...register("phone")}
                className="h-9 text-xs"
              />
              {errors.phone && (
                <p className="text-[11px] text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-email" className="text-xs font-medium text-foreground">
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="VD: hungnv@fpt.com.vn"
              {...register("email")}
              className="h-9 text-xs"
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-address" className="text-xs font-medium text-foreground">
              Địa chỉ
            </Label>
            <Input
              id="edit-address"
              placeholder="VD: Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội"
              {...register("address")}
              className="h-9 text-xs"
            />
            {errors.address && (
              <p className="text-[11px] text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-note" className="text-xs font-medium text-foreground">
              Ghi chú
            </Label>
            <Textarea
              id="edit-note"
              placeholder="VD: Đối tác khám sức khỏe định kỳ hằng năm."
              {...register("note")}
              className="text-xs min-h-[70px] resize-none"
            />
            {errors.note && (
              <p className="text-[11px] text-destructive">{errors.note.message}</p>
            )}
          </div>

          </div>
          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-9 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 text-xs font-medium "
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

