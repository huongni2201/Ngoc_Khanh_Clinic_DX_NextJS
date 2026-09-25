"use client"

import * as React from "react"
import Image from "next/image"
import { Printer, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Encounter } from "../types"

interface PrintExaminationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounter: Encounter | null
}

export function PrintExaminationDialog({
  open,
  onOpenChange,
  encounter,
}: PrintExaminationDialogProps) {
  const [template, setTemplate] = React.useState<string>("standard")
  const [copies, setCopies] = React.useState<string>("1")
  const [isPrinted, setIsPrinted] = React.useState<boolean>(false)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setIsPrinted(false)
    }
    onOpenChange(isOpen)
  }

  if (!encounter) return null

  const genderText =
    encounter.gender === "MALE"
      ? "Nam"
      : encounter.gender === "FEMALE"
        ? "Nữ"
        : "Khác"

  const handlePrint = () => {
    setIsPrinted(true)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-2xl shadow-xl overflow-hidden bg-card border-border">
        {/* Header */}
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            In giấy khám bệnh
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Xem trước biểu mẫu tiếp nhận và in phiếu khám cho bệnh nhân
          </DialogDescription>
        </DialogHeader>

        {/* Configuration Toolbar */}
        <div className="px-6 py-3 bg-surface-alt/50 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="templateSelect"
              className="text-xs font-semibold text-foreground whitespace-nowrap"
            >
              Biểu mẫu:
            </Label>
            <Select
              value={template}
              onValueChange={(val) => {
                if (val) setTemplate(val)
              }}
            >
              <SelectTrigger
                id="templateSelect"
                className="h-8 text-xs bg-card border-border w-64"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  Phiếu tiếp nhận & khám bệnh (Chuẩn)
                </SelectItem>
                <SelectItem value="compact">
                  Phiếu số thứ tự & điều phối phòng
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="copiesSelect"
                className="text-xs font-semibold text-foreground whitespace-nowrap"
              >
                Số bản in:
              </Label>
              <Select
                value={copies}
                onValueChange={(val) => {
                  if (val) setCopies(val)
                }}
              >
                <SelectTrigger
                  id="copiesSelect"
                  className="h-8 text-xs bg-card border-border w-24"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 bản</SelectItem>
                  <SelectItem value="2">2 bản</SelectItem>
                  <SelectItem value="3">3 bản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] bg-card text-muted-foreground border-border hidden sm:inline-flex"
            >
              Khổ A4 • Chuẩn in ấn
            </Badge>
          </div>
        </div>

        {/* Print Preview Container (Authentic Medical Sheet Style) */}
        <div className="p-6 flex-1 overflow-y-auto bg-muted/40 rounded-xl my-2 border border-border/60">
          <div className="bg-card border border-border/80 rounded-xl p-7 sm:p-9 shadow-md max-w-[620px] mx-auto space-y-5 text-foreground print:border-none print:shadow-none print:p-0">
            {/* Header with official logo and clinic info */}
            <div className="flex items-start justify-between border-b border-border pb-3.5 gap-3">
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 pt-0.5">
                  <Image
                    src="/images/logo.png"
                    alt="Ngọc Khánh Clinic Logo"
                    width={48}
                    height={48}
                    className="size-full object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold uppercase tracking-tight text-foreground">
                    Phòng Khám Đa Khoa Ngọc Khánh
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    Số 12 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Hotline: (024) 3833 6688 • ngockhanhclinic.vn
                  </div>
                </div>
              </div>

              {/* Barcode & Encounter Meta */}
              <div className="text-right flex flex-col items-end shrink-0">
                {/* SVG Barcode Representation */}
                <div className="text-foreground flex flex-col items-center">
                  <svg className="h-6 w-28 text-foreground" viewBox="0 0 110 24" fill="currentColor">
                    <rect x="0" y="0" width="3" height="24" />
                    <rect x="5" y="0" width="1" height="24" />
                    <rect x="8" y="0" width="3" height="24" />
                    <rect x="13" y="0" width="2" height="24" />
                    <rect x="17" y="0" width="1" height="24" />
                    <rect x="20" y="0" width="3" height="24" />
                    <rect x="25" y="0" width="2" height="24" />
                    <rect x="29" y="0" width="3" height="24" />
                    <rect x="34" y="0" width="1" height="24" />
                    <rect x="37" y="0" width="2" height="24" />
                    <rect x="41" y="0" width="3" height="24" />
                    <rect x="46" y="0" width="1" height="24" />
                    <rect x="49" y="0" width="2" height="24" />
                    <rect x="53" y="0" width="3" height="24" />
                    <rect x="58" y="0" width="1" height="24" />
                    <rect x="61" y="0" width="2" height="24" />
                    <rect x="65" y="0" width="3" height="24" />
                    <rect x="70" y="0" width="1" height="24" />
                    <rect x="73" y="0" width="2" height="24" />
                    <rect x="77" y="0" width="3" height="24" />
                    <rect x="82" y="0" width="1" height="24" />
                    <rect x="85" y="0" width="2" height="24" />
                    <rect x="89" y="0" width="3" height="24" />
                    <rect x="94" y="0" width="1" height="24" />
                    <rect x="97" y="0" width="3" height="24" />
                    <rect x="102" y="0" width="2" height="24" />
                    <rect x="106" y="0" width="3" height="24" />
                  </svg>
                  <div className="font-mono text-xs font-bold text-primary mt-0.5 tracking-wide">
                    {encounter.encounterCode}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Giờ đến: <strong className="font-mono text-foreground">{encounter.arrivalTime}</strong>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {template === "standard"
                  ? "Phiếu Tiếp Nhận & Khám Bệnh"
                  : "Phiếu Điều Phối Khám Bệnh"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                (Lưu hồ sơ tiếp đón bệnh nhân trong ngày)
              </p>
            </div>

            {/* Patient Demographic Details (Clinical Form Style) */}
            <div className="border border-border/80 rounded-lg p-3.5 bg-surface-alt/30 text-xs">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="text-muted-foreground">Mã bệnh nhân: </span>
                  <strong className="font-mono text-foreground font-semibold">
                    {encounter.patientCode}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Họ và tên: </span>
                  <strong className="text-foreground uppercase tracking-tight">
                    {encounter.patientName.toUpperCase()}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày sinh: </span>
                  <span className="text-foreground">
                    {encounter.dateOfBirth} ({encounter.birthYear})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Giới tính: </span>
                  <span className="text-foreground">{genderText}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Số định danh: </span>
                  <span className="font-mono text-foreground font-medium">
                    {encounter.identificationNumber}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Số điện thoại: </span>
                  <span className="text-foreground font-medium">
                    {encounter.phoneNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Examination Destination & Reasons */}
            <div className="border border-border/80 rounded-lg p-3.5 space-y-2 text-xs bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground">Loại khám: </span>
                  <strong className="text-foreground">
                    {encounter.examinationType}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Phòng khám: </span>
                  <strong className="text-primary font-semibold">
                    {encounter.roomName || "Chờ phân phòng"}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Bác sĩ phụ trách: </span>
                <span className="text-foreground font-medium">
                  {encounter.physicianName || "Theo điều phối của phòng khám"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">Lý do khám: </span>
                <span className="text-foreground">
                  {encounter.reasonForVisit || "Kiểm tra sức khỏe tổng quát theo yêu cầu"}
                </span>
              </div>

              {encounter.notes && (
                <div>
                  <span className="text-muted-foreground">Ghi chú: </span>
                  <span className="text-foreground italic">{encounter.notes}</span>
                </div>
              )}
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 pt-4 text-center text-xs">
              <div className="space-y-12">
                <div className="font-semibold text-foreground">Bệnh nhân / Người nhà</div>
                <div className="text-[10px] text-muted-foreground italic">
                  (Ký, ghi rõ họ tên)
                </div>
              </div>
              <div className="space-y-12">
                <div className="font-semibold text-foreground">Nhân viên tiếp đón</div>
                <div className="text-xs font-bold text-foreground">
                  Nguyễn Thị Lan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Khổ giấy chuẩn: A4 dọc / In 1 mặt
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg shadow-2xs cursor-pointer"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg shadow-xs cursor-pointer gap-2"
            >
              {isPrinted ? (
                <>
                  <Check className="size-4" />
                  <span>Đã gửi lệnh in</span>
                </>
              ) : (
                <>
                  <Printer className="size-4" />
                  <span>In phiếu khám ({copies})</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
