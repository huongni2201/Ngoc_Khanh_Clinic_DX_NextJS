"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, UserCog, Info } from "lucide-react"
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
  updatePatientSchema,
  type UpdatePatientFormValues,
} from "../schemas/patient.schema"
import { useUpdatePatient } from "../hooks/use-patients"
import { Patient } from "../types"

interface EditPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onSuccess?: (updatedPatient: Patient) => void
}

export function EditPatientDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: EditPatientDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const updatePatientMutation = useUpdatePatient(patient?.id || "")

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePatientFormValues>({
    resolver: zodResolver(updatePatientSchema),
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setServerError(null)
    }
    onOpenChange(nextOpen)
  }

  // Populate form with patient data on open
  React.useEffect(() => {
    if (patient && open) {
      reset({
        fullName: patient.fullName || "",
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
        gender: patient.gender || "MALE",
        identificationNumber: patient.identificationNumber || "",
        phoneNumber: patient.phoneNumber.replace(/\s+/g, "") || "",
        email: patient.email || "",
        address: patient.address || "",
      })
    }
  }, [patient, open, reset])

  const onSubmit = async (values: UpdatePatientFormValues) => {
    if (!patient) return
    setServerError(null)
    try {
      const updated = await updatePatientMutation.mutateAsync({
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        identificationNumber: values.identificationNumber,
        phoneNumber: values.phoneNumber,
        email: values.email || undefined,
        address: values.address || undefined,
      })
      onOpenChange(false)
      onSuccess?.(updated)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật thông tin bệnh nhân"
      setServerError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-6 sm:p-7 shadow-xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCog className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Chỉnh sửa thông tin bệnh nhân
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Cập nhật thông tin hành chính cho hồ sơ{" "}
                <span className="font-semibold text-foreground">
                  {patient?.fullName}
                </span>{" "}
                ({patient?.patientCode})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5 text-xs text-secondary-foreground border border-border/60">
          <Info className="size-4 shrink-0 text-primary" />
          <span>
            Chỉ cập nhật thông tin hành chính của bệnh nhân. Lịch sử khám bệnh và các đợt khám trước đó sẽ được giữ nguyên.
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Row: Patient Code (Readonly) & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-secondary-foreground">
                Mã bệnh nhân
              </Label>
              <Input
                value={patient?.patientCode || ""}
                disabled
                className="mt-1 h-9 rounded-lg bg-muted font-mono text-xs font-semibold text-foreground cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="edit-fullName"
                className="text-xs font-semibold text-secondary-foreground"
              >
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-fullName"
                placeholder="Nhập họ và tên bệnh nhân"
                {...register("fullName")}
                className="mt-1 h-9 rounded-lg text-xs"
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          </div>

          {/* Row: Date of Birth & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="edit-dateOfBirth"
                className="text-xs font-semibold text-secondary-foreground"
              >
                Ngày sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="mt-1 h-9 rounded-lg text-xs"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs font-semibold text-secondary-foreground">
                Giới tính <span className="text-destructive">*</span>
              </Label>
              <Select
                value={genderValue}
                onValueChange={(val: "MALE" | "FEMALE" | "OTHER" | null) => {
                  if (val) setValue("gender", val, { shouldValidate: true })
                }}
              >
                <SelectTrigger className="mt-1 h-9 rounded-lg text-xs">
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
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          {/* Row: Identification Number & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="edit-identificationNumber"
                className="text-xs font-semibold text-secondary-foreground"
              >
                Số định danh (CCCD/ĐDCN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-identificationNumber"
                placeholder="12 chữ số định danh cá nhân"
                maxLength={12}
                {...register("identificationNumber")}
                className="mt-1 h-9 rounded-lg font-mono text-xs"
              />
              {errors.identificationNumber && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.identificationNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="edit-phoneNumber"
                className="text-xs font-semibold text-secondary-foreground"
              >
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phoneNumber"
                placeholder="Ví dụ: 0912345678"
                maxLength={10}
                {...register("phoneNumber")}
                className="mt-1 h-9 rounded-lg text-xs"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Row: Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="edit-email"
                className="text-xs font-semibold text-secondary-foreground"
              >
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Ví dụ: patient@example.com"
                {...register("email")}
                className="mt-1 h-9 rounded-lg text-xs"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="edit-address"
                className="text-xs font-semibold text-secondary-foreground"
              >
                Địa chỉ liên hệ
              </Label>
              <Input
                id="edit-address"
                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                {...register("address")}
                className="mt-1 h-9 rounded-lg text-xs"
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || updatePatientMutation.isPending}
              className="h-9 rounded-lg text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updatePatientMutation.isPending}
              className="h-9 rounded-lg text-xs font-semibold"
            >
              {(isSubmitting || updatePatientMutation.isPending) && (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
