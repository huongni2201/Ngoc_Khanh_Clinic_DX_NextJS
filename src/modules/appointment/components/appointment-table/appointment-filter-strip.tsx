"use client"

import { Search, Filter } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AppointmentFilterStripProps {
  searchTerm: string
  onSearchChange: (search: string) => void
  selectedDoctorId: string
  onDoctorChange: (physicianId: string) => void
  selectedExamType: string
  onExamTypeChange: (type: string) => void
  selectedCareProgram: string
  onCareProgramChange?: (program: string) => void
}

export function AppointmentFilterStrip({
  searchTerm,
  onSearchChange,
  selectedDoctorId,
  onDoctorChange,
  selectedExamType,
  onExamTypeChange,
  selectedCareProgram,
  onCareProgramChange,
}: AppointmentFilterStripProps) {
  return (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface-alt/50">
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo tên bệnh nhân, SĐT, mã hẹn..."
        className="h-8.5 pl-8.5 pr-3 text-xs bg-card border-border"
      />
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
      <Filter className="size-3.5 text-primary shrink-0 hidden sm:block" />

      {/* Type Filter: Cá nhân vs Đơn vị */}
      {onCareProgramChange && (
        <Select
          value={selectedCareProgram}
          onValueChange={(val) => onCareProgramChange(val || "ALL")}
        >
          <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-40">
            <SelectValue placeholder="Tất cả đối tượng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả đối tượng</SelectItem>
            <SelectItem value="INDIVIDUAL">Khám cá nhân</SelectItem>
            <SelectItem value="ORGANIZATION_HEALTH_EXAMINATION">Khám đơn vị</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Doctor Filter */}
      <Select
        value={selectedDoctorId}
        onValueChange={(val) => onDoctorChange(val || "ALL")}
      >
        <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-40">
          <SelectValue placeholder="Tất cả bác sĩ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả bác sĩ</SelectItem>
        </SelectContent>
      </Select>

      {/* Exam Type Filter */}
      <Select
        value={selectedExamType}
        onValueChange={(val) => onExamTypeChange(val || "ALL")}
      >
        <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-44">
          <SelectValue placeholder="Tất cả loại khám" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả loại khám</SelectItem>
          <SelectItem value="Khám tổng quát">Khám tổng quát</SelectItem>
          <SelectItem value="Nội tổng quát">Nội tổng quát</SelectItem>
          <SelectItem value="Khám sức khỏe đơn vị">
            Khám sức khỏe đơn vị
          </SelectItem>
          <SelectItem value="Tim mạch">Tim mạch</SelectItem>
          <SelectItem value="Cơ xương khớp">Cơ xương khớp</SelectItem>
          <SelectItem value="Khám da liễu">Khám da liễu</SelectItem>
          <SelectItem value="Hô hấp">Hô hấp</SelectItem>
          <SelectItem value="Nội tiết">Nội tiết</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
  )
}
