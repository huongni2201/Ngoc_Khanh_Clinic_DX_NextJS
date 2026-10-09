"use client"

import { Search } from "@/shared/ui/product-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WorklistTabHeader } from "@/shared/ui/worklist-tab-header"
import { ReceptionFilterStrip } from "./reception-table/reception-filter-strip"
import { ReceptionPatientRow } from "./reception-table/reception-patient-row"
import { Encounter, ReceptionTab, ClinicRoom } from "../types"

interface ReceptionPatientTableProps {
  encounters: Encounter[]
  isLoading: boolean
  activeTab: ReceptionTab
  onTabChange: (tab: ReceptionTab) => void
  rooms: ClinicRoom[]
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
    { key: "WAITING_CHECK_IN", label: "Chờ tiếp nhận" },
    { key: "WAITING_EXAMINATION", label: "Chờ khám" },
    { key: "IN_EXAMINATION", label: "Đang khám" },
    { key: "WAITING_PAYMENT", label: "Chờ thu phí" },
    { key: "WAITING_DIAGNOSTIC_RESULTS", label: "Chờ kết quả" },
    { key: "READY_FOR_CONCLUSION", label: "Chờ kết luận" },
    { key: "COMPLETED", label: "Hoàn tất" },
  ]

  return (
    <div className="flex flex-col flex-1 rounded-lg border border-border bg-card  overflow-hidden">
      <WorklistTabHeader
        title="Bệnh nhân hôm nay"
        count={encounters.length}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <ReceptionFilterStrip
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onRoomChange={onRoomChange}
      />

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
              encounters.map((encounter) => (
                <ReceptionPatientRow
                  key={encounter.id}
                  encounter={encounter}
                  onReceivePatient={onReceivePatient}
                  onAssignRoom={onAssignRoom}
                  onViewEncounter={onViewEncounter}
                  onProcessPayment={onProcessPayment}
                  onPrintForm={onPrintForm}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
