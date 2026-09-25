"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  useClinicalServices,
  useCreateHealthExaminationBatch,
} from "@/modules/health-examinations"
import { OrganizationDetail } from "../types"
import {
  createHealthExaminationBatchSchema,
  type CreateHealthExaminationBatchFormValues,
} from "../schemas"
import { HealthExaminationBatchBasicInfoSection } from "./health-examination-batch-basic-info-section"
import { ExaminationItemPriceTable } from "./examination-item-price-table"

interface CreateHealthExaminationBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationDetail
  onCreated?: (batchId: string) => void
}

export function CreateHealthExaminationBatchDialog({
  open,
  onOpenChange,
  organization,
  onCreated,
}: CreateHealthExaminationBatchDialogProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const { data: masterItems, isLoading: isLoadingCatalog } =
    useClinicalServices()
  const servicesList = React.useMemo(() => masterItems || [], [masterItems])
  const { mutateAsync: createBatch, isPending } = useCreateHealthExaminationBatch()

  const form = useForm<CreateHealthExaminationBatchFormValues>({
    resolver: zodResolver(createHealthExaminationBatchSchema),
    defaultValues: {
      organizationId: organization.id,
      name: "",
      location: organization.shortAddress || organization.address || "",
      examDate: "",
      note: "",
      services: [],
    },
  })

  const { handleSubmit, reset } = form

  const hasResetRef = React.useRef(false)

  // Populate or reset form services once when dialog opens or catalog loads
  React.useEffect(() => {
    if (open) {
      if (!hasResetRef.current && servicesList.length > 0) {
        hasResetRef.current = true
        const initialItems = servicesList.map((item) => ({
          serviceId: item.id,
          name: item.name,
          selected: false,
          unitPrice: 0,
        }))

        reset({
          organizationId: organization.id,
          name: "",
          location: organization.shortAddress || organization.address || "",
          examDate: "",
          note: "",
          services: initialItems,
        })
      }
    } else {
      hasResetRef.current = false
    }
  }, [open, organization.id, organization.shortAddress, organization.address, servicesList, reset])

  const onSubmit = async (values: CreateHealthExaminationBatchFormValues) => {
    setSubmitError(null)

    // Filter only selected services with valid unitPrice > 0
    const selectedItems = values.services
      .filter((item) => item.selected)
      .map((item) => ({
        serviceId: item.serviceId,
        unitPrice: item.unitPrice,
      }))

    try {
      const created = await createBatch({
        organizationId: organization.id,
        name: values.name.trim(),
        examDate: values.examDate.trim(),
        location: values.location.trim(),
        note: values.note?.trim() || undefined,
        services: selectedItems,
      })

      // 1. Close modal
      onOpenChange(false)

      // 2. Callback if provided
      onCreated?.(created.id)

      // 3. Navigate to new batch detail screen
      router.push(`/organizations/${organization.id}/health-examination-batches/${created.id}`)
    } catch (err) {
      console.error("Failed to create exam batch:", err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Không thể tạo đợt khám mới. Vui lòng kiểm tra lại kết nối mạng và thử lại."
      )
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSubmitError(null)
    }
    onOpenChange(newOpen)
  }

  const handleCancel = () => {
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="pb-4 shrink-0 text-left">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tạo đợt khám mới
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tạo đợt khám cho {organization.name}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form
          id="create-health-examination-batch-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-6 py-2 pr-1 -mr-1"
        >
          {submitError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Section 1: Basic Information */}
          <HealthExaminationBatchBasicInfoSection form={form} />

          {/* Section 2: Examination Items & Unit Prices Table */}
          <ExaminationItemPriceTable
            form={form}
            masterItems={servicesList}
            isLoading={isLoadingCatalog}
          />
        </form>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg "
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="create-health-examination-batch-form"
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg "
          >
            {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
            Tạo đợt khám
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


