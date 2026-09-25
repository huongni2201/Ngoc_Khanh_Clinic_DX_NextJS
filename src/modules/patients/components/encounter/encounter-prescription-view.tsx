"use client"

import * as React from "react"
import { Printer, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EncounterDetailData } from "../../types/encounter"
import { PrintPrescriptionDialog } from "./print-prescription-dialog"

interface EncounterPrescriptionViewProps {
  data: EncounterDetailData
  isPrintModalOpen?: boolean
  onTogglePrintModal?: (open: boolean) => void
}

export function EncounterPrescriptionView({
  data,
  isPrintModalOpen: controlledModalOpen,
  onTogglePrintModal,
}: EncounterPrescriptionViewProps) {
  const [internalModalOpen, setInternalModalOpen] = React.useState(false)

  const isModalOpen = controlledModalOpen !== undefined ? controlledModalOpen : internalModalOpen
  const setModalOpen = onTogglePrintModal || setInternalModalOpen

  const { prescriptions } = data

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            Đơn thuốc ({prescriptions.items.length} thuốc)
          </h2>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="h-9 rounded-xl border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Printer className="mr-1.5 size-4 text-primary" />
              In đơn thuốc
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Đang kết xuất đơn thuốc ra định dạng PDF...")}
              className="h-9 rounded-xl border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Download className="mr-1.5 size-4 text-primary" />
              Xuất PDF
            </Button>
          </div>
        </div>

        {/* Prescription Table matching reference screenshot */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-14 text-center">STT</th>
                <th className="py-3 px-4 min-w-[160px]">Tên thuốc</th>
                <th className="py-3 px-4 w-28">Hàm lượng</th>
                <th className="py-3 px-4 min-w-[180px]">Liều dùng</th>
                <th className="py-3 px-4 w-28">Đường dùng</th>
                <th className="py-3 px-4 w-24">Số lượng</th>
                <th className="py-3 px-4 min-w-[220px]">Hướng dẫn sử dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prescriptions.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                    {item.stt}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {item.medicationName}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {item.strength}
                  </td>
                  <td className="py-3.5 px-4 text-foreground">
                    {item.dosage}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {item.route}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {item.instructions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor Note Box */}
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4.5">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs">
            <FileText className="size-4 shrink-0" />
            <span>Ghi chú của bác sĩ</span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/90 leading-relaxed pl-6">
            {prescriptions.doctorNotes}
          </p>
        </div>
      </div>

      {/* Modal Dialog */}
      <PrintPrescriptionDialog
        open={isModalOpen}
        onOpenChange={setModalOpen}
        data={data}
      />
    </div>
  )
}
