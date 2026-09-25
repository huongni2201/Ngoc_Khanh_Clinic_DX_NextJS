"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  createPatientSchema,
  type CreatePatientFormValues,
} from "../schemas/patient.schema"
import { useCreatePatient } from "../hooks/use-patients"
import { Patient } from "../types"

interface CreatePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newPatient: Patient) => void
}

export function CreatePatientDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePatientDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const createPatientMutation = useCreatePatient()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      gender: "MALE",
      identificationNumber: "",
      phoneNumber: "",
      email: "",
      address: "",
    },
  })

  const genderValue = useWatch({ control, name: "gender" })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setServerError(null)
      reset()
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: CreatePatientFormValues) => {
    try {
      setServerError(null)
      const patient = await createPatientMutation.mutateAsync({
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        identificationNumber: data.identificationNumber,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        address: data.address || undefined,
      })

      onOpenChange(false)
      if (onSuccess) {
        onSuccess(patient)
      }
    } catch (err) {
      setServerError((err as Error)?.message || "Không thể tạo hồ sơ bệnh nhân")
    }
  }

  const isPending = isSubmitting || createPatientMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tạo bệnh nhân mới
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Nhập thông tin hành chính cơ bản của bệnh nhân để tạo hồ sơ khám
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 -mr-1">
            {serverError && (
              <Alert variant="destructive" className="py-2.5 text-xs">
                <AlertCircle className="size-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Row 1: Full Name (8 cols) & Gender (4 cols) */}
              <div className="sm:col-span-8 space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Ví dụ: Nguyễn Văn A (viết hoa có dấu)"
                  {...register("fullName")}
                  className="h-9 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-medium text-foreground">
                  Giới tính <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={genderValue}
                  onValueChange={(val) =>
                    setValue("gender", val as "MALE" | "FEMALE" | "OTHER", {
                      shouldValidate: true,
                    })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="gender" className="h-9 text-xs">
                    <span>
                      {genderValue === "MALE"
                        ? "Nam"
                        : genderValue === "FEMALE"
                        ? "Nữ"
                        : genderValue === "OTHER"
                        ? "Khác"
                        : "Chọn giới tính"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Nam</SelectItem>
                    <SelectItem value="FEMALE">Nữ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Row 2: Date of Birth (4 cols) + Identification Number (4 cols) + Phone Number (4 cols) */}
              <div className="sm:col-span-4 space-y-1.5">
                <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground">
                  Ngày sinh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="h-9 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <Label
                  htmlFor="identificationNumber"
                  className="text-xs font-medium text-foreground"
                >
                  Số định danh (12 số) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="identificationNumber"
                  placeholder="001085002456"
                  maxLength={12}
                  {...register("identificationNumber")}
                  className="h-9 text-xs font-mono"
                  disabled={isPending}
                  aria-invalid={!!errors.identificationNumber}
                />
                {errors.identificationNumber && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.identificationNumber.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <Label
                  htmlFor="phoneNumber"
                  className="text-xs font-medium text-foreground"
                >
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="0912345678"
                  maxLength={10}
                  {...register("phoneNumber")}
                  className="h-9 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Row 3: Email (6 cols) & Address (6 cols) */}
              <div className="sm:col-span-6 space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="benhnhan@email.com"
                  {...register("email")}
                  className="h-9 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-6 space-y-1.5">
                <Label htmlFor="address" className="text-xs font-medium text-foreground">
                  Địa chỉ <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                </Label>
                <Input
                  id="address"
                  placeholder="Số nhà, đường phố, phường/xã, quận/huyện..."
                  {...register("address")}
                  className="h-9 text-xs"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg  cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
              {isPending ? "Đang xử lý..." : "Tạo bệnh nhân"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
