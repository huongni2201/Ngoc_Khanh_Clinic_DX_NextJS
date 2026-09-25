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

interface ExaminationDetailToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  department: string
  onDepartmentChange: (value: string) => void
  examStatus: string
  onExamStatusChange: (value: string) => void
}

const DEPARTMENTS = [
  { value: "ALL", label: "Tất cả phòng ban" },
  { value: "Kỹ thuật", label: "Kỹ thuật" },
  { value: "Nhân sự", label: "Nhân sự" },
  { value: "Kinh doanh", label: "Kinh doanh" },
  { value: "Tài chính", label: "Tài chính" },
  { value: "Công nghệ", label: "Công nghệ" },
  { value: "Sản xuất", label: "Sản xuất" },
  { value: "Marketing", label: "Marketing" },
]

const EXAM_STATUSES = [
  { value: "ALL", label: "Tất cả tình trạng khám" },
  { value: "NOT_STARTED", label: "Chưa khám" },
  { value: "IN_PROGRESS", label: "Đang khám" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
]

export function ExaminationDetailToolbar({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  examStatus,
  onExamStatusChange,
}: ExaminationDetailToolbarProps) {
  return (
    <div className="space-y-2.5">
      {/* Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã NV, họ tên, CCCD..."
            className="h-9 w-full rounded-lg border-border bg-card pl-9 pr-4 text-xs  placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Department Filter */}
          <div className="w-44 sm:w-48">
            <Select
              value={department}
              onValueChange={(val) => onDepartmentChange(val ?? "ALL")}
            >
              <SelectTrigger
                aria-label="Phòng ban"
                className="h-9 text-xs rounded-lg border-border bg-card "
              >
                <SelectValue placeholder="Phòng ban" />
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

          {/* Exam Status Filter */}
          <div className="w-44 sm:w-48">
            <Select
              value={examStatus}
              onValueChange={(val) => onExamStatusChange(val ?? "ALL")}
            >
              <SelectTrigger
                aria-label="Tình trạng khám"
                className="h-9 text-xs rounded-lg border-border bg-card "
              >
                <SelectValue placeholder="Tình trạng khám" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-xs">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Helper text above table strictly matching reference image */}
      <div className="text-xs text-muted-foreground select-none">
        <span>X = đã khám hạng mục</span>
      </div>
    </div>
  )
}
