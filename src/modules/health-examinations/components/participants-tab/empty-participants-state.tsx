"use client"

import { Users, Upload, Download } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EmptyParticipantsStateProps {
  canManageImport: boolean
  onImportClick?: () => void
  onDownloadTemplateClick?: () => void
}

export function EmptyParticipantsState({
  onImportClick,
  onDownloadTemplateClick,
  canManageImport,
}: EmptyParticipantsStateProps) {
  return (
    <Card className="rounded-lg border border-border bg-card ">
      <CardContent className="py-16 px-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Users className="size-7 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Chưa có người khám trong đợt khám
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 mb-6 leading-relaxed">
            Đợt khám đã sẵn sàng nhận roster người khám từ file Excel.
          </p>
          {canManageImport ? (
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={onDownloadTemplateClick}>
                <Download className="size-3.5 mr-1.5 stroke-[2]" />
                Tải file mẫu
              </Button>
              <Button type="button" size="sm" onClick={onImportClick}>
                <Upload className="size-3.5 mr-1.5 stroke-[2]" />
                Import danh sách
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


