"use client"

import * as React from "react"
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePopulateSampleEmployees } from "../hooks/use-exam-batches"

interface ImportEmployeesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchId: string
  batchName: string
  onDownloadTemplate: () => void
}

export function ImportEmployeesDialog({
  open,
  onOpenChange,
  batchId,
  batchName,
  onDownloadTemplate,
}: ImportEmployeesDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { mutateAsync: populateSample, isPending } = usePopulateSampleEmployees()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) {
      if (
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls") &&
        !file.name.endsWith(".csv")
      ) {
        setError("Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc .csv")
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    setError(null)
    if (!selectedFile) {
      setError("Vui lòng chọn file danh sách nhân sự để import.")
      return
    }

    try {
      // Simulate reading and importing
      await populateSample(batchId)
      setSuccessMessage(`Đã import thành công danh sách nhân sự từ ${selectedFile.name}`)
      setTimeout(() => {
        setSuccessMessage(null)
        setSelectedFile(null)
        onOpenChange(false)
      }, 800)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình import."
      )
    }
  }

  const handleUseSampleData = async () => {
    setError(null)
    try {
      await populateSample(batchId)
      setSuccessMessage("Đã nạp thành công dữ liệu mẫu 50 nhân sự FPT!")
      setTimeout(() => {
        setSuccessMessage(null)
        onOpenChange(false)
      }, 700)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi nạp dữ liệu mẫu."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-2xl shadow-xl overflow-hidden">
        <DialogHeader className="pb-3 text-left">
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Import danh sách nhân sự
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Đợt khám: <span className="font-semibold text-foreground">{batchName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <div className="rounded-lg bg-status-success-bg p-3 text-xs font-medium text-status-success flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-primary/5 flex flex-col items-center justify-center space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
              <Upload className="size-5 stroke-[2]" />
            </div>
            {selectedFile ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <FileSpreadsheet className="size-4 text-primary" />
                <span>{selectedFile.name}</span>
                <span className="text-muted-foreground font-normal">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-foreground">
                  Kéo thả file Excel vào đây, hoặc click để chọn file
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Hỗ trợ định dạng .xlsx, .xls theo mẫu chuẩn của phòng khám
                </p>
              </>
            )}
          </div>

          {/* Download template guidance & quick sample action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium cursor-pointer"
            >
              <Download className="size-3.5" />
              Tải file mẫu Excel (.xlsx)
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleUseSampleData}
              className="text-muted-foreground hover:text-foreground underline cursor-pointer text-[11px]"
            >
              Nạp dữ liệu mẫu (50 nhân sự)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs h-9"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleImport}
            disabled={isPending || !selectedFile}
            className="text-xs h-9 shadow-xs"
          >
            {isPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
            Tiến hành import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
