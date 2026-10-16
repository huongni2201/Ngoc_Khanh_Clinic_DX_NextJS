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
import { useCreateMedicine, useUpdateMedicine } from "../../../hooks/management/use-catalog-management"
import type { Medicine } from "../../../types/management"
import { CatalogMutationError } from "../catalog-mutation-error"
import { ApiClientError } from "@/shared/api/api-client"

const schema = z.object({
  code: z.string().trim().min(1, "Mã bắt buộc").max(50, "Tối đa 50 ký tự"),
  genericName: z.string().trim().min(1, "Tên hoạt chất bắt buộc").max(300, "Tối đa 300 ký tự"),
  brandName: z.string().trim().max(300, "Tối đa 300 ký tự").optional(),
  strength: z.string().trim().min(1, "Hàm lượng bắt buộc").max(100, "Tối đa 100 ký tự"),
  dosageForm: z.string().trim().min(1, "Dạng bào chế bắt buộc").max(100, "Tối đa 100 ký tự"),
  unit: z.string().trim().min(1, "Đơn vị tính bắt buộc").max(50, "Tối đa 50 ký tự"),
})

type FormValues = z.infer<typeof schema>

interface MedicineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine?: Medicine
  isReloading?: boolean
  onReload?: () => Promise<void>
  onSuccess?: (med?: Medicine) => void
}

export function MedicineFormDialog({ open, onOpenChange, medicine, onSuccess, onReload, isReloading = false }: MedicineFormDialogProps) {
  const isEdit = !!medicine
  const createMutation = useCreateMedicine()
  const updateMutation = useUpdateMedicine(medicine?.id ?? "")
  const mutation = isEdit ? updateMutation : createMutation

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: medicine?.code ?? "",
      genericName: medicine?.genericName ?? "",
      brandName: medicine?.brandName ?? "",
      strength: medicine?.strength ?? "",
      dosageForm: medicine?.dosageForm ?? "",
      unit: medicine?.unit ?? "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      let result: Medicine | undefined
      if (isEdit && medicine) {
        result = await updateMutation.mutateAsync({
          genericName: values.genericName.trim(),
          brandName: values.brandName?.trim() || null,
          strength: values.strength.trim(),
          dosageForm: values.dosageForm.trim(),
          unit: values.unit.trim(),
          rowVersion: medicine.rowVersion,
        })
        toast.success(`Đã cập nhật thuốc ${values.genericName}.`)
      } else {
        result = await createMutation.mutateAsync({
          code: values.code.trim().toUpperCase(),
          genericName: values.genericName.trim(),
          brandName: values.brandName?.trim() || null,
          strength: values.strength.trim(),
          dosageForm: values.dosageForm.trim(),
          unit: values.unit.trim(),
        })
        toast.success(`Đã tạo thuốc ${values.genericName}.`)
      }
      reset()
      onOpenChange(false)
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof ApiClientError && err.fieldErrors.length > 0) {
        for (const fe of err.fieldErrors) {
          if (fe.field === "code") setError("code", { message: "Mã đã tồn tại." })
        }
      }
    }
  }

  const handleCancel = () => { reset(); onOpenChange(false) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-base font-bold">{isEdit ? "Sửa thuốc" : "Thêm thuốc mới"}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit ? "Cập nhật thông tin thuốc. Mã không thể thay đổi." : "Nhập thông tin thuốc. Mã do bạn nhập, không tự sinh và không thể đổi sau khi tạo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <CatalogMutationError error={mutation.error} entityLabel="thuốc" onReload={onReload} />

            {!isEdit && (
              <FormTextField
                id="med-code"
                label="Mã thuốc"
                required
                maxLength={50}
                placeholder="VD: AMOX500"
                registration={register("code")}
                error={errors.code?.message}
              />
            )}

            <FormTextField
              id="med-generic"
              label="Tên hoạt chất"
              required
              maxLength={300}
              placeholder="VD: Amoxicillin"
              registration={register("genericName")}
              error={errors.genericName?.message}
            />

            <FormTextField
              id="med-brand"
              label="Tên thương mại"
              maxLength={300}
              placeholder="VD: Amoxil"
              registration={register("brandName")}
              error={errors.brandName?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormTextField
                id="med-strength"
                label="Hàm lượng"
                required
                maxLength={100}
                placeholder="VD: 500mg"
                registration={register("strength")}
                error={errors.strength?.message}
              />
              <FormTextField
                id="med-unit"
                label="Đơn vị tính"
                required
                maxLength={50}
                placeholder="VD: Viên"
                registration={register("unit")}
                error={errors.unit?.message}
              />
            </div>

            <FormTextField
              id="med-dosage"
              label="Dạng bào chế"
              required
              maxLength={100}
              placeholder="VD: Viên nang"
              registration={register("dosageForm")}
              error={errors.dosageForm?.message}
            />
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" disabled={isReloading} onClick={handleCancel}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending || isReloading}>
              {mutation.isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm thuốc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
