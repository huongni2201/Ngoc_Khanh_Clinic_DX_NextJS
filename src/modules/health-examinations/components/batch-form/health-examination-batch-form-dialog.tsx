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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiClientError } from "@/shared/api/api-client"
import {
  useClinicalServices,
  useCreateHealthExaminationBatch,
  useReloadHealthExaminationBatch,
  useUpdateHealthExaminationBatch,
} from "../../hooks/use-health-examination-batches"
import {
  healthExaminationBatchFormSchema,
  type HealthExaminationBatchFormValues,
  type ValidatedHealthExaminationBatchFormValues,
} from "../../schemas/health-examination-batch.schema"
import type { HealthExaminationBatch } from "../../types"
import { buildFormValues, toServiceInputs } from "../../utils/batch-form-values"
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

function isStatus(error: unknown, status: number) {
  return error instanceof ApiClientError && error.status === status
}

function saveErrorMessage(error: unknown, mode: "create" | "edit") {
  if (mode === "create" && isStatus(error, 409)) {
    return "Mã đợt khám đã tồn tại hoặc không thỏa quy tắc nghiệp vụ. Vui lòng kiểm tra lại."
  }
  if (error instanceof Error && error.message) return error.message
  return mode === "create"
    ? "Không thể tạo đợt khám mới. Vui lòng thử lại."
    : "Không thể cập nhật đợt khám. Vui lòng thử lại."
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
  const isConflict = isEdit && isStatus(submitError, 409)

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

  const onSubmit = async (values: ValidatedHealthExaminationBatchFormValues) => {
    setSubmitError(null)
    const body = {
      organizationId,
      batchCode: values.batchCode,
      batchName: values.batchName,
      examinationDates: values.examinationDates,
      examinationSiteType: values.examinationSiteType,
      examinationSiteName: values.examinationSiteName,
      examinationSiteAddress: values.examinationSiteAddress,
      services: toServiceInputs(values),
    }

    try {
      if (isEdit && batch) {
        const saved = await updateBatch({ ...body, batchId: batch.id, rowVersion: baseVersion })
        closeAndClear(false)
        onSaved?.(saved)
      } else {
        const created = await createBatch(body)
        closeAndClear(false)
        onSaved?.(created)
        router.push(`/organizations/${organizationId}/health-examination-batches/${created.id}`)
      }
    } catch (error) {
      // The form keeps what the user typed; nothing is resent automatically.
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
        className="sm:max-w-[760px] max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden"
        showCloseButton={true}
      >
        <DialogHeader className="pb-4 shrink-0 text-left">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Cập nhật đợt khám" : "Tạo đợt khám mới"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? `Chỉnh sửa đợt khám ${batch?.code ?? ""}`.trim()
              : `Tạo đợt khám cho ${organizationName ?? "đơn vị"}`}
          </DialogDescription>
        </DialogHeader>

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

        <form
          id={FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-6 py-2 pr-1 -mr-1"
        >
          {submitError !== null && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span>{saveErrorMessage(submitError, mode)}</span>
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

          {/* Locked until the catalog has filled the form, so early typing is never overwritten. */}
          <fieldset disabled={!catalogReady} className="m-0 min-w-0 space-y-6 border-0 p-0">
            <HealthExaminationBatchBasicInfoSection form={form} codeReadOnly={isEdit} />

            <ExaminationItemPriceTable form={form} isLoading={isLoadingCatalog} />
          </fieldset>
        </form>

        <div className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeAndClear(false)}
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg "
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending || isReloading || isLoadingCatalog || !catalogReady || !hasCatalog}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg "
          >
            {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo đợt khám"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
