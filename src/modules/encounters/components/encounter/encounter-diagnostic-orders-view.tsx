"use client"

import * as React from "react"
import {
  Droplet,
  FlaskConical,
  Activity,
  FileText,
  Eye,
  Info,
  Scan,
  CircleDot,
} from "@/shared/ui/product-icon"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterDiagnosticOrdersViewProps {
  data: EncounterDetailData
  onViewDetail: (orderKey: "cbc" | "xray" | string) => void
}

function getServiceIcon(category: string, name: string) {
  if (name.includes("máu") || name.includes("CBC")) {
    return <Droplet className="size-4 text-status-danger" />
  }
  if (name.includes("Sinh hóa")) {
    return <FlaskConical className="size-4 text-status-warning" />
  }
  if (name.includes("Siêu âm")) {
    return <CircleDot className="size-4 text-primary" />
  }
  if (name.includes("X-quang")) {
    return <Scan className="size-4 text-primary" />
  }
  if (name.includes("Điện tâm đồ") || name.includes("ECG")) {
    return <Activity className="size-4 text-status-success" />
  }
  return <FileText className="size-4 text-primary" />
}

export function EncounterDiagnosticOrdersView({ data, onViewDetail }: EncounterDiagnosticOrdersViewProps) {
  const { diagnosticServiceRequests, encounter, patient } = data

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 ">
        {/* Title */}
        <h2 className="text-base font-bold text-foreground">
          Danh sách kết quả cận lâm sàng
        </h2>

        {/* Info Banner matching reference */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
          <Info className="size-4 shrink-0" />
          <p>
            Danh sách kết quả cận lâm sàng chỉ hiển thị các chỉ định trong lượt khám{" "}
            <strong className="font-semibold">{encounter.encounterCode}</strong> ({encounter.encounterDate.split(" ")[0]}) của bệnh nhân{" "}
            <strong className="font-semibold">{patient.fullName}</strong>.
          </p>
        </div>

        {/* Orders Table */}
        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-14 text-center">STT</th>
                <th className="py-3 px-4 min-w-[220px]">Tên xét nghiệm / Chẩn đoán hình ảnh</th>
                <th className="py-3 px-4 w-36">Thời gian thực hiện</th>
                <th className="py-3 px-4 w-28">Trạng thái</th>
                <th className="py-3 px-4 min-w-[280px]">Kết quả tóm tắt</th>
                <th className="py-3 px-4 w-32 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {diagnosticServiceRequests.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                    {order.sequence}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                        {getServiceIcon(order.category, order.serviceName)}
                      </div>
                      <span>{order.serviceName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {order.performedAt}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success border border-status-success/30">
                      <span className="size-1.5 rounded-full bg-status-success" />
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-foreground whitespace-pre-line leading-relaxed">
                    {order.summaryResult}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {order.actionType === "pdf" ? (
                      <button
                        type="button"
                        onClick={() => alert(`Xem file PDF kết quả ${order.serviceName}`)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <FileText className="size-3.5" />
                        <span>Xem PDF</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onViewDetail(order.detailViewKey || "cbc")}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Eye className="size-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
