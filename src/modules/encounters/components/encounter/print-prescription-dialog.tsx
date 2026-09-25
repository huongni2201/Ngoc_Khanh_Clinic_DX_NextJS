"use client"

import * as React from "react"
import { Printer, X, Download, ShieldCheck } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { EncounterDetailData } from "../../types/encounter"

interface PrintPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: EncounterDetailData
}

export function PrintPrescriptionDialog({
  open,
  onOpenChange,
  data,
}: PrintPrescriptionDialogProps) {
  const { patient, encounter, prescriptions } = data

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-lg border border-border bg-card shadow-2xl overflow-hidden my-6">
        {/* Modal Top Action Bar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Printer className="size-5" />
            </div>
            <div>
              <h2 id="print-dialog-title" className="text-sm font-bold text-foreground">
                Xem trước & In đơn thuốc
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Mã đơn: <span className="font-mono font-semibold">{prescriptions.prescriptionCode}</span> • Lượt khám: {encounter.encounterCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng cửa sổ"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="p-6 bg-muted/20 max-h-[70vh] overflow-y-auto flex justify-center">
          <div className="w-full max-w-2xl bg-background text-foreground border border-border rounded-lg p-8  font-sans text-xs">
            {/* Clinic Brand Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-primary">
                  PHÒNG KHÁM ĐA KHOA NGỌC KHÁNH
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  123 Phố Ngọc Khánh, Ba Đình, Hà Nội
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Hotline: 1900 1234 • Website: www.ngockhanhclinic.vn
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-secondary-foreground">
                  {prescriptions.prescriptionCode}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Ngày kê: {prescriptions.prescribedAt}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-5">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
                ĐƠN THUỐC
              </h2>
              <p className="text-[11px] text-muted-foreground italic">
                (Theo Thông tư 52/2017/TT-BYT của Bộ Y tế)
              </p>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-y-2 py-3 border-y border-border text-xs">
              <div>
                <span className="text-muted-foreground">Họ và tên: </span>
                <span className="font-bold uppercase text-foreground">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Năm sinh: </span>
                <span className="font-semibold text-foreground">
                  {patient.dateOfBirth.split("-")[0]} ({patient.age} tuổi) - Giới tính: {patient.genderLabel}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Mã bệnh nhân: </span>
                <span className="font-mono font-bold text-foreground">{patient.patientCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Điện thoại: </span>
                <span className="font-mono font-medium text-foreground">{patient.phoneNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Địa chỉ: </span>
                <span className="text-foreground">{patient.address}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Chẩn đoán: </span>
                <span className="font-bold text-primary">
                  {encounter.primaryDiagnosis} (J06.9)
                </span>
              </div>
            </div>

            {/* Prescriptions List */}
            <div className="my-5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                Thuốc điều trị:
              </h4>
              <div className="space-y-3.5">
                {prescriptions.items.map((item) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-bold text-foreground">
                      <span>
                        {item.sequence}. {item.medicationName}{" "}
                        <span className="font-normal text-secondary-foreground">({item.strength})</span>
                      </span>
                      <span className="font-mono text-xs">{item.quantity}</span>
                    </div>
                    <div className="text-[11px] text-secondary-foreground pl-4 mt-0.5">
                      Liều dùng: {item.dosage} ({item.route}) — {item.instructions}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Note */}
            <div className="mt-5 rounded-lg bg-selected p-3 border border-primary/20 text-xs">
              <span className="font-bold text-primary">Lời dặn của bác sĩ: </span>
              <span className="text-secondary-foreground">{prescriptions.doctorNotes}</span>
            </div>

            {/* Signatures */}
            <div className="mt-8 grid grid-cols-2 text-center text-xs">
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Bệnh nhân / Người nhận</p>
                <p className="text-[10px] text-background/70 italic">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Hà Nội, ngày 16 tháng 09 năm 2024</p>
                <p className="font-bold text-foreground">Bác sĩ khám bệnh</p>
                <p className="text-[10px] text-background/70 italic pb-12">(Ký và ghi rõ họ tên)</p>
                <p className="font-bold text-foreground">{encounter.physicianName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-status-success" />
            <span>Đơn thuốc đã được ký số và hợp lệ theo quy định BYT</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-lg border-border text-xs"
            >
              Đóng
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-border text-xs"
            >
              <Download className="mr-1.5 size-3.5" />
              Tải PDF
            </Button>
            <Button
              size="sm"
              onClick={() => {
                alert("Lệnh in đã được gửi tới máy in Canon LBP 2900.")
                onOpenChange(false)
              }}
              className="h-9 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Printer className="mr-1.5 size-3.5" />
              In ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
