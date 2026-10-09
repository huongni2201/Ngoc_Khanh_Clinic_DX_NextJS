"use client"

import type { ReactNode } from "react"
import { Search } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ParticipantAttendanceStatus, ParticipantRosterStatus } from "../../types"
import {
  PARTICIPANT_ATTENDANCE_STATUS_LABELS,
  PARTICIPANT_ROSTER_STATUS_LABELS,
} from "../../utils/participant-labels"

const ALL = "ALL"
const PARTICIPANT_MAX_SEARCH_LENGTH = 100

const ROSTER_ITEMS = { [ALL]: "Tất cả danh sách", ...PARTICIPANT_ROSTER_STATUS_LABELS }
const ATTENDANCE_ITEMS = { [ALL]: "Tất cả tiếp nhận", ...PARTICIPANT_ATTENDANCE_STATUS_LABELS }

interface ParticipantsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  rosterStatus?: ParticipantRosterStatus
  onRosterStatusChange: (value: ParticipantRosterStatus | undefined) => void
  attendanceStatus?: ParticipantAttendanceStatus
  onAttendanceStatusChange: (value: ParticipantAttendanceStatus | undefined) => void
  /** Template and import actions; omitted when the account or the batch cannot import. */
  actions?: ReactNode
}

export function ParticipantsToolbar({
  search,
  onSearchChange,
  rosterStatus,
  onRosterStatusChange,
  attendanceStatus,
  onAttendanceStatusChange,
  actions,
}: ParticipantsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-52 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          maxLength={PARTICIPANT_MAX_SEARCH_LENGTH}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm người khám trong đợt khám"
          placeholder="Tìm theo mã người khám, họ tên, đơn vị, chức vụ..."
          className="h-9 w-full rounded-lg border-border bg-card pl-9 pr-4 text-xs  placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Select
        items={ROSTER_ITEMS}
        value={rosterStatus ?? ALL}
        onValueChange={(value) =>
          onRosterStatusChange(
            value && value !== ALL ? (value as ParticipantRosterStatus) : undefined
          )
        }
      >
        <SelectTrigger aria-label="Lọc theo trạng thái danh sách" className="h-9 text-xs bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ROSTER_ITEMS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={ATTENDANCE_ITEMS}
        value={attendanceStatus ?? ALL}
        onValueChange={(value) =>
          onAttendanceStatusChange(
            value && value !== ALL ? (value as ParticipantAttendanceStatus) : undefined
          )
        }
      >
        <SelectTrigger aria-label="Lọc theo trạng thái tiếp nhận" className="h-9 text-xs bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ATTENDANCE_ITEMS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
