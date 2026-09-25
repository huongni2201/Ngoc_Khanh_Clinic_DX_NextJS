"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  receivePatientSchema,
  type ReceivePatientFormValues,
} from "../schemas/reception.schema"
import { useReceivePatient, useExaminationRooms } from "../hooks/use-reception"
import { Patient } from "@/modules/patients"
import { Encounter } from "../types"
import { Calendar, Building2 } from "lucide-react"

export interface ReceiveAppointmentContext {
  appointmentId: string
  appointmentCode: string
  examinationType?: string
  roomId?: string
  physicianId?: string
  notes?: string
  enterpriseName?: string
}

interface ReceivePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPatient?: Patient | null
  initialEncounter?: Encounter | null
  appointmentInfo?: ReceiveAppointmentContext | null
  onOpenPatientSearch?: () => void
  onSuccess?: (createdEncounter: Encounter, shouldPrint: boolean) => void
}

const EXAMINATION_TYPES = [
  "Khám tổng quát",
  "Khám nội tổng quát",
  "Khám cơ xương khớp",
  "Khám hô hấp - Tai Mũi Họng",
  "Khám da liễu",
  "Khám thai - Phụ khoa",
  "Khám tim mạch",
  "Khám mắt",
  "Khám sức khỏe doanh nghiệp",
]

export function ReceivePatientDialog({
  open,
  onOpenChange,
  initialPatient,
  initialEncounter,
  appointmentInfo,
  onOpenPatientSearch,
  onSuccess,
}: ReceivePatientDialogProps) {
  const [patientOverride, setPatientOverride] = React.useState<Patient | null>(null)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const selectedPatient =
    patientOverride ??
    initialPatient ??
    (initialEncounter
      ? {
          id: initialEncounter.patientId,
          patientCode: initialEncounter.patientCode,
          fullName: initialEncounter.patientName,
          birthYear: initialEncounter.birthYear,
          dateOfBirth: initialEncounter.dateOfBirth,
          gender: initialEncounter.gender,
          phoneNumber: initialEncounter.phoneNumber,
          identificationNumber: initialEncounter.identificationNumber,
        }
      : null)

  const { data: rooms } = useExaminationRooms()
  const receiveMutation = useReceivePatient()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReceivePatientFormValues>({
    resolver: zodResolver(receivePatientSchema),
    defaultValues: {
      patientId: initialPatient?.id || initialEncounter?.patientId || "",
      examinationType: initialEncounter?.examinationType || "Khám tổng quát",
      roomId: initialEncounter?.roomId || "",
      physicianId: initialEncounter?.physicianId || "",
      reasonForVisit: initialEncounter?.reasonForVisit || "",
      notes: initialEncounter?.notes || "",
      printAfterReception: true,
    },
  })

  const examinationTypeValue = useWatch({ control, name: "examinationType" })
  const roomIdValue = useWatch({ control, name: "roomId" })
  const printAfterReceptionValue = useWatch({ control, name: "printAfterReception" })

  React.useEffect(() => {
    if (selectedPatient?.id) {
      setValue("patientId", selectedPatient.id, { shouldValidate: true })
    }
  }, [selectedPatient?.id, setValue])

  React.useEffect(() => {
    if (open) {
      if (selectedPatient?.id) {
        setValue("patientId", selectedPatient.id)
      }
      if (initialEncounter?.examinationType) {
        setValue("examinationType", initialEncounter.examinationType)
      }
      if (initialEncounter?.roomId) {
        setValue("roomId", initialEncounter.roomId)
      }
      if (initialEncounter?.physicianId) {
        setValue("physicianId", initialEncounter.physicianId)
      }
      if (initialEncounter?.reasonForVisit) {
        setValue("reasonForVisit", initialEncounter.reasonForVisit)
      }
      if (appointmentInfo) {
        if (appointmentInfo.examinationType) {
          setValue("examinationType", appointmentInfo.examinationType)
        }
        if (appointmentInfo.roomId) {
          setValue("roomId", appointmentInfo.roomId)
        }
        if (appointmentInfo.physicianId) {
          setValue("physicianId", appointmentInfo.physicianId)
        }
        if (appointmentInfo.notes) {
          setValue("reasonForVisit", appointmentInfo.notes)
        }
      }
    }
  }, [open, selectedPatient?.id, initialEncounter, appointmentInfo, setValue])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setServerError(null)
      setPatientOverride(null)
      reset()
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: ReceivePatientFormValues) => {
    if (!selectedPatient) {
      setServerError("Vui lòng chọn hoặc tìm bệnh nhân trước khi tiếp nhận")
      return
    }

    try {
      setServerError(null)
      const encounter = await receiveMutation.mutateAsync({
        patientId: selectedPatient.id,
        examinationType: data.examinationType,
        roomId: data.roomId || undefined,
        physicianId: data.physicianId || undefined,
        reasonForVisit: data.reasonForVisit || undefined,
        notes: data.notes || undefined,
        printAfterReception: data.printAfterReception,
      })

      onOpenChange(false)
      reset()
      if (onSuccess) {
        onSuccess(encounter, !!data.printAfterReception)
      }
    } catch (err) {
      setServerError((err as Error)?.message || "Lỗi khi tiếp nhận bệnh nhân")
    }
  }

  const isPending = isSubmitting || receiveMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-2xl shadow-xl overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tiếp nhận bệnh nhân
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tạo lượt khám (Encounter) và chuyển bệnh nhân vào hàng đợi phòng khám
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

            {appointmentInfo && (
              <div className="p-3 rounded-xl border border-primary/30 bg-selected flex items-center justify-between text-xs text-primary">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 shrink-0 text-primary" />
                  <span>
                    Tiếp nhận theo lịch hẹn:{" "}
                    <strong className="font-mono">{appointmentInfo.appointmentCode}</strong>
                  </span>
                </div>
                {appointmentInfo.enterpriseName && (
                  <span className="flex items-center gap-1 font-medium text-[11px] bg-card px-2 py-0.5 rounded-md border border-primary/20">
                    <Building2 className="size-3" />
                    {appointmentInfo.enterpriseName}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Patient Profile & Verification */}
              <div className="md:col-span-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    1. Hồ sơ người bệnh
                  </span>
                  {selectedPatient && onOpenPatientSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onOpenPatientSearch}
                      className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-surface-alt"
                    >
                      Đổi bệnh nhân
                    </Button>
                  )}
                </div>

                {selectedPatient ? (
                  <div className="p-4 rounded-xl border border-border bg-surface-alt/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {selectedPatient.fullName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="outline"
                            className="bg-card text-primary font-mono text-[10px] px-1.5 py-0"
                          >
                            {selectedPatient.patientCode}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {selectedPatient.gender === "MALE"
                              ? "Nam"
                              : selectedPatient.gender === "FEMALE"
                                ? "Nữ"
                                : "Khác"}{" "}
                            • {selectedPatient.birthYear}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                      <div className="flex items-center justify-between text-secondary-foreground">
                        <span>Số định danh:</span>
                        <span className="font-mono text-foreground font-semibold">
                          {selectedPatient.identificationNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-secondary-foreground">
                        <span>Số điện thoại:</span>
                        <strong className="text-foreground">
                          {selectedPatient.phoneNumber}
                        </strong>
                      </div>
                      {selectedPatient.dateOfBirth && (
                        <div className="flex items-center justify-between text-secondary-foreground">
                          <span>Ngày sinh:</span>
                          <span className="text-foreground font-mono">
                            {selectedPatient.dateOfBirth}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-border bg-surface-alt/40 flex flex-col items-center justify-center text-center gap-2.5">
                    <p className="text-xs text-muted-foreground">
                      Chưa chọn bệnh nhân để tiếp nhận
                    </p>
                    {onOpenPatientSearch && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onOpenPatientSearch}
                        className="gap-1.5 text-xs bg-card"
                      >
                        <Search className="size-3.5" />
                        Tìm & Chọn bệnh nhân
                      </Button>
                    )}
                  </div>
                )}

                {errors.patientId?.message && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.patientId.message}
                  </p>
                )}

                {/* Workflow Guidance Badge */}
                <div className="p-3.5 rounded-lg border border-border/80 bg-surface-alt/30 space-y-1 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground text-[11px] flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Lưu ý luồng tiếp nhận:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Sau khi tiếp nhận, bệnh nhân sẽ tự động vào danh sách chờ khám tại phòng đã phân hoặc danh sách chờ điều phối.
                  </p>
                </div>
              </div>

              {/* Right Column (7 cols): Clinical Routing & Encounter Info */}
              <div className="md:col-span-7 space-y-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  2. Thông tin lượt khám & Điều phối
                </span>

                {/* Field: Examination Type */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="examinationType"
                    className="text-xs font-medium text-foreground"
                  >
                    Loại khám <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={examinationTypeValue}
                    onValueChange={(val) => {
                      if (val) {
                        setValue("examinationType", val, { shouldValidate: true })
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="examinationType" className="h-9 text-xs">
                      <SelectValue placeholder="Chọn loại khám" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAMINATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.examinationType && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.examinationType.message}
                    </p>
                  )}
                </div>

                {/* Field: Room & Doctor Assignment */}
                <div className="space-y-1.5">
                  <Label htmlFor="roomId" className="text-xs font-medium text-foreground">
                    Phòng khám / Bác sĩ phụ trách{" "}
                    <span className="text-muted-foreground font-normal">
                      (Có thể phân sau)
                    </span>
                  </Label>
                  <Select
                    value={roomIdValue || "UNASSIGNED"}
                    onValueChange={(val) => {
                      if (!val || val === "UNASSIGNED") {
                        setValue("roomId", "")
                        setValue("physicianId", "")
                      } else {
                        setValue("roomId", val)
                        const rm = rooms?.find((r) => r.id === val)
                        if (rm) {
                          setValue("physicianId", rm.physicianId)
                        }
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="roomId" className="h-9 text-xs">
                      <SelectValue placeholder="Chọn phòng khám và bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">
                        Chưa phân phòng (Tiếp nhận trước)
                      </SelectItem>
                      {rooms?.map((rm) => (
                        <SelectItem key={rm.id} value={rm.id}>
                          {rm.name} - {rm.department} ({rm.physicianName}) — Đang chờ:{" "}
                          {rm.waitingCount} người
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field: Reason for Visit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="reasonForVisit"
                      className="text-xs font-medium text-foreground"
                    >
                      Lý do đến khám{" "}
                      <span className="text-muted-foreground font-normal">(Triệu chứng chính)</span>
                    </Label>
                  </div>
                  <Input
                    id="reasonForVisit"
                    placeholder="Ví dụ: Đau đầu kéo dài 3 ngày, sốt nhẹ, ho đờm..."
                    {...register("reasonForVisit")}
                    className="h-9 text-xs"
                    disabled={isPending}
                  />
                  {/* Quick symptom recommendation chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-muted-foreground">Gợi ý nhanh:</span>
                    {["Khám tổng quát", "Tái khám theo hẹn", "Sốt / Ho", "Đau bụng / Rối loạn tiêu hóa"].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setValue("reasonForVisit", sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt hover:bg-hover text-secondary-foreground border border-border/60 transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field: Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-medium text-foreground">
                    Ghi chú hành chính / Dặn dò
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ghi chú thêm từ lễ tân (tiền sử dị ứng khai báo, BHYT, hẹn trước...)"
                    {...register("notes")}
                    rows={2}
                    className="text-xs resize-none"
                    disabled={isPending}
                  />
                </div>

                {/* Toggle: Print form after reception */}
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="printAfterReception"
                    checked={printAfterReceptionValue}
                    onCheckedChange={(checked) =>
                      setValue("printAfterReception", !!checked)
                    }
                    disabled={isPending}
                  />
                  <label
                    htmlFor="printAfterReception"
                    className="text-xs text-foreground cursor-pointer select-none font-medium"
                  >
                    In phiếu khám bệnh ngay sau khi tiếp nhận
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg shadow-2xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedPatient}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
              {isPending ? "Đang tiếp nhận..." : "Tiếp nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
