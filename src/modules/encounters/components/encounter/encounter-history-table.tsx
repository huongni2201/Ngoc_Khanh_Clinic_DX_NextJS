"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye,
  FileText,
  ChevronRight,
  Calendar,
  ChevronLeft,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { mockPatientEncounters } from "../../api/encounter-mock-data"

interface EncounterHistoryTableProps {
  patientId: string
}

export function EncounterHistoryTable({ patientId }: EncounterHistoryTableProps) {
  const router = useRouter()
  const encounters = mockPatientEncounters

  return (
    <div className="rounded-lg border border-border bg-card p-6  space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold text-foreground">
          Danh sách lượt khám ({encounters.length} lượt khám)
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown Filters */}
          <select className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <option value="ALL">Tất cả loại khám</option>
            <option value="GENERAL">Khám tổng quát</option>
            <option value="SPECIALIST">Khám chuyên khoa</option>
            <option value="FOLLOWUP">Khám tái khám</option>
          </select>

          <select className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="COMPLETED">Hoàn tất / Đã khám</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-border text-xs text-muted-foreground hover:text-foreground"
          >
            <Calendar className="mr-1.5 size-3.5" />
            Chọn khoảng thời gian
          </Button>
        </div>
      </div>

      {/* Encounters Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
            <tr>
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4 w-36">Ngày khám</th>
              <th className="py-3 px-4 w-32 font-mono">Mã lượt khám</th>
              <th className="py-3 px-4 min-w-[140px]">Loại khám</th>
              <th className="py-3 px-4 min-w-[160px]">Bác sĩ khám</th>
              <th className="py-3 px-4 w-32">Trạng thái</th>
              <th className="py-3 px-4 w-32 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {encounters.map((enc, idx) => {
              const isCancelled = enc.status === "CANCELLED"
              return (
                <tr
                  key={enc.id}
                  className="hover:bg-muted/20 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/patients/${patientId}/encounters/${enc.id}`)}
                >
                  <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">
                    {enc.encounterDate}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <Link
                      href={`/patients/${patientId}/encounters/${enc.id}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {enc.encounterCode}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {enc.serviceName}
                  </td>
                  <td className="py-3.5 px-4 text-foreground">
                    {enc.physicianName}
                  </td>
                  <td className="py-3.5 px-4">
                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-danger-bg px-2.5 py-0.5 text-xs font-semibold text-status-danger border border-status-danger/30">
                        <span className="size-1.5 rounded-full bg-status-danger" />
                        {enc.statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success border border-status-success/30">
                        <span className="size-1.5 rounded-full bg-status-success" />
                        {enc.statusLabel}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-primary">
                      <Link
                        href={`/patients/${patientId}/encounters/${enc.id}`}
                        className="p-1 hover:text-primary/80 transition-colors"
                        title="Xem chi tiết lượt khám"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="size-4" />
                      </Link>
                      <button
                        type="button"
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Xem tài liệu y tế"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/patients/${patientId}/encounters/${enc.id}?tab=documents`)
                        }}
                      >
                        <FileText className="size-4" />
                      </button>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors ml-0.5" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching reference */}
      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
        <span>Hiển thị 1 - 10 của 10 lượt khám</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="size-7 p-0" disabled>
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button size="sm" className="size-7 p-0 bg-primary text-primary-foreground font-semibold">
            1
          </Button>
          <Button variant="outline" size="sm" className="size-7 p-0" disabled>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
