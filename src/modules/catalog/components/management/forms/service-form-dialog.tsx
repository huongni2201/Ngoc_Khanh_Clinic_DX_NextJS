"use client"

import * as React from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormTextField } from "@/shared/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/shared/ui/toaster"
import {
  useCreateManagedService,
  useUpdateManagedService,
  useDepartmentPicker,
  useSpecialtyPicker,
} from "../../../hooks/management/use-catalog-management"
import { CatalogReferencePicker } from "../catalog-reference-picker"
import { CatalogPriceField } from "../catalog-price-field"
import type { ManagedService } from "../../../types/management"
import {
  SERVICE_TYPE_LABELS,
  parsePriceInput,
} from "../../../utils/management/catalog-management-utils"
import { CatalogMutationError } from "../catalog-mutation-error"
import { ApiClientError } from "@/shared/api/api-client"

const schema = z.object({
  code: z.string().trim().min(1, "Mã bắt buộc").max(50, "Tối đa 50 ký tự"),
  name: z.string().trim().min(1, "Tên bắt buộc").max(300, "Tối đa 300 ký tự"),
  serviceType: z.enum(["CONSULTATION", "LAB", "ULTRASOUND", "XRAY", "ECG", "OTHER"], { message: "Vui lòng chọn loại dịch vụ" }),
  performingDepartmentId: z.string().min(1, "Vui lòng chọn khoa thực hiện"),
  specialtyId: z.string().optional().nullable(),
  unitPrice: z.string().min(1, "Đơn giá bắt buộc"),
  preparationInstruction: z.string().max(4000, "Tối đa 4000 ký tự").optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: ManagedService
  isReloading?: boolean
  onReload?: () => Promise<void>
  onSuccess?: (service?: ManagedService) => void
}

export function ServiceFormDialog({ open, onOpenChange, service, onSuccess, onReload, isReloading = false }: ServiceFormDialogProps) {
  const isEdit = !!service
  const createMutation = useCreateManagedService()
  const updateMutation = useUpdateManagedService(service?.id ?? "")
  const mutation = isEdit ? updateMutation : createMutation

  const [deptSearch, setDeptSearch] = React.useState("")
  const [deptPage, setDeptPage] = React.useState(1)
  const [selectedDeptName, setSelectedDeptName] = React.useState(service?.performingDepartmentName ?? "")

  const [specSearch, setSpecSearch] = React.useState("")
  const [specPage, setSpecPage] = React.useState(1)
  const [selectedSpecName, setSelectedSpecName] = React.useState(service?.specialtyName ?? "")

  const deptQuery = useDepartmentPicker({ q: deptSearch, page: deptPage, size: 50, active: true, sortKey: "code", sortBy: "ASC" }, !isEdit)
  const specQuery = useSpecialtyPicker({ q: specSearch, page: specPage, size: 50, active: true, sortKey: "code", sortBy: "ASC" })

  const { register, handleSubmit, reset, control, setValue, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: service?.code ?? "",
      name: service?.name ?? "",
      serviceType: service?.serviceType ?? undefined,
      performingDepartmentId: service?.performingDepartmentId ?? "",
      specialtyId: service?.specialtyId ?? null,
      unitPrice: service?.unitPrice ?? "",
      preparationInstruction: service?.preparationInstruction ?? "",
    },
  })

  const performingDepartmentId = useWatch({ control, name: "performingDepartmentId" })
  const specialtyId = useWatch({ control, name: "specialtyId" })

  const onSubmit = async (values: FormValues) => {
    const parsedPrice = parsePriceInput(values.unitPrice)
    if (parsedPrice === null) {
      setError("unitPrice", { message: "Đơn giá không hợp lệ. Nhập số từ 0 đến 999999999999.99." })
      return
    }
    try {
      let result: ManagedService | undefined
      if (isEdit && service) {
        result = await updateMutation.mutateAsync({
          name: values.name.trim(),
          serviceType: values.serviceType,
          specialtyId: values.specialtyId ?? null,
          unitPrice: parsedPrice,
          preparationInstruction: values.preparationInstruction?.trim() || null,
          rowVersion: service.rowVersion,
        })
        toast.success(`Đã cập nhật dịch vụ ${values.name}.`)
      } else {
        result = await createMutation.mutateAsync({
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
          serviceType: values.serviceType,
          performingDepartmentId: values.performingDepartmentId,
          specialtyId: values.specialtyId ?? null,
          unitPrice: parsedPrice,
          preparationInstruction: values.preparationInstruction?.trim() || null,
        })
        toast.success(`Đã tạo dịch vụ ${values.name}.`)
      }
      reset()
      onOpenChange(false)
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof ApiClientError && err.fieldErrors.length > 0) {
        for (const fe of err.fieldErrors) {
          if (fe.field === "code") setError("code", { message: "Mã đã tồn tại." })
        }
      }
    }
  }

  const handleCancel = () => { reset(); onOpenChange(false) }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
            <DialogTitle className="text-base font-bold">{isEdit ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEdit ? "Cập nhật thông tin dịch vụ. Khoa thực hiện và mã không thể thay đổi." : "Nhập thông tin dịch vụ. Mã do bạn nhập, không tự sinh và không thể đổi sau khi tạo."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <CatalogMutationError error={mutation.error} entityLabel="dịch vụ" onReload={onReload} />

              {!isEdit && (
                <FormTextField
                  id="svc-code"
                  label="Mã dịch vụ"
                  required
                  maxLength={50}
                  placeholder="VD: KB001"
                  registration={register("code")}
                  error={errors.code?.message}
                />
              )}

              <FormTextField
                id="svc-name"
                label="Tên dịch vụ"
                required
                maxLength={300}
                placeholder="VD: Khám tổng quát"
                registration={register("name")}
                error={errors.name?.message}
              />

              <div className="space-y-1.5">
                <Label htmlFor="svc-type">Loại dịch vụ <span className="text-destructive" aria-hidden>*</span></Label>
                <Controller
                  control={control}
                  name="serviceType"
                  render={({ field }) => (
                    <Select items={SERVICE_TYPE_LABELS} value={field.value ?? null} onValueChange={field.onChange}>
                      <SelectTrigger id="svc-type" aria-invalid={!!errors.serviceType}><SelectValue placeholder="Chọn loại dịch vụ" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_TYPE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.serviceType && <p role="alert" className="text-xs text-destructive">{errors.serviceType.message}</p>}
              </div>

              {/* Performing Department */}
              <div className="space-y-1.5">
                <Label htmlFor="svc-dept">Khoa thực hiện <span className="text-destructive" aria-hidden>*</span></Label>
                {isEdit ? (
                  <Input id="svc-dept" value={service?.performingDepartmentName ?? ""} disabled />
                ) : (
                  <>
                    <CatalogReferencePicker
                      id="svc-dept"
                      title="Khoa thực hiện"
                      placeholder="Chọn khoa thực hiện..."
                      selectedId={performingDepartmentId}
                      selectedName={selectedDeptName}
                      items={deptQuery.data?.items.map((d) => ({ id: d.id, code: d.code, name: d.name, active: d.active })) ?? []}
                      isLoading={deptQuery.isLoading}
                      isError={deptQuery.isError}
                      error={deptQuery.error}
                      onRetry={() => void deptQuery.refetch()}
                      currentPage={deptPage}
                      totalPages={deptQuery.data?.totalPages ?? 1}
                      onPageChange={setDeptPage}
                      searchValue={deptSearch}
                      onSearchChange={(q) => { setDeptSearch(q); setDeptPage(1) }}
                      onSelect={(item) => {
                        if (item) {
                          setValue("performingDepartmentId", item.id, { shouldValidate: true })
                          setSelectedDeptName(item.name)
                        }
                      }}
                    />
                    {errors.performingDepartmentId && <p role="alert" className="text-xs text-destructive">{errors.performingDepartmentId.message}</p>}
                  </>
                )}
              </div>

              {/* Specialty (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="svc-spec">Chuyên khoa <span className="text-xs text-muted-foreground ml-1">(tùy chọn)</span></Label>
                <CatalogReferencePicker
                  id="svc-spec"
                  title="Chuyên khoa"
                  placeholder="Chọn chuyên khoa..."
                  allowNone
                  noneLabel="— Không chọn chuyên khoa —"
                  selectedId={specialtyId}
                  selectedName={selectedSpecName}
                  items={specQuery.data?.items.map((s) => ({ id: s.id, code: s.code, name: s.name, active: s.active })) ?? []}
                  isLoading={specQuery.isLoading}
                  isError={specQuery.isError}
                  error={specQuery.error}
                  onRetry={() => void specQuery.refetch()}
                  currentPage={specPage}
                  totalPages={specQuery.data?.totalPages ?? 1}
                  onPageChange={setSpecPage}
                  searchValue={specSearch}
                  onSearchChange={(q) => { setSpecSearch(q); setSpecPage(1) }}
                  onSelect={(item) => {
                    setValue("specialtyId", item?.id ?? null)
                    setSelectedSpecName(item?.name ?? "")
                  }}
                />
              </div>

              <Controller
                control={control}
                name="unitPrice"
                render={({ field }) => (
                  <CatalogPriceField
                    id="svc-price"
                    label="Đơn giá"
                    required
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={errors.unitPrice?.message}
                  />
                )}
              />

              <div className="space-y-1.5">
                <Label htmlFor="svc-prep">Hướng dẫn chuẩn bị <span className="text-xs text-muted-foreground ml-1">(tùy chọn)</span></Label>
                <Textarea id="svc-prep" {...register("preparationInstruction")} maxLength={4000} rows={3} placeholder="VD: Nhịn ăn trước 8 tiếng..." className="resize-none" />
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" disabled={isReloading} onClick={handleCancel}>Hủy</Button>
              <Button type="submit" disabled={mutation.isPending || isReloading}>
                {mutation.isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm dịch vụ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
