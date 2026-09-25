"use client"

import * as React from "react"
import { Search, UserPlus, AlertCircle, Loader2, Check } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Patient } from "../types"
import { useSearchPatients } from "../hooks/use-patients"

interface PatientSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPatient: (patient: Patient) => void
  onOpenCreatePatient?: () => void
}

export function PatientSearchDialog({
  open,
  onOpenChange,
  onSelectPatient,
  onOpenCreatePatient,
}: PatientSearchDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedTerm, setDebouncedTerm] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: patients,
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchPatients(debouncedTerm)

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient)
    onOpenChange(false)
  }

  const handleOpenCreate = () => {
    onOpenChange(false)
    if (onOpenCreatePatient) {
      onOpenCreatePatient()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tìm bệnh nhân
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tra cứu thông tin hồ sơ bệnh nhân trong hệ thống phòng khám
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar & Quick Filters */}
        <div className="p-4 bg-surface-alt/60 border-b border-border space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, số điện thoại, số định danh hoặc mã BN..."
              className="h-10 pl-9 pr-4 text-xs bg-card border-border focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-secondary-foreground">Tìm nhanh:</span>
              {["BN001256", "0987654321", "001085002456"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSearchTerm(chip)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-card border border-border/80 hover:bg-hover text-secondary-foreground transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-[11px] text-primary hover:underline"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-[260px] overflow-y-auto py-4 space-y-2.5 pr-1 -mr-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs">Đang tìm kiếm hồ sơ bệnh nhân...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <AlertCircle className="size-8 text-destructive mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Lỗi tải dữ liệu tìm kiếm
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {(error as Error)?.message || "Không thể kết nối đến máy chủ"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3 text-xs"
              >
                Thử lại
              </Button>
            </div>
          )}

          {!isLoading && !isError && patients && patients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="size-10 rounded-full bg-surface-alt flex items-center justify-center mb-2.5 text-muted-foreground">
                <Search className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                Không tìm thấy bệnh nhân phù hợp
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {searchTerm
                  ? `Không có kết quả nào khớp với "${searchTerm}". Vui lòng kiểm tra lại hoặc tạo hồ sơ bệnh nhân mới.`
                  : "Nhập tên, số điện thoại, số định danh hoặc mã BN để bắt đầu tìm kiếm."}
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenCreate}
                className="mt-4 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <UserPlus className="size-3.5" />
                Tạo bệnh nhân mới
              </Button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            patients &&
            patients.length > 0 &&
            patients.map((patient) => {
              const genderLabel =
                patient.gender === "MALE"
                  ? "Nam"
                  : patient.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"

              return (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card hover:bg-hover/60 transition-colors group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {patient.fullName}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-surface-alt text-primary font-mono text-[10px] px-1.5 py-0"
                      >
                        {patient.patientCode}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {genderLabel} • Sinh năm {patient.birthYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-secondary-foreground flex-wrap">
                      <span>
                        SĐT:{" "}
                        <strong className="font-medium text-foreground">
                          {patient.phoneNumber}
                        </strong>
                      </span>
                      <span className="text-border">•</span>
                      <span>
                        Số định danh:{" "}
                        <span className="font-mono text-foreground font-medium">
                          {patient.identificationNumber}
                        </span>
                      </span>
                    </div>

                    {patient.address && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-md">
                        {patient.address}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelect(patient)}
                    className="shrink-0 gap-1 text-xs border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    <Check className="size-3.5" />
                    Chọn
                  </Button>
                </div>
              )
            })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-border flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleOpenCreate}
            className="gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium text-primary hover:bg-hover hover:text-primary rounded-lg cursor-pointer"
          >
            <UserPlus className="size-4" />
            + Tạo bệnh nhân mới
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
