"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarPlus, AlertCircle } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createAppointmentSchema, type CreateAppointmentFormValues } from "@/modules/appointment"
import { useCreateAppointment } from "@/modules/appointment"
import { useClinicRooms } from "@/widgets/reception"
import { useOrganizations } from "@/modules/healthexamination"
import { useOrganizationHealthExaminationBatches, useHealthExaminationBatchParticipants } from "@/modules/healthexamination"
import { Patient } from "@/modules/patient"
import { Appointment, CareProgram } from "@/modules/appointment"
import { CareProgramToggle } from "@/modules/appointment"
import { IndividualPatientSection } from "@/modules/appointment"
import { OrganizationSelectionSection } from "@/modules/appointment"
import { CreateAppointmentFooter } from "@/modules/appointment"
import { buildCreateAppointmentDto } from "@/modules/appointment"
import { AppointmentScheduleSection } from "@/modules/appointment"

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPatient?: Patient | null
  initialOrganizationId?: string
  initialHealthExaminationBatchId?: string
  initialParticipantCode?: string
  initialCareProgram?: CareProgram
  onOpenPatientSearch?: () => void
  onOpenCreatePatient?: () => void
  onSuccess?: (created: Appointment) => void
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  initialPatient,
  initialOrganizationId,
  initialHealthExaminationBatchId,
  initialParticipantCode,
  initialCareProgram = "INDIVIDUAL",
  onOpenPatientSearch,
  onOpenCreatePatient,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const [careProgram, setCareProgram] =
    React.useState<CareProgram>(initialCareProgram)
  const [patientOverride, setPatientOverride] = React.useState<Patient | null>(null)
  const selectedPatient = patientOverride ?? initialPatient ?? null
  const [serverError, setServerError] = React.useState<string | null>(null)

  // Organization selection state
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string>(
    initialOrganizationId || ""
  )
  const [selectedHealthExaminationBatchId, setSelectedHealthExaminationBatchId] = React.useState<string>(
    initialHealthExaminationBatchId || ""
  )
  const [selectedParticipantCode, setSelectedParticipantCode] = React.useState<string>(
    initialParticipantCode || ""
  )
  const [isLinkingParticipant, setIsLinkingParticipant] = React.useState(false)

  // Data queries
  const { data: rooms } = useClinicRooms()
  const {
    data: organizationsData,
    isLoading: isLoadingOrganizations,
    isError: isOrganizationsError,
    error: organizationsError,
  } = useOrganizations()
  const organizations = React.useMemo(
    () => organizationsData?.data || [],
    [organizationsData?.data]
  )
  const { data: batchesData } = useOrganizationHealthExaminationBatches(selectedOrganizationId)
  const batches = React.useMemo(() => batchesData?.data || [], [batchesData?.data])
  const { data: participantsData } = useHealthExaminationBatchParticipants(
    selectedOrganizationId,
    selectedHealthExaminationBatchId,
    { pageSize: 100 }
  )
  const participants = React.useMemo(
    () => participantsData?.data || [],
    [participantsData?.data]
  )

  const createMutation = useCreateAppointment()

  const defaultTime = "09:00"

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: initialPatient?.id || "",
      examinationType: "Khám tổng quát",
      physicianId: "",
      roomId: "",
      date: "",
      time: defaultTime,
      notes: "",
      careProgram: initialCareProgram,
      organizationId: initialOrganizationId || "",
      healthExaminationBatchId: initialHealthExaminationBatchId || "",
      participantCode: initialParticipantCode || "",
    },
  })

  const examinationTypeValue = useWatch({ control, name: "examinationType" })
  const roomIdValue = useWatch({ control, name: "roomId" })

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (initialCareProgram) setCareProgram(initialCareProgram)
      if (initialOrganizationId) setSelectedOrganizationId(initialOrganizationId)
      if (initialHealthExaminationBatchId) setSelectedHealthExaminationBatchId(initialHealthExaminationBatchId)
      if (initialParticipantCode) setSelectedParticipantCode(initialParticipantCode)
    }
  }

  const linkParticipantToPatient = React.useCallback(
    async (participant: (typeof participants)[0]) => {
      // The participant list only exposes a masked CCCD, so the patient cannot
      // be matched automatically. The user must choose the patient record.
      void participant
      setIsLinkingParticipant(false)
      setServerError(
        "Không thể tự liên kết hồ sơ: danh sách người khám chỉ hiển thị CCCD đã che. Vui lòng chọn hồ sơ bệnh nhân."
      )
    },
    []
  )

  // Synchronize form fields when opening
  React.useEffect(() => {
    if (open) {
      if (initialCareProgram) {
        setValue("careProgram", initialCareProgram)
      }
      if (initialOrganizationId) {
        setValue("organizationId", initialOrganizationId)
      }
      if (initialHealthExaminationBatchId) {
        setValue("healthExaminationBatchId", initialHealthExaminationBatchId)
      }
      if (initialParticipantCode) {
        setValue("participantCode", initialParticipantCode)
      }
      if (selectedPatient?.id) {
        setValue("patientId", selectedPatient.id)
      }
    }
  }, [
    open,
    initialCareProgram,
    initialOrganizationId,
    initialHealthExaminationBatchId,
    initialParticipantCode,
    selectedPatient?.id,
    setValue,
  ])

  // Auto-link the initial participant if provided
  React.useEffect(() => {
    if (open && initialParticipantCode && participants.length > 0 && !selectedPatient) {
      const participant = participants.find((item) => item.participantCode === initialParticipantCode)
      if (participant) {
        const timer = setTimeout(() => {
          void linkParticipantToPatient(participant)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [open, initialParticipantCode, participants, selectedPatient, linkParticipantToPatient])

  React.useEffect(() => {
    if (selectedPatient?.id) {
      setValue("patientId", selectedPatient.id, { shouldValidate: true })
    }
  }, [selectedPatient?.id, setValue])

  const handleSelectParticipant = (participantCode: string) => {
    setSelectedParticipantCode(participantCode)
    const participant = participants.find((item) => item.participantCode === participantCode)
    if (participant) {
      linkParticipantToPatient(participant)
    }
  }

  const handleSwitchCareProgram = (program: CareProgram) => {
    setCareProgram(program)
    setValue("careProgram", program)
    setServerError(null)

    if (program === "INDIVIDUAL") {
      setValue("examinationType", "Khám tổng quát")
      setValue("organizationId", "")
      setValue("organizationName", "")
      setValue("healthExaminationBatchId", "")
      setValue("healthExaminationBatchName", "")
      setValue("participantCode", "")
    } else {
      setPatientOverride(null)
      setValue("examinationType", "Khám sức khỏe đơn vị")
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setServerError(null)
      setPatientOverride(null)
      setSelectedOrganizationId("")
      setSelectedHealthExaminationBatchId("")
      setSelectedParticipantCode("")
      reset()
    }
    onOpenChange(isOpen)
  }

  const handleOrganizationChange = (organizationId: string) => {
    setSelectedOrganizationId(organizationId)
    setSelectedHealthExaminationBatchId("")
    setSelectedParticipantCode("")
    setPatientOverride(null)
  }

  const handleBatchChange = (batchId: string) => {
    setSelectedHealthExaminationBatchId(batchId)
    setSelectedParticipantCode("")
    setPatientOverride(null)
  }

  const handleExaminationTypeChange = (examinationType: string) => {
    setValue("examinationType", examinationType, { shouldValidate: true })
  }

  const handleRoomChange = (roomId: string) => {
    setValue("roomId", roomId, { shouldValidate: true })
    const room = rooms?.find((item) => item.id === roomId)
    if (room) {
      setValue("physicianId", room.physicianId, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: CreateAppointmentFormValues) => {
    if (!selectedPatient) {
      setServerError("Vui lòng chọn hoặc tạo bệnh nhân cho lịch hẹn")
      return
    }

    try {
      setServerError(null)

      const created = await createMutation.mutateAsync(
        buildCreateAppointmentDto({
          form: data,
          patientId: selectedPatient.id,
          careProgram,
          organization: organizations.find((item) => item.id === selectedOrganizationId),
          batch: batches.find((item) => item.id === selectedHealthExaminationBatchId),
          participantCode: selectedParticipantCode,
        })
      )

      onOpenChange(false)
      reset()
      if (onSuccess) {
        onSuccess(created)
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Không thể tạo lịch hẹn")
    }
  }

  const isPending = isSubmitting || createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl w-full p-0 gap-0 overflow-hidden bg-card border-border sm:rounded-lg">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-surface-alt flex items-center justify-center text-primary">
              <CalendarPlus className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Tạo lịch hẹn
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Đặt trước lịch khám cho bệnh nhân (Nguồn ghi nhận: Lễ tân tạo)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {serverError && (
              <Alert variant="destructive" className="py-2.5 text-xs">
                <AlertCircle className="size-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <CareProgramToggle careProgram={careProgram} onChange={handleSwitchCareProgram} />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Patient Info & Metadata */}
              <div className="md:col-span-5 space-y-3.5">
                {careProgram === "INDIVIDUAL" ? (
                  <IndividualPatientSection
                    selectedPatient={selectedPatient}
                    onOpenPatientSearch={onOpenPatientSearch}
                    onOpenCreatePatient={onOpenCreatePatient}
                  />
                ) : (
                  <OrganizationSelectionSection
                    organizations={organizations}
                    isLoadingOrganizations={isLoadingOrganizations}
                    isOrganizationsError={isOrganizationsError}
                    organizationsError={organizationsError}
                    batches={batches}
                    participants={participants}
                    selectedOrganizationId={selectedOrganizationId}
                    selectedHealthExaminationBatchId={selectedHealthExaminationBatchId}
                    selectedParticipantCode={selectedParticipantCode}
                    selectedPatient={selectedPatient}
                    isPending={isPending}
                    isLinkingParticipant={isLinkingParticipant}
                    onOrganizationChange={handleOrganizationChange}
                    onBatchChange={handleBatchChange}
                    onParticipantChange={handleSelectParticipant}
                  />
                )}

                {errors.patientId?.message && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.patientId.message}
                  </p>
                )}

                <div className="p-3.5 rounded-lg border border-border/70 bg-surface-alt/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nguồn lịch hẹn:</span>
                    <Badge variant="outline" className="bg-card text-foreground font-medium text-[10px]">
                      Lễ tân tạo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
                    Hệ thống sẽ gửi tin nhắn SMS / Zalo nhắc lịch khám tự động trước 24h.
                  </p>
                </div>
              </div>

              <AppointmentScheduleSection
                register={register}
                errors={errors}
                examinationType={examinationTypeValue}
                roomId={roomIdValue}
                rooms={rooms}
                isPending={isPending}
                onExaminationTypeChange={handleExaminationTypeChange}
                onRoomChange={handleRoomChange}
              />
            </div>
          </div>

          <CreateAppointmentFooter
            isPending={isPending}
            canSubmit={!!selectedPatient}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}


