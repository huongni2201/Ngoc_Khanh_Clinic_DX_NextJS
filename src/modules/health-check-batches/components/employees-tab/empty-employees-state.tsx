"use client"

import * as React from "react"
import { Users, Upload, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EmptyEmployeesStateProps {
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function EmptyEmployeesState({
  onImportClick,
  onDownloadTemplateClick,
}: EmptyEmployeesStateProps) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-2xs">
      <CardContent className="py-16 px-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Users className="size-7 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Chưa có nhân sự trong đợt khám
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 mb-6 leading-relaxed">
            Đợt khám đã được thiết lập thành công các hạng mục và đơn giá. Bắt đầu bằng cách import danh sách nhân sự từ file Excel hoặc tải file mẫu để chuẩn bị dữ liệu.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplateClick}
              className="h-9 px-4 text-xs font-medium border-primary/40 text-primary hover:bg-primary/5 hover:text-primary transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="size-3.5 mr-1.5 stroke-[2]" />
              Tải file mẫu
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onImportClick}
              className="h-9 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="size-3.5 mr-1.5 stroke-[2]" />
              Import nhân sự
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
