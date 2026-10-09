"use client"

import { Search, Filter } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ClinicRoom } from "../../types"

interface ReceptionFilterStripProps {
  searchTerm: string
  onSearchChange: (search: string) => void
  rooms: ClinicRoom[]
  selectedRoomId: string
  onRoomChange: (roomId: string) => void
}

export function ReceptionFilterStrip({
  searchTerm,
  onSearchChange,
  rooms,
  selectedRoomId,
  onRoomChange,
}: ReceptionFilterStripProps) {
  return (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface-alt/50">
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo tên, SĐT, số định danh, mã..."
        className="h-8.5 pl-8.5 pr-3 text-xs bg-card border-border"
      />
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Filter className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
      <Select value={selectedRoomId} onValueChange={(val) => onRoomChange(val || "ALL")}>
        <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-56">
          <SelectValue placeholder="Tất cả phòng khám" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả phòng khám</SelectItem>
          {rooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              {room.name} - {room.department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
  )
}
