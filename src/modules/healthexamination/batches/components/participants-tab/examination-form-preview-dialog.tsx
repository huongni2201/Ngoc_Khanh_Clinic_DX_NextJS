"use client"

import * as React from "react"
import { AlertCircle, Download, ExternalLink, Info, Loader2, Printer } from "@/shared/ui/product-icon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useExaminationForm } from "../../hooks/use-examination-forms"
import type { DownloadedFile, ExaminationFormPrintEntry } from "../../types"
import { saveBlobAs } from "../../utils/download-blob"
import {
  describeExaminationFormError,
  detectPdfPaper,
} from "../../utils/examination-form-print"

interface ExaminationFormPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  /** The Participant whose form is shown; null while the dialog is closed. */
  participant: ExaminationFormPrintEntry | null
}

/** Revokes a blob URL that was handed to a new tab once the tab has had time to load it. */
const NEW_TAB_URL_LIFETIME_MS = 60_000

/**
 * Shows the PDF the backend renders for one Participant and prints it through the browser's PDF
 * viewer. The PDF is requested when the dialog opens and dropped when it closes.
 */
export function ExaminationFormPreviewDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  participant,
}: ExaminationFormPreviewDialogProps) {
  const form = useExaminationForm(organizationId, batchId, participant?.id, {
    enabled: open && participant !== null,
  })
  const file = open ? form.data : undefined
  const [preview, setPreview] = React.useState<{
    file: DownloadedFile
    url: string
    paper: string | null
  } | null>(null)
  const frameRef = React.useRef<HTMLIFrameElement>(null)

  // The blob URL lives as long as this PDF is shown and is revoked when it is replaced or closed.
  React.useEffect(() => {
    if (!file) return
    let active = true
    let objectUrl: string | null = null
    void detectPdfPaper(file.blob).then((paper) => {
      if (!active) return
      objectUrl = URL.createObjectURL(file.blob)
      setPreview({ file, url: objectUrl, paper })
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const shown = preview && preview.file === file ? preview : null
  const url = shown?.url ?? null
  const paper = shown?.paper ?? null

  const openInNewTab = () => {
    if (!file) return
    const tabUrl = URL.createObjectURL(file.blob)
    window.open(tabUrl, "_blank", "noopener")
    window.setTimeout(() => URL.revokeObjectURL(tabUrl), NEW_TAB_URL_LIFETIME_MS)
  }

  const handlePrint = () => {
    const viewer = frameRef.current?.contentWindow
    try {
      if (!viewer) throw new Error("No PDF viewer")
      viewer.focus()
      viewer.print()
    } catch {
      // Some browsers do not let a page print an embedded PDF; the new tab has its own print button.
      openInNewTab()
    }
  }

  const name = participant?.fullName ?? ""
  const code = participant?.participantCode

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Phiếu khám của {name}</DialogTitle>
          <DialogDescription>
            {code ? `Mã người khám ${code}. ` : ""}Phần hành chính được điền sẵn, phần chuyên môn để
            trống cho bác sĩ ghi tay.
          </DialogDescription>
        </DialogHeader>

        {form.isError ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Không tạo được phiếu khám</AlertTitle>
            <AlertDescription>{describeExaminationFormError(form.error)}</AlertDescription>
          </Alert>
        ) : !url ? (
          <div
            role="status"
            className="flex h-[60vh] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground"
          >
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
            Đang tạo phiếu khám, có thể mất vài giây...
          </div>
        ) : (
          <div className="space-y-2">
            <iframe
              ref={frameRef}
              src={url}
              title={`Phiếu khám của ${name}`}
              className="h-[65vh] w-full rounded-lg border border-border bg-muted"
            />
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {paper ? (
                  <>
                    Khổ giấy của mẫu: <span className="font-medium text-foreground">{paper}</span>.{" "}
                  </>
                ) : null}
                Khi in chọn đúng khổ giấy, tỉ lệ 100% (không chọn &quot;Vừa với trang&quot;) để mã vạch
                không bị co và quét được. Mẫu sổ gấp A3 in 2 mặt, lật cạnh ngắn.
              </span>
            </p>
          </div>
        )}

        <DialogFooter>
          {form.isError ? (
            <Button type="button" variant="outline" onClick={() => void form.refetch()}>
              Thử lại
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={!file}
                onClick={() => file && saveBlobAs(file.blob, file.fileName)}
              >
                <Download className="size-4" />
                Tải về
              </Button>
              <Button type="button" variant="outline" disabled={!file} onClick={openInNewTab}>
                <ExternalLink className="size-4" />
                Mở tab mới
              </Button>
              <Button type="button" disabled={!url} onClick={handlePrint}>
                <Printer className="size-4" />
                In
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
