"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { FormTextField } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { useCreateRoom, useUpdateRoom, useDepartmentPicker } from "../../../hooks/management/use-catalog-management"
import { CatalogReferencePicker } from "../catalog-reference-picker"
import type { Room } from "../../../types/management"
import { CatalogMutationError } from "../catalog-mutation-error"
import { ApiClientError } from "@/shared/api/api-client"

const schema = z.object({
  code: z.string().trim().min(1, "Mã bắt buộc").max(50, "Tối đa 50 ký tự"),
  name: z.string().trim().min(1, "Tên bắt buộc").max(200, "Tối đa 200 ký tự"),
  departmentId: z.string().min(1, "Vui lòng chọn khoa"),
  roomType: z.string().trim().min(1, "Loại phòng bắt buộc").max(50, "Tối đa 50 ký tự"),
})

type FormValues = z.infer<typeof schema>

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room
  isReloading?: boolean
  onReload?: () => Promise<void>
  onSuccess?: (room?: Room) => void
}

export function RoomFormDialog({ open, onOpenChange, room, onSuccess, onReload, isReloading = false }: RoomFormDialogProps) {
  const isEdit = !!room
  const createMutation = useCreateRoom()
  const updateMutation = useUpdateRoom(room?.id ?? "")
  const mutation = isEdit ? updateMutation : createMutation

  const [pickerSearch, setPickerSearch] = React.useState("")
  const [pickerPage, setPickerPage] = React.useState(1)
  const [selectedDeptName, setSelectedDeptName] = React.useState(room?.departmentName ?? "")

  const pickerQuery = useDepartmentPicker({
    q: pickerSearch,
    page: pickerPage,
    size: 50,
    active: true,
    sortKey: "code",
    sortBy: "ASC",
  }, !isEdit)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: room?.code ?? "",
      name: room?.name ?? "",
      departmentId: room?.departmentId ?? "",
      roomType: room?.roomType ?? "",
    },
  })

  const departmentId = useWatch({ control, name: "departmentId" })

  const onSubmit = async (values: FormValues) => {
    try {
      let result: Room | undefined
      if (isEdit && room) {
        result = await updateMutation.mutateAsync({ name: values.name.trim(), roomType: values.roomType.trim(), rowVersion: room.rowVersion })
        toast.success(`Đã cập nhật phòng ${values.name}.`)
      } else {
        result = await createMutation.mutateAsync({
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
          departmentId: values.departmentId,
          roomType: values.roomType.trim(),
        })
        toast.success(`Đã tạo phòng ${values.name}.`)
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
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
            <DialogTitle className="text-base font-bold">{isEdit ? "Sửa phòng" : "Thêm phòng mới"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEdit ? "Cập nhật tên và loại phòng. Khoa và mã không thể thay đổi." : "Nhập thông tin phòng. Mã do bạn nhập, không tự sinh và không thể đổi sau khi tạo."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <CatalogMutationError error={mutation.error} entityLabel="phòng" onReload={onReload} />

              {!isEdit && (
                <FormTextField
                  id="room-code"
                  label="Mã phòng"
                  required
                  placeholder="VD: P101"
                  maxLength={50}
                  registration={register("code")}
                  error={errors.code?.message}
                />
              )}

              <FormTextField
                id="room-name"
                label="Tên phòng"
                required
                placeholder="VD: Phòng khám 101"
                maxLength={200}
                registration={register("name")}
                error={errors.name?.message}
              />

              {/* Department picker – create only, read-only in edit */}
              <div className="space-y-1.5">
                <Label htmlFor="room-dept">Khoa <span className="text-destructive" aria-hidden>*</span></Label>
                {isEdit ? (
                  <Input id="room-dept" value={room?.departmentName ?? ""} disabled />
                ) : (
                  <>
                    <CatalogReferencePicker
                      id="room-dept"
                      title="Khoa"
                      placeholder="Chọn khoa..."
                      selectedId={departmentId}
                      selectedName={selectedDeptName}
                      items={pickerQuery.data?.items.map((d) => ({ id: d.id, code: d.code, name: d.name, active: d.active })) ?? []}
                      isLoading={pickerQuery.isLoading}
                      isError={pickerQuery.isError}
                      error={pickerQuery.error}
                      onRetry={() => void pickerQuery.refetch()}
                      currentPage={pickerPage}
                      totalPages={pickerQuery.data?.totalPages ?? 1}
                      onPageChange={setPickerPage}
                      searchValue={pickerSearch}
                      onSearchChange={(q) => { setPickerSearch(q); setPickerPage(1) }}
                      onSelect={(item) => {
                        if (item) {
                          setValue("departmentId", item.id, { shouldValidate: true })
                          setSelectedDeptName(item.name)
                        }
                      }}
                    />
                    {errors.departmentId && (
                      <p role="alert" className="text-xs text-destructive">{errors.departmentId.message}</p>
                    )}
                  </>
                )}
              </div>

              <FormTextField
                id="room-type"
                label="Loại phòng"
                required
                placeholder="VD: Khám bệnh"
                maxLength={50}
                registration={register("roomType")}
                error={errors.roomType?.message}
              />
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" disabled={isReloading} onClick={handleCancel}>Hủy</Button>
              <Button type="submit" disabled={mutation.isPending || isReloading}>
                {mutation.isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm phòng"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
