"use client"

import * as React from "react"
import {
  describeRenderJobError,
  describeRenderJobSkipReason,
  isRenderJobActive,
  renderJobPartRanges,
  RENDER_JOB_STATUS_LABELS,
  RENDER_JOB_STATUS_TONES,
  useDownloadRenderJobPart,
  useRenderJob,
  type RenderJob,
} from "@/modules/document"
import { isApiErrorStatus } from "@/shared/api/api-client"
import { StatusPill } from "@/shared/ui"
import {
  AlertCircle,
  Download,
  ExternalLink,
  Info,
  Loader2,
  Printer,
} from "@/shared/ui/product-icon"
import { toast } from "@/shared/ui/toaster"
import { formatFileSize } from "@/lib/format-file-size"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS } from "../../api/examination-forms"
import { useCreateExaminationFormPrintJob } from "../../hooks/use-examination-forms"
import type { ExaminationFormPrintEntry, ExaminationFormPrintOrder } from "../../types"
import { saveBlobAs } from "../../utils/download-blob"
import {
  describeCreatePrintJobError,
  EXAMINATION_FORM_PRINT_ORDER_LABELS,
  orderExaminationFormPrintEntries,
} from "../../utils/examination-form-print"

/** A queued job and the Participants it was created for, in print order. */
export interface TrackedExaminationFormPrintJob {
  jobId: string
  entries: ExaminationFormPrintEntry[]
}

export type ExaminationFormPrintJobDialogMode =
  | { kind: "create"; entries: ExaminationFormPrintEntry[] }
  | { kind: "track"; job: TrackedExaminationFormPrintJob }

interface ExaminationFormPrintJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  batchId: string
  mode: ExaminationFormPrintJobDialogMode | null
  /** The backend accepted the job; the caller keeps it so the dialog can be reopened. */
  onJobCreated: (job: TrackedExaminationFormPrintJob) => void
  /** Prepare a new job for the same Participants (after a failure or an expiry). */
  onRecreate: (entries: ExaminationFormPrintEntry[]) => void
}

const NEW_TAB_URL_LIFETIME_MS = 60_000
const ORDER_ITEMS = EXAMINATION_FORM_PRINT_ORDER_LABELS

function formatDateTime(value: string | undefined) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

/**
 * Bulk printing of blank examination forms. "create" confirms the Participants and the order and
 * queues a background job; "track" follows that job until its PDF parts can be downloaded. Closing
 * the dialog does not stop the job.
 */
export function ExaminationFormPrintJobDialog({
  open,
  onOpenChange,
  organizationId,
  batchId,
  mode,
  onJobCreated,
  onRecreate,
}: ExaminationFormPrintJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {mode?.kind === "create" ? (
          <CreatePrintJobView
            key={mode.entries.map((entry) => entry.id).join(",")}
            organizationId={organizationId}
            batchId={batchId}
            entries={mode.entries}
            onCancel={() => onOpenChange(false)}
            onJobCreated={onJobCreated}
          />
        ) : mode?.kind === "track" ? (
          <TrackPrintJobView
            job={mode.job}
            onClose={() => onOpenChange(false)}
            onRecreate={onRecreate}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface CreatePrintJobViewProps {
  organizationId: string
  batchId: string
  entries: ExaminationFormPrintEntry[]
  onCancel: () => void
  onJobCreated: (job: TrackedExaminationFormPrintJob) => void
}

function CreatePrintJobView({
  organizationId,
  batchId,
  entries,
  onCancel,
  onJobCreated,
}: CreatePrintJobViewProps) {
  const createJob = useCreateExaminationFormPrintJob()
  const [order, setOrder] = React.useState<ExaminationFormPrintOrder>("DEPARTMENT")
  // One key per body: a retry of the same list and order returns the job already queued.
  const [idempotencyKey, setIdempotencyKey] = React.useState(() => crypto.randomUUID())
  const ordered = React.useMemo(
    () => orderExaminationFormPrintEntries(entries, order),
    [entries, order]
  )
  const departments = React.useMemo(
    () => new Set(entries.map((entry) => entry.departmentName.trim())).size,
    [entries]
  )
  const tooMany = entries.length > EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS
  const pending = createJob.isPending

  const handleOrderChange = (value: ExaminationFormPrintOrder) => {
    if (value === order) return
    setOrder(value)
    setIdempotencyKey(crypto.randomUUID())
    createJob.reset()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending || tooMany || ordered.length === 0) return
    try {
      const job = await createJob.mutateAsync({
        organizationId,
        batchId,
        participantIds: ordered.map((entry) => entry.id),
        idempotencyKey,
      })
      onJobCreated({ jobId: job.jobId, entries: ordered })
    } catch {
      // Rendered below; the same key is reused if the user tries again.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>In phiếu khám hàng loạt</DialogTitle>
        <DialogDescription>
          Máy chủ tạo file PDF trong nền rồi gộp thành từng phần tối đa 200 người. Có thể đóng hộp
          thoại trong lúc chờ.
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Số người khám</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
            {entries.length.toLocaleString("vi-VN")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Đơn vị/phòng ban</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
            {departments.toLocaleString("vi-VN")}
          </dd>
        </div>
      </dl>

      <div className="grid gap-1.5">
        <Label htmlFor="examination-form-print-order">Thứ tự in</Label>
        <Select
          items={ORDER_ITEMS}
          value={order}
          onValueChange={(value) => value && handleOrderChange(value as ExaminationFormPrintOrder)}
          disabled={pending}
        >
          <SelectTrigger id="examination-form-print-order" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORDER_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        Người đã bị hủy khỏi danh sách hoặc có thông tin quá dài sẽ được bỏ qua và liệt kê sau khi
        in xong.
      </p>

      {tooMany && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>
            Mỗi lệnh in tối đa {EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS.toLocaleString("vi-VN")} người.
            Hãy lọc theo ngày khám hoặc bỏ bớt người đã chọn.
          </AlertDescription>
        </Alert>
      )}

      {createJob.isError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Chưa tạo được lệnh in</AlertTitle>
          <AlertDescription>{describeCreatePrintJobError(createJob.error)}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending || tooMany || entries.length === 0}>
          {pending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Printer className="size-4" />
          )}
          {pending ? "Đang tạo lệnh in..." : "Tạo lệnh in"}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface TrackPrintJobViewProps {
  job: TrackedExaminationFormPrintJob
  onClose: () => void
  onRecreate: (entries: ExaminationFormPrintEntry[]) => void
}

function TrackPrintJobView({ job, onClose, onRecreate }: TrackPrintJobViewProps) {
  const query = useRenderJob(job.jobId)
  const data = query.data
  const notFound = isApiErrorStatus(query.error, 404)

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Lệnh in phiếu khám</DialogTitle>
        <DialogDescription>
          {job.entries.length.toLocaleString("vi-VN")} người khám. Chỉ tài khoản tạo lệnh mới xem và
          tải được file; file tự xóa sau 24 giờ.
        </DialogDescription>
      </DialogHeader>

      {query.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Đang đọc trạng thái lệnh in...
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{notFound ? "Không còn lệnh in này" : "Không đọc được lệnh in"}</AlertTitle>
          <AlertDescription>
            {notFound
              ? "Lệnh in đã hết hạn (file bị xóa sau 24 giờ) hoặc không phải do tài khoản này tạo."
              : "Không kết nối được máy chủ để xem tiến độ. Lệnh in vẫn chạy trên máy chủ."}
          </AlertDescription>
        </Alert>
      ) : data ? (
        <PrintJobProgress job={data} entries={job.entries} />
      ) : null}

      <DialogFooter>
        {query.isError && !notFound && (
          <Button type="button" variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        )}
        {(notFound || data?.status === "FAILED" || data?.status === "EXPIRED") && (
          <Button type="button" variant="outline" onClick={() => onRecreate(job.entries)}>
            Tạo lại lệnh in
          </Button>
        )}
        <Button type="button" onClick={onClose}>
          {isRenderJobActive(data?.status) ? "Đóng, tiếp tục chạy nền" : "Đóng"}
        </Button>
      </DialogFooter>
    </div>
  )
}

function PrintJobProgress({
  job,
  entries,
}: {
  job: RenderJob
  entries: ExaminationFormPrintEntry[]
}) {
  const download = useDownloadRenderJobPart()
  const [busyPart, setBusyPart] = React.useState<number | null>(null)
  const byId = React.useMemo(() => new Map(entries.map((entry) => [entry.id, entry])), [entries])
  const percent =
    job.totalCount > 0 ? Math.min(100, Math.round((job.processedCount / job.totalCount) * 100)) : 0
  const ranges = renderJobPartRanges(job.parts)
  const printedCount = ranges.reduce((sum, part) => sum + part.recordCount, 0)
  const expiresAt = formatDateTime(job.expiresAt)

  const fetchPart = async (partNo: number, action: "save" | "open") => {
    setBusyPart(partNo)
    try {
      const file = await download.mutateAsync({ jobId: job.id, partNo })
      if (action === "save") {
        saveBlobAs(file.blob, file.fileName)
      } else {
        const url = URL.createObjectURL(file.blob)
        window.open(url, "_blank", "noopener")
        window.setTimeout(() => URL.revokeObjectURL(url), NEW_TAB_URL_LIFETIME_MS)
      }
    } catch (error) {
      toast.error(
        isApiErrorStatus(error, 404)
          ? "File của phần này đã hết hạn hoặc không còn trên máy chủ."
          : "Không tải được file PDF. Vui lòng thử lại.",
        { id: `render-job-part-${job.id}-${partNo}` }
      )
    } finally {
      setBusyPart(null)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusPill tone={RENDER_JOB_STATUS_TONES[job.status]}>
          {RENDER_JOB_STATUS_LABELS[job.status]}
        </StatusPill>
        <span className="text-xs tabular-nums text-muted-foreground">
          Đã xử lý {job.processedCount.toLocaleString("vi-VN")}/
          {job.totalCount.toLocaleString("vi-VN")} người
        </span>
      </div>

      {(isRenderJobActive(job.status) || job.status === "SUCCEEDED") && (
        <div
          role="progressbar"
          aria-label="Tiến độ lệnh in"
          aria-valuemin={0}
          aria-valuemax={job.totalCount}
          aria-valuenow={job.processedCount}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      )}

      {job.status === "QUEUED" && (
        <p className="text-xs text-muted-foreground">
          Lệnh in đang chờ máy chủ xử lý. Mỗi phiếu mất vài giây; 200 người có thể mất vài phút.
        </p>
      )}

      {job.status === "FAILED" && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Lệnh in thất bại</AlertTitle>
          <AlertDescription>{describeRenderJobError(job.errorCode)}</AlertDescription>
        </Alert>
      )}

      {job.status === "EXPIRED" && (
        <Alert>
          <Info aria-hidden="true" />
          <AlertDescription>
            File của lệnh in đã bị xóa sau 24 giờ. Tạo lại lệnh in nếu cần in thêm.
          </AlertDescription>
        </Alert>
      )}

      {job.status === "SUCCEEDED" && ranges.length > 0 && (
        <section aria-labelledby="print-job-parts" className="grid gap-2">
          <h3 id="print-job-parts" className="text-sm font-semibold text-foreground">
            File PDF ({printedCount.toLocaleString("vi-VN")} phiếu)
          </h3>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {ranges.map((part) => {
              const label = `Phần ${part.partNo}/${ranges.length}`
              const busy = busyPart === part.partNo
              return (
                <li
                  key={part.partNo}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs"
                >
                  <span>
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · người thứ {part.from.toLocaleString("vi-VN")}–
                      {part.to.toLocaleString("vi-VN")} · {formatFileSize(part.sizeBytes)}
                    </span>
                  </span>
                  <span className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={busyPart !== null}
                      aria-label={`Mở ${label} để in`}
                      onClick={() => void fetchPart(part.partNo, "open")}
                    >
                      <ExternalLink />
                      Mở
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={busyPart !== null}
                      aria-label={`Tải ${label}`}
                      onClick={() => void fetchPart(part.partNo, "save")}
                    >
                      {busy ? <Loader2 className="animate-spin" /> : <Download />}
                      Tải về
                    </Button>
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>
              In bằng Foxit/Adobe hoặc trình duyệt, đúng khổ giấy của mẫu, tỉ lệ 100% (không chọn
              &quot;Vừa với trang&quot;) để mã vạch không bị co và quét được. Mẫu sổ gấp A3 in 2 mặt, lật cạnh ngắn.
              {expiresAt ? ` File được giữ đến ${expiresAt}.` : ""}
            </span>
          </p>
        </section>
      )}

      {job.skipped.length > 0 && (
        <section aria-labelledby="print-job-skipped" className="grid gap-2">
          <h3 id="print-job-skipped" className="text-sm font-semibold text-foreground">
            Không in được ({job.skipped.length.toLocaleString("vi-VN")} người)
          </h3>
          <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {job.skipped.map((skipped) => {
              const entry = byId.get(skipped.id)
              return (
                <li key={skipped.id} className="flex flex-wrap justify-between gap-2 px-3 py-2 text-xs">
                  <span className="font-medium text-foreground">
                    {entry
                      ? `${entry.participantCode ? `${entry.participantCode} · ` : ""}${entry.fullName}`
                      : "Người khám không xác định"}
                  </span>
                  <span className="text-muted-foreground">
                    {describeRenderJobSkipReason(skipped.reason)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
