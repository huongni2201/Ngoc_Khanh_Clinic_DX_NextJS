"use client"

import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PatientCheckInFormValues } from "../../schemas/reception.schema"

const EXAMINATION_TYPES = [
  "Khám tổng quát",
  "Khám nội tổng quát",
  "Khám cơ xương khớp",
  "Khám hô hấp - Tai Mũi Họng",
  "Khám da liễu",
  "Khám thai - Phụ khoa",
  "Khám tim mạch",
  "Khám mắt",
  "Khám sức khỏe đơn vị",
]

const REASON_SUGGESTIONS = [
  "Khám tổng quát",
  "Tái khám theo hẹn",
  "Sốt / Ho",
  "Đau bụng / Rối loạn tiêu hóa",
]

interface ClinicRoomOption {
  id: string
  name: string
  department: string
  physicianName: string
  waitingCount: number
}

interface CheckInEncounterFieldsProps {
  register: UseFormRegister<PatientCheckInFormValues>
  errors: FieldErrors<PatientCheckInFormValues>
  examinationType: string
  roomId: string | undefined
  printAfterReception: boolean
  rooms: ClinicRoomOption[] | undefined
  isPending: boolean
  onExaminationTypeChange: (examinationType: string) => void
  /** Called with the chosen room id, or `null` to leave the encounter unassigned. */
  onRoomChange: (roomId: string | null) => void
  onReasonSuggestion: (reason: string) => void
  onPrintAfterReceptionChange: (print: boolean) => void
}

/** Right column: examination type, room/doctor routing, reason, notes and the print toggle. */
export function CheckInEncounterFields({
  register,
  errors,
  examinationType,
  roomId,
  printAfterReception,
  rooms,
  isPending,
  onExaminationTypeChange,
  onRoomChange,
  onReasonSuggestion,
  onPrintAfterReceptionChange,
}: CheckInEncounterFieldsProps) {
  return (
    <div className="md:col-span-7 space-y-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
        2. Thông tin lượt khám & Điều phối
      </span>

      {/* Field: Examination Type */}
      <div className="space-y-1.5">
        <Label htmlFor="examinationType" className="text-xs font-medium text-foreground">
          Loại khám <span className="text-destructive">*</span>
        </Label>
        <Select
          value={examinationType}
          onValueChange={(val) => {
            if (val) onExaminationTypeChange(val)
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
          <p className="text-[11px] text-destructive font-medium">{errors.examinationType.message}</p>
        )}
      </div>

      {/* Field: Room & Doctor Assignment */}
      <div className="space-y-1.5">
        <Label htmlFor="roomId" className="text-xs font-medium text-foreground">
          Phòng khám / Bác sĩ phụ trách{" "}
          <span className="text-muted-foreground font-normal">(Có thể phân sau)</span>
        </Label>
        <Select
          value={roomId || "UNASSIGNED"}
          onValueChange={(val) => onRoomChange(!val || val === "UNASSIGNED" ? null : val)}
          disabled={isPending}
        >
          <SelectTrigger id="roomId" className="h-9 text-xs">
            <SelectValue placeholder="Chọn phòng khám và bác sĩ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNASSIGNED">Chưa phân phòng (Tiếp nhận trước)</SelectItem>
            {rooms?.map((rm) => (
              <SelectItem key={rm.id} value={rm.id}>
                {rm.name} - {rm.department} ({rm.physicianName}) — Đang chờ: {rm.waitingCount} người
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Field: Reason for Visit */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="reasonForVisit" className="text-xs font-medium text-foreground">
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
          {REASON_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onReasonSuggestion(suggestion)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt hover:bg-hover text-secondary-foreground border border-border/60 transition-colors"
            >
              + {suggestion}
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
          checked={printAfterReception}
          onCheckedChange={(checked) => onPrintAfterReceptionChange(!!checked)}
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
  )
}
