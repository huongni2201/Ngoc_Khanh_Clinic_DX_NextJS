"use client"

import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CreateAppointmentFormValues } from "../../schemas/appointment.schema"
import { APPOINTMENT_EXAM_TYPES } from "./exam-types"

interface ClinicRoomOption {
  id: string
  name: string
  physicianName: string
  department: string
}

interface AppointmentScheduleSectionProps {
  register: UseFormRegister<CreateAppointmentFormValues>
  errors: FieldErrors<CreateAppointmentFormValues>
  examinationType: string
  roomId: string
  rooms: ClinicRoomOption[] | undefined
  isPending: boolean
  onExaminationTypeChange: (examinationType: string) => void
  onRoomChange: (roomId: string) => void
}

/** Right-hand column: examination type, room/doctor, date, time and notes. */
export function AppointmentScheduleSection({
  register,
  errors,
  examinationType,
  roomId,
  rooms,
  isPending,
  onExaminationTypeChange,
  onRoomChange,
}: AppointmentScheduleSectionProps) {
  return (
    <div className="md:col-span-7 space-y-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
        2. Lịch khám & Chuyên khoa
      </span>

      {/* Field: Examination Type */}
      <div className="space-y-1.5">
        <Label htmlFor="examType" className="text-xs font-medium text-foreground">
          Loại khám <span className="text-destructive">*</span>
        </Label>
        <Select
          value={examinationType}
          onValueChange={(val) => {
            if (val) onExaminationTypeChange(val)
          }}
          disabled={isPending}
        >
          <SelectTrigger id="examType" className="h-9 text-xs">
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
        {errors.examinationType && (
          <p className="text-[11px] text-destructive font-medium">{errors.examinationType.message}</p>
        )}
      </div>

      {/* Field: Room & Doctor */}
      <div className="space-y-1.5">
        <Label htmlFor="roomDoctor" className="text-xs font-medium text-foreground">
          Bác sĩ & Phòng khám <span className="text-destructive">*</span>
        </Label>
        <Select
          value={roomId}
          onValueChange={(val) => {
            if (val) onRoomChange(val)
          }}
          disabled={isPending}
        >
          <SelectTrigger id="roomDoctor" className="h-9 text-xs">
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
          <Label htmlFor="date" className="text-xs font-medium text-foreground">
            Ngày hẹn <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            className="h-9 text-xs"
            disabled={isPending}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-[11px] text-destructive font-medium">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time" className="text-xs font-medium text-foreground">
            Giờ hẹn <span className="text-destructive">*</span>
          </Label>
          <Input
            id="time"
            type="time"
            {...register("time")}
            className="h-9 text-xs"
            disabled={isPending}
            aria-invalid={!!errors.time}
          />
          {errors.time && (
            <p className="text-[11px] text-destructive font-medium">{errors.time.message}</p>
          )}
        </div>
      </div>

      {/* Field: Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-foreground">
          Ghi chú hẹn khám
        </Label>
        <Textarea
          id="notes"
          placeholder="Yêu cầu cụ thể, dặn nhịn ăn sáng, mang theo kết quả cũ..."
          {...register("notes")}
          rows={2}
          className="text-xs resize-none"
          disabled={isPending}
        />
      </div>
    </div>
  )
}
