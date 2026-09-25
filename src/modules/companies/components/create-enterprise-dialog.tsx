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
import {
  createEnterpriseSchema,
  type CreateEnterpriseFormValues,
} from "../schemas"
import { useCreateEnterprise } from "../hooks/use-enterprises"

interface CreateEnterpriseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEnterpriseDialog({
  open,
  onOpenChange,
}: CreateEnterpriseDialogProps) {
  const { mutateAsync: createEnterprise, isPending } = useCreateEnterprise()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEnterpriseFormValues>({
    resolver: zodResolver(createEnterpriseSchema),
    defaultValues: {
      name: "",
      taxCode: "",
      contactPerson: "",
      contactPhone: "",
      address: "",
    },
  })

  const onSubmit = async (values: CreateEnterpriseFormValues) => {
    try {
      await createEnterprise(values)
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to create enterprise:", err)
    }
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-base font-bold text-foreground">
            Thêm doanh nghiệp mới
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập thông tin doanh nghiệp tham gia khám sức khỏe định kỳ.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Tên doanh nghiệp * */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-foreground">
              Tên doanh nghiệp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Công ty Cổ phần ABC"
              {...register("name")}
              className="h-9 text-xs"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Mã số thuế */}
          <div className="space-y-1.5">
            <Label htmlFor="taxCode" className="text-xs font-medium text-foreground">
              Mã số thuế
            </Label>
            <Input
              id="taxCode"
              placeholder="VD: 0101234567"
              {...register("taxCode")}
              className="h-9 text-xs"
            />
            {errors.taxCode && (
              <p className="text-[11px] text-destructive">
                {errors.taxCode.message}
              </p>
            )}
          </div>

          {/* Người liên hệ * & Số điện thoại * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="contactPerson"
                className="text-xs font-medium text-foreground"
              >
                Người liên hệ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPerson"
                placeholder="VD: Nguyễn Văn A"
                {...register("contactPerson")}
                className="h-9 text-xs"
              />
              {errors.contactPerson && (
                <p className="text-[11px] text-destructive">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="contactPhone"
                className="text-xs font-medium text-foreground"
              >
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPhone"
                placeholder="VD: 0912 345 678"
                {...register("contactPhone")}
                className="h-9 text-xs"
              />
              {errors.contactPhone && (
                <p className="text-[11px] text-destructive">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="space-y-1.5">
            <Label
              htmlFor="address"
              className="text-xs font-medium text-foreground"
            >
              Địa chỉ
            </Label>
            <Input
              id="address"
              placeholder="VD: Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội"
              {...register("address")}
              className="h-9 text-xs"
            />
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
              {isPending ? "Đang tạo..." : "Tạo doanh nghiệp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
