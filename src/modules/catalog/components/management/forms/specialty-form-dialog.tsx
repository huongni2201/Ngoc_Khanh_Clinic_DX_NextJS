"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormTextField } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { useCreateSpecialty, useUpdateSpecialty } from "../../../hooks/management/use-catalog-management"
import type { Specialty } from "../../../types/management"
import { CatalogMutationError } from "../catalog-mutation-error"
import { ApiClientError } from "@/shared/api/api-client"

const schema = z.object({
  code: z.string().trim().min(1, "Mã bắt buộc").max(50, "Tối đa 50 ký tự"),
  name: z.string().trim().min(1, "Tên bắt buộc").max(200, "Tối đa 200 ký tự"),
})

type FormValues = z.infer<typeof schema>

interface SpecialtyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialty?: Specialty
  isReloading?: boolean
  onReload?: () => Promise<void>
  onSuccess?: (spec?: Specialty) => void
}

export function SpecialtyFormDialog({
  open,
  onOpenChange,
  specialty,
  onSuccess,
  onReload,
  isReloading = false,
}: SpecialtyFormDialogProps) {
  const isEdit = !!specialty
  const createMutation = useCreateSpecialty()
  const updateMutation = useUpdateSpecialty(specialty?.id ?? "")
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: specialty?.code ?? "",
      name: specialty?.name ?? "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      let result: Specialty | undefined
      if (isEdit && specialty) {
        result = await updateMutation.mutateAsync({ name: values.name.trim(), rowVersion: specialty.rowVersion })
        toast.success(`Đã cập nhật chuyên khoa ${values.name}.`)
      } else {
        result = await createMutation.mutateAsync({
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
        })
        toast.success(`Đã tạo chuyên khoa ${values.name}.`)
      }
      reset()
      onOpenChange(false)
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof ApiClientError && err.fieldErrors.length > 0) {
        for (const fe of err.fieldErrors) {
          if (fe.field === "code") setError("code", { message: "Mã đã tồn tại." })
          if (fe.field === "name") setError("name", { message: "Tên không hợp lệ." })
        }
      }
    }
  }

  const handleCancel = () => { reset(); onOpenChange(false) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Sửa chuyên khoa" : "Thêm chuyên khoa mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit ? "Cập nhật tên chuyên khoa. Mã không thể thay đổi." : "Nhập mã và tên chuyên khoa. Mã do bạn nhập, không tự sinh và không thể đổi sau khi tạo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <CatalogMutationError error={mutation.error} entityLabel="chuyên khoa" onReload={onReload} />
            {!isEdit && (
              <FormTextField
                id="spec-code"
                label="Mã chuyên khoa"
                required
                placeholder="VD: TIM"
                maxLength={50}
                registration={register("code")}
                error={errors.code?.message}
              />
            )}
            <FormTextField
              id="spec-name"
              label="Tên chuyên khoa"
              required
              placeholder="VD: Tim mạch"
              maxLength={200}
              registration={register("name")}
              error={errors.name?.message}
            />
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" disabled={isReloading} onClick={handleCancel}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending || isReloading}>
              {mutation.isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm chuyên khoa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
