"use client"

import { useForm, Controller } from "react-hook-form"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/shared/ui/toaster"
import { useCreateDepartment, useUpdateDepartment } from "../../../hooks/management/use-catalog-management"
import type { Department } from "../../../types/management"
import { DEPARTMENT_TYPE_LABELS } from "../../../utils/management/catalog-management-utils"
import { CatalogMutationError } from "../catalog-mutation-error"
import { ApiClientError } from "@/shared/api/api-client"

const schema = z.object({
  code: z.string().trim().min(1, "Mã bắt buộc").max(50, "Tối đa 50 ký tự"),
  name: z.string().trim().min(1, "Tên bắt buộc").max(200, "Tối đa 200 ký tự"),
  departmentType: z.enum(["CLINICAL", "DIAGNOSTIC", "ADMINISTRATIVE"], {
    message: "Vui lòng chọn loại khoa",
  }),
})

type FormValues = z.infer<typeof schema>

interface DepartmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, switches to edit mode. */
  department?: Department
  isReloading?: boolean
  onReload?: () => Promise<void>
  onSuccess?: (dept?: Department) => void
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  onSuccess,
  onReload,
  isReloading = false,
}: DepartmentFormDialogProps) {
  const isEdit = !!department
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment(department?.id ?? "")

  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: department?.code ?? "",
      name: department?.name ?? "",
      departmentType: department?.departmentType ?? undefined,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      let result: Department | undefined
      if (isEdit && department) {
        result = await updateMutation.mutateAsync({
          name: values.name,
          departmentType: values.departmentType,
          rowVersion: department.rowVersion,
        })
        toast.success(`Đã cập nhật khoa ${values.name}.`)
      } else {
        result = await createMutation.mutateAsync({
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
          departmentType: values.departmentType,
        })
        toast.success(`Đã tạo khoa ${values.name}.`)
      }
      reset()
      onOpenChange(false)
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof ApiClientError && err.fieldErrors.length > 0) {
        for (const fe of err.fieldErrors) {
          if (fe.field === "code") setError("code", { message: "Mã đã tồn tại hoặc không hợp lệ." })
          if (fe.field === "name") setError("name", { message: "Tên không hợp lệ." })
        }
      }
      // Error shown by mutation.error below
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
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Sửa thông tin khoa" : "Thêm khoa mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? "Cập nhật tên và loại khoa. Mã khoa không thể thay đổi."
              : "Nhập mã, tên và loại khoa. Mã do bạn nhập, không tự sinh và không thể đổi sau khi tạo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <CatalogMutationError error={mutation.error} entityLabel="khoa" onReload={onReload} />

            {/* Code (create only) */}
            {!isEdit && (
              <FormTextField
                id="dept-code"
                label="Mã khoa"
                required
                placeholder="VD: NOI"
                maxLength={50}
                registration={register("code")}
                error={errors.code?.message}
              />
            )}

            {/* Name */}
            <FormTextField
              id="dept-name"
              label="Tên khoa"
              required
              placeholder="VD: Khoa Nội"
              maxLength={200}
              registration={register("name")}
              error={errors.name?.message}
            />

            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="dept-type">
                Loại khoa <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Controller
                control={control}
                name="departmentType"
                render={({ field }) => (
                  <Select items={DEPARTMENT_TYPE_LABELS} value={field.value ?? null} onValueChange={field.onChange}>
                    <SelectTrigger id="dept-type" aria-invalid={!!errors.departmentType}>
                      <SelectValue placeholder="Chọn loại khoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEPARTMENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.departmentType && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.departmentType.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" disabled={isReloading} onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending || isReloading}>
              {mutation.isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm khoa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
