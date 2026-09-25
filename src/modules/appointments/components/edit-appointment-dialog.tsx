"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, AlertCircle, Loader2, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  editAppointmentSchema,
  type EditAppointmentFormValues,
} from "../schemas/appointment.schema"
import {
  useUpdateAppointment,
  useCancelAppointment,
} from "../hooks/use-appointments"
import { useExaminationRooms } from "@/modules/reception"
import { Appointment } from "../types"

interface EditAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  onSuccess?: () => void
}

const APPOINTMENT_EXAM_TYPES = [
  "Khám tổng quát",
  "Nội tổng quát",
  "Tim mạch",
  "Cơ xương khớp",
  "Khám da liễu",
  "Hô hấp",
  "Nội tiết",
  "Sản phụ khoa",
  "Khám sức khỏe định kỳ",
]

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: EditAppointmentDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false)

  const { data: rooms } = useExaminationRooms()
  const updateMutation = useUpdateAppointment(appointment?.id || "")
  const cancelMutation = useCancelAppointment()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<EditAppointmentFormValues>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      date: appointment?.date || "2026-09-24",
      time: appointment?.time || "09:00",
      physicianId: appointment?.physicianId || "doc-01",
      roomId: appointment?.roomId || "room-101",
      examinationType: appointment?.examinationType || "Khám tổng quát",
      notes: appointment?.notes || "",
    },
  })

  const examinationTypeValue = useWatch({ control, name: "examinationType" })
  const roomIdValue = useWatch({ control, name: "roomId" })

  React.useEffect(() => {
    if (appointment) {
      reset({
        date: appointment.date,
        time: appointment.time,
        physicianId: appointment.physicianId,
        roomId: appointment.roomId,
        examinationType: appointment.examinationType,
        notes: appointment.notes || "",
      })
    }
  }, [appointment, reset])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsConfirmingCancel(false)
      setServerError(null)
    }
    onOpenChange(isOpen)
  }

  if (!appointment) return null

  const onSubmit = async (data: EditAppointmentFormValues) => {
    try {
      setServerError(null)
      await updateMutation.mutateAsync({
        date: data.date,
        time: data.time,
        physicianId: data.physicianId,
        roomId: data.roomId,
        examinationType: data.examinationType,
        notes: data.notes || undefined,
      })

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setServerError((err as Error)?.message || "Không thể cập nhật lịch hẹn")
    }
  }

  const handleCancelAppointment = async () => {
    try {
      setServerError(null)
      await cancelMutation.mutateAsync({
        id: appointment.id,
        reason: "Lễ tân hủy theo yêu cầu của bệnh nhân",
      })

      setIsConfirmingCancel(false)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setServerError((err as Error)?.message || "Không thể hủy lịch hẹn")
    }
  }

  const isPending =
    isSubmitting || updateMutation.isPending || cancelMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl w-full p-0 gap-0 overflow-hidden bg-card border-border sm:rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-surface-alt flex items-center justify-center text-primary">
              <Edit className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Chỉnh sửa lịch hẹn
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                {appointment.appointmentCode} • {appointment.patientName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {serverError && (
              <Alert variant="destructive" className="py-2.5 text-xs">
                <AlertCircle className="size-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Patient Profile & Cancellation Section */}
              <div className="md:col-span-5 space-y-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  1. Người bệnh
                </span>

                <div className="p-4 rounded-xl border border-border bg-surface-alt/50 space-y-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {appointment.patientName}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-card text-primary font-mono text-[10px]"
                      >
                        {appointment.patientCode}
                      </Badge>
                    </div>
                    <div className="text-xs text-secondary-foreground pt-1 space-y-1">
                      <div>
                        SĐT: <strong className="text-foreground">{appointment.phoneNumber}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Kênh đặt hẹn:</span>
                    <Badge
                      variant="outline"
                      className="bg-card text-secondary-foreground text-[10px]"
                    >
                      {appointment.source === "ONLINE" ? "Đặt online" : "Lễ tân tạo"}
                    </Badge>
                  </div>
                </div>

                {/* Cancellation Confirmation Alert */}
                {isConfirmingCancel && (
                  <Alert variant="destructive" className="py-3 text-xs rounded-xl space-y-2">
                    <AlertCircle className="size-4" />
                    <AlertDescription className="space-y-2">
                      <p>Bạn có chắc chắn muốn hủy lịch hẹn này?</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setIsConfirmingCancel(false)}
                          className="text-foreground bg-card"
                        >
                          Không
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          onClick={handleCancelAppointment}
                          disabled={isPending}
                        >
                          Xác nhận hủy
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Right Column (7 cols): Editable Schedule Fields */}
              <div className="md:col-span-7 space-y-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  2. Lịch hẹn & Bác sĩ điều chỉnh
                </span>

                {/* Field: Examination Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="editExamType" className="text-xs font-medium text-foreground">
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
                    <SelectTrigger id="editExamType" className="h-9 text-xs">
                      <SelectValue placeholder="Chọn loại khám" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_EXAM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field: Room & Doctor */}
                <div className="space-y-1.5">
                  <Label htmlFor="editRoomDoctor" className="text-xs font-medium text-foreground">
                    Bác sĩ & Phòng khám <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={roomIdValue}
                    onValueChange={(val) => {
                      if (val) {
                        setValue("roomId", val, { shouldValidate: true })
                        const r = rooms?.find((rm) => rm.id === val)
                        if (r) {
                          setValue("physicianId", r.physicianId, { shouldValidate: true })
                        }
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="editRoomDoctor" className="h-9 text-xs">
                      <SelectValue placeholder="Chọn bác sĩ và phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms?.map((rm) => (
                        <SelectItem key={rm.id} value={rm.id}>
                          {rm.name} — {rm.physicianName} ({rm.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row: Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="editDate" className="text-xs font-medium text-foreground">
                      Ngày hẹn <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editDate"
                      type="date"
                      {...register("date")}
                      className="h-9 text-xs"
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="editTime" className="text-xs font-medium text-foreground">
                      Giờ hẹn <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editTime"
                      type="time"
                      {...register("time")}
                      className="h-9 text-xs"
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Field: Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="editNotes" className="text-xs font-medium text-foreground">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="editNotes"
                    {...register("notes")}
                    rows={2}
                    className="text-xs resize-none"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t border-border bg-card flex items-center justify-between sm:justify-between">
            {/* Danger Action: Hủy lịch (Doesn't compete visually with primary save) */}
            {!isConfirmingCancel ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingCancel(true)}
                disabled={isPending || appointment.status === "CANCELLED"}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Hủy lịch
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="text-xs"
              >
                Đóng
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
