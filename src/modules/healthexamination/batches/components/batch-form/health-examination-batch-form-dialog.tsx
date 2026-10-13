"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, RefreshCw } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/shared/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiClientError, isApiErrorStatus } from "@/shared/api/api-client"
import { useClinicalServices } from "@/modules/catalog"
import { useCreateHealthExaminationBatch, useReloadHealthExaminationBatch, useUpdateHealthExaminationBatch } from "../../hooks/use-health-examination-batches"
import {
  healthExaminationBatchFormSchema,
  type HealthExaminationBatchFormValues,
  type ValidatedHealthExaminationBatchFormValues,
} from "../../schemas/health-examination-batch.schema"
import type { HealthExaminationBatch } from "../../types"
import { buildFormValues, toServiceInputs } from "../../utils/batch-form-values"
import { batchServerFieldIssues } from "../../utils/batch-server-errors"
import { HealthExaminationBatchBasicInfoSection } from "./health-examination-batch-basic-info-section"
import { ExaminationItemPriceTable } from "./examination-item-price-table"

export interface HealthExaminationBatchFormDialogProps {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  organizationName?: string
  organizationAddress?: string
  /** Required in edit mode: the batch as last read from the backend. */
  batch?: HealthExaminationBatch
  onSaved?: (batch: HealthExaminationBatch) => void
}

const FORM_ID = "health-examination-batch-form"

/** Wording of a failed save. Field rejections reported by the backend are listed under it. */
function saveErrorMessage(error: unknown, mode: "create" | "edit", listsIssues: boolean) {
  if (mode === "create" && isApiErrorStatus(error, 409)) {
    return "Không thể tạo đợt khám: đơn vị đã ngừng hoạt động, dịch vụ không còn khả dụng hoặc đợt khám vừa được tạo trùng. Vui lòng kiểm tra lại."
  }
  if (listsIssues) {
    return mode === "create"
      ? "Chưa thể tạo đợt khám. Vui lòng kiểm tra các mục sau:"
      : "Chưa thể cập nhật đợt khám. Vui lòng kiểm tra các mục sau:"
  }
  if (error instanceof Error && error.message) return error.message
  return mode === "create"
    ? "Không thể tạo đợt khám mới. Vui lòng thử lại."
    : "Không thể cập nhật đợt khám. Vui lòng thử lại."
}

/** Vietnamese text for each field the backend rejected, one entry per distinct message. */
function serverIssueMessages(error: unknown): string[] {
  if (!(error instanceof ApiClientError) || error.fieldErrors.length === 0) return []
  return batchServerFieldIssues(error.fieldErrors).map((issue) => issue.message)
}

export function HealthExaminationBatchFormDialog({
  mode,
  open,
  onOpenChange,
  organizationId,
  organizationName,
  organizationAddress,
  batch,
  onSaved,
}: HealthExaminationBatchFormDialogProps) {
  const router = useRouter()
  const isEdit = mode === "edit"
  const [submitError, setSubmitError] = React.useState<unknown>(null)
  // The version the next save is based on. It only moves when the user reloads after a 409.
  const [baseVersion, setBaseVersion] = React.useState(batch?.rowVersion ?? 0)

  const {
    data: catalog,
    isLoading: isLoadingCatalog,
    isError: isCatalogError,
    error: catalogError,
    refetch: refetchCatalog,
  } = useClinicalServices(open)
  const catalogReady = Boolean(catalog) && !isCatalogError
  const hasCatalog = (catalog?.length ?? 0) > 0

  const { mutateAsync: createBatch, isPending: isCreating } = useCreateHealthExaminationBatch()
  const { mutateAsync: updateBatch, isPending: isUpdating } = useUpdateHealthExaminationBatch()
  const {
    mutateAsync: reloadBatch,
    isPending: isReloading,
    error: reloadError,
    reset: resetReloadError,
  } = useReloadHealthExaminationBatch(organizationId, batch?.id ?? "")
  const isPending = isCreating || isUpdating
  const isConflict = isEdit && isApiErrorStatus(submitError, 409)
  const submitIssues = serverIssueMessages(submitError)

  const form = useForm<
    HealthExaminationBatchFormValues,
    unknown,
    ValidatedHealthExaminationBatchFormValues
  >({
    resolver: zodResolver(healthExaminationBatchFormSchema),
    defaultValues: buildFormValues([], { batch, defaultAddress: organizationAddress }),
  })
  const { handleSubmit, reset } = form

  // Fills the form once per opening, as soon as the catalog is known.
  const initializedRef = React.useRef(false)
  React.useEffect(() => {
    if (!open) {
      initializedRef.current = false
      return
    }
    if (!initializedRef.current && catalogReady && catalog) {
      initializedRef.current = true
      reset(buildFormValues(catalog, { batch, defaultAddress: organizationAddress }))
      setBaseVersion(batch?.rowVersion ?? 0)
    }
  }, [open, catalog, catalogReady, batch, organizationAddress, reset])

  const closeAndClear = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null)
      resetReloadError()
    }
    onOpenChange(nextOpen)
  }

  // Puts each field the backend rejected next to its input, so the user sees what to correct.
  const markServerFields = (error: unknown) => {
    if (!(error instanceof ApiClientError)) return
    for (const issue of batchServerFieldIssues(error.fieldErrors)) {
      if (issue.target) form.setError(issue.target, { type: "server", message: issue.message })
    }
  }

  const onSubmit = async (values: ValidatedHealthExaminationBatchFormValues) => {
    setSubmitError(null)
    const body = {
      organizationId,
      batchName: values.batchName,
      examinationDates: values.examinationDates,
      examinationSiteType: values.examinationSiteType,
      examinationSiteAddress:
        values.examinationSiteType === "CLINIC" ? "" : values.examinationSiteAddress,
      services: toServiceInputs(values),
    }

    try {
      if (isEdit && batch) {
        const saved = await updateBatch({ ...body, batchId: batch.id, rowVersion: baseVersion })
        closeAndClear(false)
        toast.success(`Đã cập nhật đợt khám ${saved.code}.`)
        onSaved?.(saved)
      } else {
        const created = await createBatch(body)
        closeAndClear(false)
        toast.success(`Đã tạo đợt khám ${created.code}.`)
        onSaved?.(created)
        router.push(`/organizations/${organizationId}/health-examination-batches/${created.id}`)
      }
    } catch (error) {
      // The form keeps what the user typed; nothing is resent automatically.
      markServerFields(error)
      setSubmitError(error)
    }
  }

  // After a 409 the form keeps the user's input. Only an explicit reload replaces it.
  const handleReload = async () => {
    try {
      const latest = await reloadBatch()
      if (catalog) reset(buildFormValues(catalog, { batch: latest }))
      setBaseVersion(latest.rowVersion)
      setSubmitError(null)
    } catch {
      // The reload error is rendered in the dialog.
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeAndClear}>
      <DialogContent
        className="flex max-h-[92vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-xl p-0 shadow-xl sm:max-w-[800px]"
        showCloseButton={true}
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-border px-6 pb-4 pr-14 pt-5 text-left sm:px-7">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {isEdit ? "Cập nhật đợt khám" : "Tạo đợt khám mới"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEdit
              ? `Chỉnh sửa đợt khám ${batch?.code ?? ""}`.trim()
              : `Tạo đợt khám cho ${organizationName ?? "đơn vị"}`}
          </DialogDescription>
        </DialogHeader>

        {(isCatalogError || submitError !== null || reloadError) && (
          <div className="shrink-0 space-y-3 px-6 pt-4 sm:px-7">
            {isCatalogError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    {catalogError instanceof Error
                      ? catalogError.message
                      : "Chưa thể tải danh mục dịch vụ khám."}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => void refetchCatalog()}>
                    <RefreshCw className="size-3.5" />
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {submitError !== null && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="size-4" />
                <AlertDescription className="flex flex-wrap items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 space-y-1">
                    <p>{saveErrorMessage(submitError, mode, submitIssues.length > 0)}</p>
                    {submitIssues.length > 0 && (
                      <ul className="list-disc space-y-0.5 pl-4">
                        {submitIssues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {isConflict && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReload}
                      disabled={isReloading}
                    >
                      <RefreshCw className="size-3.5" />
                      {isReloading ? "Đang tải..." : "Tải lại dữ liệu mới nhất"}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {reloadError && (
              <p role="alert" className="text-xs text-destructive">
                {reloadError.message || "Không thể tải lại dữ liệu đợt khám."}
              </p>
            )}
          </div>
        )}

        {/* The only region that scrolls: the heading and the footer stay in view. */}
        <form
          id={FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-7"
        >
          {/* Locked until the catalog has filled the form, so early typing is never overwritten. */}
          <fieldset disabled={!catalogReady} className="m-0 min-w-0 border-0 p-0">
            <HealthExaminationBatchBasicInfoSection form={form} />

            <ExaminationItemPriceTable form={form} isLoading={isLoadingCatalog} />
          </fieldset>
        </form>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-alt px-6 py-3.5 sm:px-7">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Trường bắt buộc
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => closeAndClear(false)}
              disabled={isPending}
              className="h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              disabled={isPending || isReloading || isLoadingCatalog || !catalogReady || !hasCatalog}
              className="h-9 px-4"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
              {isEdit ? "Lưu thay đổi" : "Tạo đợt khám"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
