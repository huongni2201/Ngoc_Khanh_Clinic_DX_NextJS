import * as React from "react"
import { Search, Calendar, X } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DoctorEncounterStatus } from "../types"

interface DoctorFilterToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  room: string
  onRoomChange: (val: string) => void
  status: DoctorEncounterStatus | "ALL"
  onStatusChange: (val: DoctorEncounterStatus | "ALL") => void
  doctor: string
  onDoctorChange: (val: string) => void
  date: string
  onDateChange: (val: string) => void
  onResetFilters: () => void
}

export function DoctorFilterToolbar({
  searchTerm,
  onSearchChange,
  room,
  onRoomChange,
  status,
  onStatusChange,
  doctor,
  onDoctorChange,
  date,
  onDateChange,
  onResetFilters,
}: DoctorFilterToolbarProps) {
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    room !== "ALL" ||
    status !== "ALL" ||
    doctor !== "Của tôi" ||
    date !== "25/09/2026"

  return (
    <div
      role="search"
      aria-label="Bộ lọc lượt khám"
      className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        {/* Tìm kiếm */}
        <div className="space-y-1.5 lg:col-span-3">
          <label
            htmlFor="doctor-worklist-search"
            className="text-xs font-semibold text-foreground tracking-tight"
          >
            Tìm kiếm
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="doctor-worklist-search"
              type="search"
              placeholder="Tìm mã lượt khám, tên bệnh nhân, SĐT..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9.5 pl-9 pr-4 text-xs sm:text-sm bg-background"
            />
          </div>
        </div>

        {/* Phòng khám */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-xs font-semibold text-foreground tracking-tight">
            Phòng khám
          </label>
          <Select value={room} onValueChange={(val) => onRoomChange(val ?? "ALL")}>
            <SelectTrigger aria-label="Lọc theo phòng khám" className="h-9.5 text-xs sm:text-sm bg-background">
              <SelectValue>
                {room === "ALL" ? "Tất cả" : room}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="Nội tổng quát">Nội tổng quát</SelectItem>
              <SelectItem value="Tim mạch">Tim mạch</SelectItem>
              <SelectItem value="Tai mũi họng">Tai mũi họng</SelectItem>
              <SelectItem value="Cơ xương khớp">Cơ xương khớp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trạng thái */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-xs font-semibold text-foreground tracking-tight">
            Trạng thái
          </label>
          <Select
            value={status}
            onValueChange={(val) => onStatusChange((val ?? "ALL") as DoctorEncounterStatus | "ALL")}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái" className="h-9.5 text-xs sm:text-sm bg-background">
              <SelectValue>
                {status === "ALL"
                  ? "Tất cả"
                  : status === "WAITING_EXAM"
                  ? "Chờ khám"
                  : status === "EXAMINING"
                  ? "Đang khám"
                  : status === "WAITING_CLS"
                  ? "Chờ CLS"
                  : status === "WAITING_CONCLUSION"
                  ? "Chờ kết luận"
                  : "Hoàn tất"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="WAITING_EXAM">Chờ khám</SelectItem>
              <SelectItem value="EXAMINING">Đang khám</SelectItem>
              <SelectItem value="WAITING_CLS">Chờ CLS</SelectItem>
              <SelectItem value="WAITING_CONCLUSION">Chờ kết luận</SelectItem>
              <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bác sĩ */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-xs font-semibold text-foreground tracking-tight">
            Bác sĩ
          </label>
          <Select value={doctor} onValueChange={(val) => onDoctorChange(val ?? "Của tôi")}>
            <SelectTrigger aria-label="Lọc theo bác sĩ" className="h-9.5 text-xs sm:text-sm bg-background">
              <SelectValue>
                {doctor === "ALL" ? "Tất cả bác sĩ" : doctor}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Của tôi">Của tôi</SelectItem>
              <SelectItem value="ALL">Tất cả bác sĩ</SelectItem>
              <SelectItem value="BS. Trần Minh Khoa">BS. Trần Minh Khoa</SelectItem>
              <SelectItem value="BS. Nguyễn Văn An">BS. Nguyễn Văn An</SelectItem>
              <SelectItem value="BS. Lê Thu Trang">BS. Lê Thu Trang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ngày khám */}
        <div className="space-y-1.5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="doctor-worklist-date"
              className="text-xs font-semibold text-foreground tracking-tight"
            >
              Ngày khám
            </label>
            {hasActiveFilters && (
              <span className="text-[10px] text-primary font-medium lg:hidden">
                Đang lọc
              </span>
            )}
          </div>
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="doctor-worklist-date"
              type="text"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              placeholder="25/09/2026"
              className="h-9.5 pl-9 pr-3 text-xs sm:text-sm bg-background font-mono"
            />
          </div>
        </div>

        {/* Xóa lọc */}
        <div className="lg:col-span-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            title="Đặt lại toàn bộ bộ lọc"
            className="h-9.5 w-full px-2 text-xs shrink-0 cursor-pointer border-border hover:bg-hover text-secondary-foreground disabled:opacity-40"
          >
            <X className="size-3.5 mr-1" />
            <span>Xóa lọc</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
