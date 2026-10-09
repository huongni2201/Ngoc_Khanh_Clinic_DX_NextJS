"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  patientCheckInSchema,
  type PatientCheckInFormValues,
} from "../schemas/reception.schema"
import { usePatientCheckIn, useClinicRooms } from "../hooks/use-reception"
import { Patient } from "@/modules/patient"
import { Encounter } from "../types"
import { CheckInPatientProfile } from "./check-in/check-in-patient-profile"
import { CheckInEncounterFields } from "./check-in/check-in-encounter-fields"

interface PatientCheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPatient?: Patient | null
  initialEncounter?: Encounter | null
  onOpenPatientSearch?: () => void
  onSuccess?: (createdEncounter: Encounter, shouldPrint: boolean) => void
}

export function PatientCheckInDialog({
  open,
  onOpenChange,
  initialPatient,
  initialEncounter,
  onOpenPatientSearch,
  onSuccess,
}: PatientCheckInDialogProps) {
  const [patientOverride, setPatientOverride] = React.useState<Patient | null>(null)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const selectedPatient =
    patientOverride ??
    initialPatient ??
    (initialEncounter
      ? {
          id: initialEncounter.patientId,
          patientCode: initialEncounter.patientCode,
          fullName: initialEncounter.patientName,
          birthYear: initialEncounter.birthYear,
          dateOfBirth: initialEncounter.dateOfBirth,
          gender: initialEncounter.gender,
          phoneNumber: initialEncounter.phoneNumber,
          identificationNumber: initialEncounter.identificationNumber,
        }
      : null)

  const { data: rooms } = useClinicRooms()
  const receiveMutation = usePatientCheckIn()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientCheckInFormValues>({
    resolver: zodResolver(patientCheckInSchema),
    defaultValues: {
      patientId: initialPatient?.id || initialEncounter?.patientId || "",
      examinationType: initialEncounter?.examinationType || "Khám tổng quát",
      roomId: initialEncounter?.roomId || "",
      physicianId: initialEncounter?.physicianId || "",
      reasonForVisit: initialEncounter?.reasonForVisit || "",
      notes: initialEncounter?.notes || "",
      printAfterReception: true,
    },
  })

  const examinationTypeValue = useWatch({ control, name: "examinationType" })
  const roomIdValue = useWatch({ control, name: "roomId" })
  const printAfterReceptionValue = useWatch({ control, name: "printAfterReception" })

  React.useEffect(() => {
    if (selectedPatient?.id) {
      setValue("patientId", selectedPatient.id, { shouldValidate: true })
    }
  }, [selectedPatient?.id, setValue])

  React.useEffect(() => {
    if (open) {
      if (selectedPatient?.id) {
        setValue("patientId", selectedPatient.id)
      }
      if (initialEncounter?.examinationType) {
        setValue("examinationType", initialEncounter.examinationType)
      }
      if (initialEncounter?.roomId) {
        setValue("roomId", initialEncounter.roomId)
      }
      if (initialEncounter?.physicianId) {
        setValue("physicianId", initialEncounter.physicianId)
      }
      if (initialEncounter?.reasonForVisit) {
        setValue("reasonForVisit", initialEncounter.reasonForVisit)
      }
    }
  }, [open, selectedPatient?.id, initialEncounter, setValue])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setServerError(null)
      setPatientOverride(null)
      reset()
    }
    onOpenChange(isOpen)
  }

  const handleExaminationTypeChange = (examinationType: string) => {
    setValue("examinationType", examinationType, { shouldValidate: true })
  }

  const handleRoomChange = (roomId: string | null) => {
    if (roomId === null) {
      setValue("roomId", "")
      setValue("physicianId", "")
      return
    }
    setValue("roomId", roomId)
    const room = rooms?.find((item) => item.id === roomId)
    if (room) {
      setValue("physicianId", room.physicianId)
    }
  }

  const onSubmit = async (data: PatientCheckInFormValues) => {
    if (!selectedPatient) {
      setServerError("Vui lòng chọn hoặc tìm bệnh nhân trước khi tiếp nhận")
      return
    }

    try {
      setServerError(null)
      const encounter = await receiveMutation.mutateAsync({
        patientId: selectedPatient.id,
        examinationType: data.examinationType,
        roomId: data.roomId || undefined,
        physicianId: data.physicianId || undefined,
        reasonForVisit: data.reasonForVisit || undefined,
        notes: data.notes || undefined,
        printAfterReception: data.printAfterReception,
      })

      onOpenChange(false)
      reset()
      if (onSuccess) {
        onSuccess(encounter, !!data.printAfterReception)
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Lỗi khi tiếp nhận bệnh nhân")
    }
  }

  const isPending = isSubmitting || receiveMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tiếp nhận bệnh nhân
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tạo lượt khám (Encounter) và chuyển bệnh nhân vào hàng đợi phòng khám
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 -mr-1">
            {serverError && (
              <Alert variant="destructive" className="py-2.5 text-xs">
                <AlertCircle className="size-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}


            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <CheckInPatientProfile
                selectedPatient={selectedPatient}
                patientIdError={errors.patientId?.message}
                onOpenPatientSearch={onOpenPatientSearch}
              />
              <CheckInEncounterFields
                register={register}
                errors={errors}
                examinationType={examinationTypeValue}
                roomId={roomIdValue}
                printAfterReception={printAfterReceptionValue}
                rooms={rooms}
                isPending={isPending}
                onExaminationTypeChange={handleExaminationTypeChange}
                onRoomChange={handleRoomChange}
                onReasonSuggestion={(reason) => setValue("reasonForVisit", reason)}
                onPrintAfterReceptionChange={(print) => setValue("printAfterReception", print)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedPatient}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg  cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
              {isPending ? "Đang tiếp nhận..." : "Tiếp nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
