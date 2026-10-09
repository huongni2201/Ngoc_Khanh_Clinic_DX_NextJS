"use client"

import { Eye, CreditCard, Printer } from "@/shared/ui/product-icon"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ReceptionWorklistStageBadge } from "../reception-worklist-stage-badge"
import { ReceptionRowPrimaryAction } from "./reception-row-primary-action"
import type { Encounter } from "../../types"

interface ReceptionPatientRowProps {
  encounter: Encounter
  onReceivePatient: (encounter: Encounter) => void
  onAssignRoom: (encounter: Encounter) => void
  onViewEncounter: (encounter: Encounter) => void
  onProcessPayment: (encounter: Encounter) => void
  onPrintForm: (encounter: Encounter) => void
}

export function ReceptionPatientRow({
  encounter,
  onReceivePatient,
  onAssignRoom,
  onViewEncounter,
  onProcessPayment,
  onPrintForm,
}: ReceptionPatientRowProps) {
  const genderText =
    encounter.gender === "MALE"
      ? "Nam"
      : encounter.gender === "FEMALE"
        ? "Nữ"
        : "Khác"

  return (
    <TableRow
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
        <ReceptionWorklistStageBadge stage={encounter.worklistStage ?? "WAITING_EXAMINATION"} />
      </TableCell>

      {/* Thao tác: Toàn bộ là icon buttons đồng bộ, bỏ dropdown ... */}
      <TableCell className="w-36 min-w-[120px] px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* 1. Nút trạng thái / nghiệp vụ chính */}
          <ReceptionRowPrimaryAction
                encounter={encounter}
                onReceivePatient={onReceivePatient}
                onAssignRoom={onAssignRoom}
                onViewEncounter={onViewEncounter}
                onProcessPayment={onProcessPayment}
              />

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
          {encounter.worklistStage === "WAITING_PAYMENT" ? (
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
}
