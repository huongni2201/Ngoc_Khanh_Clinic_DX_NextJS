"use client"

import { Download, Search, Upload } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ParticipantsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  canManageImport: boolean
  isDownloadingTemplate: boolean
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function ParticipantsToolbar({
  search,
  onSearchChange,
  canManageImport,
  isDownloadingTemplate,
  onImportClick,
  onDownloadTemplateClick,
}: ParticipantsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo mã người khám, họ tên, CCCD, số điện thoại..."
          className="h-9 w-full rounded-lg border-border bg-card pl-9 pr-4 text-xs  placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      {canManageImport && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownloadTemplateClick}
            disabled={isDownloadingTemplate}
          >
            <Download />
            {isDownloadingTemplate ? "Đang tải…" : "Tải file mẫu"}
          </Button>
          <Button type="button" size="sm" onClick={onImportClick}>
            <Upload />
            Import danh sách
          </Button>
        </div>
      )}
    </div>
  )
}


