"use client"

import * as React from "react"
import { Search, Filter, X, RotateCcw } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PatientAgeGroup, PatientGender } from "../types"

interface PatientToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedGender: PatientGender | "ALL"
  onGenderChange: (value: PatientGender | "ALL") => void
  selectedAgeGroup: PatientAgeGroup
  onAgeGroupChange: (value: PatientAgeGroup) => void
  onResetFilters: () => void
  className?: string
}

export function PatientToolbar({
  searchTerm,
  onSearchChange,
  selectedGender,
  onGenderChange,
  selectedAgeGroup,
  onAgeGroupChange,
  onResetFilters,
  className,
}: PatientToolbarProps) {
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedGender !== "ALL" ||
    selectedAgeGroup !== "ALL"

  const getGenderText = (g: PatientGender | "ALL") => {
    switch (g) {
      case "MALE":
        return "Nam"
      case "FEMALE":
        return "Nữ"
      case "OTHER":
        return "Khác"
      default:
        return "Tất cả giới tính"
    }
  }

  const getAgeGroupText = (a: PatientAgeGroup) => {
    switch (a) {
      case "<18":
        return "Dưới 18 tuổi"
      case "18-40":
        return "18 - 40 tuổi"
      case "41-60":
        return "41 - 60 tuổi"
      case ">60":
        return "Trên 60 tuổi"
      default:
        return "Tất cả nhóm tuổi"
    }
  }

  return (
    <div
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}
      data-slot="patient-toolbar"
    >
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo mã bệnh nhân, họ tên, số điện thoại, số định danh..."
          className="h-10 w-full rounded-lg border-border bg-card pl-10 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring "
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filter Select Controls & Button */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Gender Filter */}
        <Select
          value={selectedGender}
          onValueChange={(val: PatientGender | "ALL" | null) => {
            if (val) onGenderChange(val)
          }}
        >
          <SelectTrigger className="h-10 w-[150px] rounded-lg border-border bg-card text-xs text-foreground  font-normal">
            <span className="truncate">{getGenderText(selectedGender)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả giới tính</SelectItem>
            <SelectItem value="MALE">Nam</SelectItem>
            <SelectItem value="FEMALE">Nữ</SelectItem>
            <SelectItem value="OTHER">Khác</SelectItem>
          </SelectContent>
        </Select>

        {/* Age Group Filter */}
        <Select
          value={selectedAgeGroup}
          onValueChange={(val: PatientAgeGroup | null) => {
            if (val) onAgeGroupChange(val)
          }}
        >
          <SelectTrigger className="h-10 w-[160px] rounded-lg border-border bg-card text-xs text-foreground  font-normal">
            <span className="truncate">{getAgeGroupText(selectedAgeGroup)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả nhóm tuổi</SelectItem>
            <SelectItem value="<18">Dưới 18 tuổi</SelectItem>
            <SelectItem value="18-40">18 - 40 tuổi</SelectItem>
            <SelectItem value="41-60">41 - 60 tuổi</SelectItem>
            <SelectItem value=">60">Trên 60 tuổi</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Quick Action / Popover Button */}
        <Popover>
          <PopoverTrigger className="h-10 inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-hover hover:text-primary  cursor-pointer">
            <Filter className="mr-1.5 size-4 text-secondary-foreground" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="ml-1.5 flex size-2 rounded-full bg-primary" />
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-3 rounded-lg shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-semibold text-foreground">Bộ lọc nâng cao</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetFilters}
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    <RotateCcw className="mr-1 size-3" />
                    Đặt lại
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Đang áp dụng bộ lọc theo giới tính và nhóm tuổi trên toàn bộ hồ sơ bệnh nhân.
              </p>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetFilters}
                  className="w-full h-8 text-xs font-medium text-foreground"
                >
                  Xóa tất cả bộ lọc
                </Button>
              ) : (
                <p className="text-[11px] text-muted-foreground italic text-center py-1">
                  Chưa kích hoạt bộ lọc nào
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-10 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title="Xóa tất cả bộ lọc"
          >
            <RotateCcw className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Đặt lại</span>
          </Button>
        )}
      </div>
    </div>
  )
}
