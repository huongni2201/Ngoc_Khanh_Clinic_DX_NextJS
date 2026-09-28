"use client"

import * as React from "react"
import { Search } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"

interface ParticipantsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
}

export function ParticipantsToolbar({
  search,
  onSearchChange,
}: ParticipantsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
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
    </div>
  )
}


