import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, RefreshCw } from "@/shared/ui/product-icon"

interface DoctorAdvancedFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  priority: string
  onPriorityChange: (val: string) => void
  examType: string
  onExamTypeChange: (val: string) => void
  onApply: () => void
  onReset: () => void
}

export function DoctorAdvancedFilterDialog({
  open,
  onOpenChange,
  priority,
  onPriorityChange,
  examType,
  onExamTypeChange,
  onApply,
  onReset,
}: DoctorAdvancedFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <DialogTitle className="text-base font-bold text-foreground">
              Bộ lọc nâng cao
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Lọc lượt khám theo mức độ ưu tiên lâm sàng và hình thức khám bệnh.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs">
          {/* Mức độ ưu tiên lâm sàng */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Mức độ ưu tiên lâm sàng
            </label>
            <Select value={priority} onValueChange={(val) => onPriorityChange(val ?? "ALL")}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue>
                  {priority === "ALL"
                    ? "Tất cả mức độ"
                    : priority === "NORMAL"
                    ? "Bình thường"
                    : priority === "PRIORITY"
                    ? "Ưu tiên"
                    : "Cấp cứu"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả mức độ</SelectItem>
                <SelectItem value="NORMAL">Bình thường (Thứ tự tiếp nhận)</SelectItem>
                <SelectItem value="PRIORITY">Ưu tiên (Người già, trẻ em, phụ nữ có thai)</SelectItem>
                <SelectItem value="EMERGENCY">Cấp cứu / Cần can thiệp gấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loại hình khám bệnh */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Loại hình khám
            </label>
            <Select value={examType} onValueChange={(val) => onExamTypeChange(val ?? "ALL")}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue>
                  {examType === "ALL"
                    ? "Tất cả loại hình"
                    : examType === "BHYT"
                    ? "Khám Bảo hiểm y tế (BHYT)"
                    : examType === "SERVICE"
                    ? "Khám Viện phí / Dịch vụ"
                    : "Khám Doanh nghiệp định kỳ"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại hình</SelectItem>
                <SelectItem value="BHYT">Khám Bảo hiểm y tế (BHYT)</SelectItem>
                <SelectItem value="SERVICE">Khám Viện phí / Dịch vụ</SelectItem>
                <SelectItem value="CORPORATE">Khám sức khỏe Doanh nghiệp định kỳ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onReset()
              onOpenChange(false)
            }}
            className="text-xs h-8 border-border"
          >
            <RefreshCw className="size-3 mr-1" />
            Thiết lập lại
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
            className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Áp dụng bộ lọc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
