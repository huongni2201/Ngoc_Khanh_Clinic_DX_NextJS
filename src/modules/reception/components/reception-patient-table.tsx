"use client"

import * as React from "react"
import {
  UserCheck,
  DoorOpen,
  Eye,
  CreditCard,
  Printer,
  Search,
  Filter,
} from "@/shared/ui/product-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReceptionStatusBadge } from "./reception-status-badge"
import { Encounter, ReceptionTab, ExaminationRoom } from "../types"
import { cn } from "@/lib/utils"

interface ReceptionPatientTableProps {
  encounters: Encounter[]
  isLoading: boolean
  activeTab: ReceptionTab
  onTabChange: (tab: ReceptionTab) => void
  rooms: ExaminationRoom[]
  selectedRoomId: string
  onRoomChange: (roomId: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  onReceivePatient: (encounter: Encounter) => void
  onAssignRoom: (encounter: Encounter) => void
  onViewEncounter: (encounter: Encounter) => void
  onProcessPayment: (encounter: Encounter) => void
  onPrintForm: (encounter: Encounter) => void
  onCancelEncounter?: (encounter: Encounter) => void
}

export function ReceptionPatientTable({
  encounters,
  isLoading,
  activeTab,
  onTabChange,
  rooms,
  selectedRoomId,
  onRoomChange,
  searchTerm,
  onSearchChange,
  onReceivePatient,
  onAssignRoom,
  onViewEncounter,
  onProcessPayment,
  onPrintForm,
}: ReceptionPatientTableProps) {
  const tabs: { key: ReceptionTab; label: string }[] = [
    { key: "ALL", label: "Tất cả" },
    { key: "WAITING_RECEPTION", label: "Chờ tiếp nhận" },
    { key: "WAITING_EXAM", label: "Chờ khám" },
    { key: "EXAMINING", label: "Đang khám" },
    { key: "WAITING_PAYMENT", label: "Chờ thu phí" },
    { key: "WAITING_RESULT", label: "Chờ kết quả" },
    { key: "COMPLETED", label: "Hoàn tất" },
  ]

  // Render context-sensitive primary button for each row (Unified Neutral Icon Button)
  const renderRowPrimaryAction = (encounter: Encounter) => {
    switch (encounter.status) {
      case "WAITING_RECEPTION":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReceivePatient(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Tiếp nhận - ${encounter.patientName}`}
            aria-label="Tiếp nhận"
          >
            <UserCheck className="size-3.5" />
            <span className="sr-only">Tiếp nhận</span>
          </Button>
        )
      case "RECEIVED":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAssignRoom(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Phân phòng - ${encounter.patientName}`}
            aria-label="Phân phòng"
          >
            <DoorOpen className="size-3.5" />
            <span className="sr-only">Phân phòng</span>
          </Button>
        )
      case "WAITING_EXAM":
      case "EXAMINING":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewEncounter(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Xem lượt khám - ${encounter.patientName}`}
            aria-label="Xem lượt khám"
          >
            <Eye className="size-3.5" />
            <span className="sr-only">Xem lượt khám</span>
          </Button>
        )
      case "WAITING_PAYMENT":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onProcessPayment(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Thu phí - ${encounter.patientName}`}
            aria-label="Thu phí"
          >
            <CreditCard className="size-3.5" />
            <span className="sr-only">Thu phí</span>
          </Button>
        )
      case "WAITING_RESULT":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewEncounter(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Xem tiến trình - ${encounter.patientName}`}
            aria-label="Xem tiến trình"
          >
            <Eye className="size-3.5" />
            <span className="sr-only">Xem tiến trình</span>
          </Button>
        )
      case "COMPLETED":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewEncounter(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Xem hồ sơ - ${encounter.patientName}`}
            aria-label="Xem hồ sơ"
          >
            <Eye className="size-3.5" />
            <span className="sr-only">Xem hồ sơ</span>
          </Button>
        )
      default:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewEncounter(encounter)}
            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
            title={`Chi tiết - ${encounter.patientName}`}
            aria-label="Chi tiết"
          >
            <Eye className="size-3.5" />
            <span className="sr-only">Chi tiết</span>
          </Button>
        )
    }
  }

  return (
    <div className="flex flex-col flex-1 rounded-lg border border-border bg-card  overflow-hidden">
      {/* Top Header of Work Area: Title & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border px-5 pt-4 pb-0 gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Bệnh nhân hôm nay
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt font-medium text-primary">
            {encounters.length}
          </span>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 -mb-px scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-secondary-foreground hover:text-foreground hover:border-border"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface-alt/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, SĐT, số định danh, mã..."
            className="h-8.5 pl-8.5 pr-3 text-xs bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
          <Select value={selectedRoomId} onValueChange={(val) => onRoomChange(val || "ALL")}>
            <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-56">
              <SelectValue placeholder="Tất cả phòng khám" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phòng khám</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} - {room.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-alt/40 hover:bg-surface-alt/40 border-b border-border">
              <TableHead className="w-24 text-[11px] font-semibold text-foreground h-9 px-4">
                Mã BN
              </TableHead>
              <TableHead className="min-w-[160px] text-[11px] font-semibold text-foreground h-9 px-4">
                Họ và tên
              </TableHead>
              <TableHead className="w-20 text-[11px] font-semibold text-foreground h-9 px-3 text-center">
                Năm sinh
              </TableHead>
              <TableHead className="w-20 text-[11px] font-semibold text-foreground h-9 px-3 text-center">
                Giới tính
              </TableHead>
              <TableHead className="w-32 text-[11px] font-semibold text-foreground h-9 px-4">
                Số điện thoại
              </TableHead>
              <TableHead className="w-24 text-[11px] font-semibold text-foreground h-9 px-3 text-center">
                Giờ đến
              </TableHead>
              <TableHead className="min-w-[200px] text-[11px] font-semibold text-foreground h-9 px-4">
                Phòng / Bác sĩ
              </TableHead>
              <TableHead className="w-36 text-[11px] font-semibold text-foreground h-9 px-4 text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-48 min-w-[190px] text-[11px] font-semibold text-foreground h-9 px-4 text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-48 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách bệnh nhân...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : encounters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-48 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 py-8">
                    <div className="size-9 rounded-full bg-surface-alt flex items-center justify-center text-muted-foreground mb-1">
                      <Search className="size-4" />
                    </div>
                    <p className="font-semibold text-foreground">
                      Không có bệnh nhân nào trong danh sách
                    </p>
                    <p className="text-muted-foreground text-[11px] max-w-sm">
                      {searchTerm || selectedRoomId !== "ALL"
                        ? "Không tìm thấy kết quả phù hợp với bộ lọc hiện tại. Thử xóa bớt điều kiện lọc."
                        : "Chưa có lượt khám nào cho trạng thái này hôm nay."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              encounters.map((encounter) => {
                const genderText =
                  encounter.gender === "MALE"
                    ? "Nam"
                    : encounter.gender === "FEMALE"
                      ? "Nữ"
                      : "Khác"

                return (
                  <TableRow
                    key={encounter.id}
                    className="hover:bg-hover/50 border-b border-divider transition-colors"
                  >
                    {/* Mã BN */}
                    <TableCell className="font-mono text-xs font-semibold text-primary px-4 py-3">
                      {encounter.patientCode}
                    </TableCell>

                    {/* Họ và tên & Examination type */}
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          {encounter.patientName}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {encounter.examinationType}
                        </span>
                      </div>
                    </TableCell>

                    {/* Năm sinh */}
                    <TableCell className="text-xs text-secondary-foreground text-center px-3 py-3">
                      {encounter.birthYear}
                    </TableCell>

                    {/* Giới tính */}
                    <TableCell className="text-xs text-secondary-foreground text-center px-3 py-3">
                      {genderText}
                    </TableCell>

                    {/* Số điện thoại */}
                    <TableCell className="text-xs font-medium text-foreground px-4 py-3">
                      {encounter.phoneNumber}
                    </TableCell>

                    {/* Giờ đến */}
                    <TableCell className="text-xs font-mono text-secondary-foreground text-center px-3 py-3">
                      {encounter.arrivalTime}
                    </TableCell>

                    {/* Phòng / Bác sĩ */}
                    <TableCell className="px-4 py-3">
                      {encounter.roomName || encounter.physicianName ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">
                            {encounter.roomName || "Chưa chọn phòng"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {encounter.physicianName || "Chưa phân bác sĩ"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Chưa phân phòng
                        </span>
                      )}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="px-4 py-3 text-center">
                      <ReceptionStatusBadge status={encounter.status} />
                    </TableCell>

                    {/* Thao tác: Toàn bộ là icon buttons đồng bộ, bỏ dropdown ... */}
                    <TableCell className="w-36 min-w-[120px] px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Nút trạng thái / nghiệp vụ chính */}
                        {renderRowPrimaryAction(encounter)}

                        {/* 2. Nút In giấy khám bệnh */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPrintForm(encounter)}
                          className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
                          title={`In giấy khám bệnh - ${encounter.patientName}`}
                          aria-label={`In giấy khám bệnh cho ${encounter.patientName}`}
                        >
                          <Printer className="size-3.5" />
                          <span className="sr-only">{`In giấy khám bệnh cho ${encounter.patientName}`}</span>
                        </Button>

                        {/* 3. Nút bổ trợ: Nếu trạng thái chính là Thu phí thì hiển thị Xem chi tiết, ngược lại là Thu phí */}
                        {encounter.status === "WAITING_PAYMENT" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewEncounter(encounter)}
                            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
                            title={`Xem chi tiết lượt khám - ${encounter.patientName}`}
                            aria-label={`Xem chi tiết cho ${encounter.patientName}`}
                          >
                            <Eye className="size-3.5" />
                            <span className="sr-only">{`Xem chi tiết cho ${encounter.patientName}`}</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onProcessPayment(encounter)}
                            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer"
                            title={`Thu phí / Hóa đơn - ${encounter.patientName}`}
                            aria-label={`Thu phí cho ${encounter.patientName}`}
                          >
                            <CreditCard className="size-3.5" />
                            <span className="sr-only">{`Thu phí cho ${encounter.patientName}`}</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
