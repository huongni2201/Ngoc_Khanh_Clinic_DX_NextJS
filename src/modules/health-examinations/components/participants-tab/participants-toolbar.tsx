"use client"

import * as React from "react"
import { Search } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ParticipantsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  organizationUnit: string
  onDepartmentChange: (value: string) => void
  profileStatus: string
  onProfileStatusChange: (value: string) => void
}

const DEPARTMENTS = [
  { value: "ALL", label: "Tất cả đơn vị công tác" },
  { value: "Khối Công nghệ", label: "Khối Công nghệ" },
  { value: "Khối Người khám", label: "Khối Người khám" },
  { value: "Khối Kinh doanh", label: "Khối Kinh doanh" },
  { value: "Khối Tài chính", label: "Khối Tài chính" },
  { value: "Khối Sản xuất", label: "Khối Sản xuất" },
  { value: "Khối Marketing", label: "Khối Marketing" },
  { value: "Khối Kỹ thuật", label: "Khối Kỹ thuật" },
]

const PROFILE_STATUSES = [
  { value: "ALL", label: "Tất cả trạng thái hồ sơ" },
  { value: "VALID", label: "Đủ hồ sơ" },
  { value: "MISSING_IDENTIFICATION_NUMBER", label: "Thiếu số định danh" },
  { value: "MISSING_SIGNATURE", label: "Thiếu chữ ký" },
]

export function ParticipantsToolbar({
  search,
  onSearchChange,
  organizationUnit,
  onDepartmentChange,
  profileStatus,
  onProfileStatusChange,
}: ParticipantsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Department Filter */}
        <div className="w-44 sm:w-48">
          <Select
            value={organizationUnit}
            onValueChange={(val) => onDepartmentChange(val ?? "ALL")}
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border-border bg-card ">
            <SelectValue placeholder="Đơn vị công tác" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.value} value={dept.value} className="text-xs">
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Profile Status Filter */}
        <div className="w-44 sm:w-48">
          <Select
            value={profileStatus}
            onValueChange={(val) => onProfileStatusChange(val ?? "ALL")}
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border-border bg-card ">
              <SelectValue placeholder="Trạng thái hồ sơ" />
            </SelectTrigger>
            <SelectContent>
              {PROFILE_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} className="text-xs">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}


