"use client"

import * as React from "react"
import {
  FileText,
  Download,
  Eye,
  Printer,
  Upload,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EncounterDetailData } from "../../types/encounter"

interface EncounterDocumentsViewProps {
  data: EncounterDetailData
}

export function EncounterDocumentsView({ data }: EncounterDocumentsViewProps) {
  const { documents, encounter } = data

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 ">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Tài liệu y tế đính kèm lượt khám {encounter.encounterCode}
            </h2>
            <p className="text-xs text-muted-foreground">
              Tổng số {documents.length} tài liệu số hóa liên quan đến lần khám này
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Tính năng tải lên tài liệu mới cho lượt khám...")}
            className="h-9 rounded-lg border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Upload className="mr-1.5 size-3.5 text-primary" />
            Tải lên tài liệu
          </Button>
        </div>

        {/* Documents Table */}
        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[240px]">Tên tài liệu</th>
                <th className="py-3 px-4 w-36">Loại tài liệu</th>
                <th className="py-3 px-4 w-32">Định dạng / Dung lượng</th>
                <th className="py-3 px-4 w-36">Ngày tạo</th>
                <th className="py-3 px-4 w-36">Người tạo</th>
                <th className="py-3 px-4 w-40 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                    {doc.stt}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </div>
                      <span className="truncate max-w-[280px]" title={doc.name}>
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {doc.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                    {doc.sizeFormat}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {doc.createdAt}
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium">
                    {doc.createdBy}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-primary">
                      <button
                        type="button"
                        title="Xem tài liệu"
                        onClick={() => alert(`Xem tài liệu: ${doc.name}`)}
                        className="p-1 hover:text-primary/80 transition-colors"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Tải về"
                        onClick={() => alert(`Tải về: ${doc.name}`)}
                        className="p-1 hover:text-primary/80 transition-colors"
                      >
                        <Download className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="In tài liệu"
                        onClick={() => alert(`In tài liệu: ${doc.name}`)}
                        className="p-1 hover:text-primary/80 transition-colors"
                      >
                        <Printer className="size-4" />
                      </button>
                    </div>
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
