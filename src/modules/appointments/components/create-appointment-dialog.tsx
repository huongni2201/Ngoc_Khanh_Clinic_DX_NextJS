"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarPlus,
  UserPlus,
  Search,
  AlertCircle,
  Loader2,
  Building2,
  User,
} from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  createAppointmentSchema,
  type CreateAppointmentFormValues,
} from "../schemas/appointment.schema"
import { useCreateAppointment } from "../hooks/use-appointments"
import { useClinicRooms } from "@/modules/reception"
import { useOrganizations } from "@/modules/organizations/hooks/use-organizations"
import {
  useOrganizationHealthExaminationBatches,
  useHealthExaminationBatchParticipants,
} from "@/modules/health-examinations/hooks/use-health-examination-batches"
import { searchPatients, createPatient } from "@/modules/patients/api"
import { Patient } from "@/modules/patients"
import { Appointment, CareProgram } from "../types"
import { cn } from "@/lib/utils"

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

const APPOINTMENT_EXAM_TYPES = [
  "Khám tổng quát",
  "Khám sức khỏe đơn vị",
  "Nội tổng quát",
  "Tim mạch",
  "Cơ xương khớp",
  "Khám da liễu",
  "Hô hấp",
  "Nội tiết",
  "Sản phụ khoa",
  "Khám sức khỏe định kỳ",
]

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
  const { data: organizationsData } = useOrganizations()
  const organizations = React.useMemo(
    () => organizationsData?.data || [],
    [organizationsData?.data]
  )
  const { data: batchesData } = useOrganizationHealthExaminationBatches(selectedOrganizationId)
  const batches = React.useMemo(() => batchesData?.data || [], [batchesData?.data])
  const { data: participantsData } = useHealthExaminationBatchParticipants(selectedHealthExaminationBatchId, {
    pageSize: 100,
  })
  const participants = React.useMemo(
    () => participantsData?.data || [],
    [participantsData?.data]
  )

  const createMutation = useCreateAppointment()

  const defaultDate = "2026-09-24"
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
      physicianId: "doc-04",
      roomId: "room-104",
      date: defaultDate,
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
      try {
        setIsLinkingParticipant(true)
        setServerError(null)

        // Search existing patient by CCCD or phone
        const queryKey = participant.identificationNumber || participant.phoneNumber || ""
        const existing = await searchPatients(queryKey)
        const matched = existing.find(
          (p) =>
            (participant.identificationNumber &&
              p.identificationNumber === participant.identificationNumber) ||
            (participant.phoneNumber && p.phoneNumber === participant.phoneNumber)
        )

        let linkedPatient: Patient
        if (matched) {
          linkedPatient = matched
        } else {
          // Auto-create a patient only when this participant has no linked patient.
          linkedPatient = await createPatient({
            fullName: participant.fullName,
            dateOfBirth: participant.dateOfBirth || "1990-01-01",
            gender: participant.gender === "Nữ" ? "FEMALE" : "MALE",
            identificationNumber:
              participant.identificationNumber || `CCCD-${participant.participantCode}`,
            phoneNumber: participant.phoneNumber || "0900000000",
            address: participant.address || "Hà Nội",
          })
        }

        setPatientOverride(linkedPatient)
        setValue("patientId", linkedPatient.id, { shouldValidate: true })
        setValue("examinationType", "Khám sức khỏe đơn vị", {
          shouldValidate: true,
        })

        const ent = organizations.find((e) => e.id === selectedOrganizationId)
        const batch = batches.find((b) => b.id === selectedHealthExaminationBatchId)

        setValue("careProgram", "ORGANIZATION_HEALTH_EXAMINATION")
        setValue("organizationId", selectedOrganizationId)
        setValue("organizationName", ent?.name || "")
        setValue("healthExaminationBatchId", selectedHealthExaminationBatchId)
        setValue("healthExaminationBatchName", batch?.name || "")
        setValue("participantCode", participant.participantCode || "")
      } catch (err) {
        setServerError(
          (err as Error)?.message || "Không thể liên kết người khám với hồ sơ bệnh nhân"
        )
      } finally {
        setIsLinkingParticipant(false)
      }
    },
    [batches, organizations, selectedHealthExaminationBatchId, selectedOrganizationId, setValue]
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

  const onSubmit = async (data: CreateAppointmentFormValues) => {
    if (!selectedPatient) {
      setServerError("Vui lòng chọn hoặc tạo bệnh nhân cho lịch hẹn")
      return
    }

    try {
      setServerError(null)

      const ent = organizations.find((e) => e.id === selectedOrganizationId)
      const batch = batches.find((b) => b.id === selectedHealthExaminationBatchId)

      const created = await createMutation.mutateAsync({
        patientId: selectedPatient.id,
        examinationType: data.examinationType,
        physicianId: data.physicianId,
        roomId: data.roomId,
        date: data.date,
        time: data.time,
        notes: data.notes || undefined,
        bookingChannel: "FRONT_DESK",
        careProgram,
        organizationId:
          careProgram === "ORGANIZATION_HEALTH_EXAMINATION"
            ? selectedOrganizationId
            : undefined,
        organizationName:
          careProgram === "ORGANIZATION_HEALTH_EXAMINATION" ? ent?.name : undefined,
        healthExaminationBatchId:
          careProgram === "ORGANIZATION_HEALTH_EXAMINATION"
            ? selectedHealthExaminationBatchId
            : undefined,
        healthExaminationBatchName:
          careProgram === "ORGANIZATION_HEALTH_EXAMINATION" ? batch?.name : undefined,
        participantCode:
          careProgram === "ORGANIZATION_HEALTH_EXAMINATION"
            ? selectedParticipantCode
            : undefined,
      })

      onOpenChange(false)
      reset()
      if (onSuccess) {
        onSuccess(created)
      }
    } catch (err) {
      setServerError((err as Error)?.message || "Không thể tạo lịch hẹn")
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

            {/* Appointment Type Toggle: Khám cá nhân vs Khám đơn vị */}
            <div className="flex items-center gap-2 p-1 bg-surface-alt rounded-lg w-fit border border-border">
              <button
                type="button"
                onClick={() => handleSwitchCareProgram("INDIVIDUAL")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  careProgram === "INDIVIDUAL"
                    ? "bg-card text-foreground  font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="size-3.5" />
                <span>Khám cá nhân</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchCareProgram("ORGANIZATION_HEALTH_EXAMINATION")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  careProgram === "ORGANIZATION_HEALTH_EXAMINATION"
                    ? "bg-card text-primary  font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="size-3.5" />
                <span>Khám đơn vị</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Patient Info & Metadata */}
              <div className="md:col-span-5 space-y-3.5">
                {careProgram === "INDIVIDUAL" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        1. Người bệnh đặt hẹn
                      </span>
                      {onOpenCreatePatient && (
                        <button
                          type="button"
                          onClick={onOpenCreatePatient}
                          className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                        >
                          + Tạo BN mới
                        </button>
                      )}
                    </div>

                    {selectedPatient ? (
                      <div className="p-4 rounded-lg border border-border bg-surface-alt/50 space-y-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {selectedPatient.fullName}
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-card text-primary font-mono text-[10px]"
                            >
                              {selectedPatient.patientCode}
                            </Badge>
                          </div>
                          <div className="text-xs text-secondary-foreground pt-1 space-y-1">
                            <div>
                              SĐT:{" "}
                              <strong className="text-foreground">
                                {selectedPatient.phoneNumber}
                              </strong>
                            </div>
                            <div>
                              Số định danh:{" "}
                              <span className="font-mono text-foreground font-semibold">
                                {selectedPatient.identificationNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        {onOpenPatientSearch && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onOpenPatientSearch}
                            className="h-7 text-xs bg-card w-full mt-2"
                          >
                            Đổi bệnh nhân
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 rounded-lg border border-dashed border-border bg-surface-alt/40 flex flex-col items-center justify-center text-center gap-2.5">
                        <span className="text-xs text-muted-foreground">
                          Chưa chọn hồ sơ bệnh nhân
                        </span>
                        <div className="flex items-center gap-2">
                          {onOpenPatientSearch && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={onOpenPatientSearch}
                              className="gap-1 h-7 text-xs bg-card"
                            >
                              <Search className="size-3" />
                              Tìm bệnh nhân
                            </Button>
                          )}
                          {onOpenCreatePatient && (
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={onOpenCreatePatient}
                              className="gap-1 h-7 text-xs bg-primary text-primary-foreground"
                            >
                              <UserPlus className="size-3" />
                              Tạo mới
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Organization Workflow */
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      1. Chọn đoàn & Nhân viên
                    </span>

                    {/* Organization select */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground">
                        Đơn vị <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedOrganizationId}
                        onValueChange={(val) => {
                          setSelectedOrganizationId(val || "")
                          setSelectedHealthExaminationBatchId("")
                          setSelectedParticipantCode("")
                          setPatientOverride(null)
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-card">
                          <SelectValue placeholder="-- Chọn công ty / đơn vị --" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((ent) => (
                            <SelectItem key={ent.id} value={ent.id}>
                              {ent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Batch select */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground">
                        Đợt khám sức khỏe <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedHealthExaminationBatchId}
                        onValueChange={(val) => {
                          setSelectedHealthExaminationBatchId(val || "")
                          setSelectedParticipantCode("")
                          setPatientOverride(null)
                        }}
                        disabled={!selectedOrganizationId || isPending}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-card">
                          <SelectValue
                            placeholder={
                              selectedOrganizationId
                                ? "-- Chọn đợt khám --"
                                : "Vui lòng chọn đơn vị trước"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name} ({b.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Participant select */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground">
                        Nhân viên trong đợt khám{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedParticipantCode}
                        onValueChange={(val) => {
                          if (val) handleSelectParticipant(val)
                        }}
                        disabled={!selectedHealthExaminationBatchId || isPending || isLinkingParticipant}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-card">
                          <SelectValue
                            placeholder={
                              selectedHealthExaminationBatchId
                                ? isLinkingParticipant
                                ? "Đang liên kết hồ sơ..."
                                : "-- Chọn nhân viên khám --"
                                : "Vui lòng chọn đợt khám trước"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {participants.map((participant) => (
                            <SelectItem key={participant.id} value={participant.participantCode || participant.id}>
                              {participant.participantCode || participant.id} - {participant.fullName} ({participant.organizationUnit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Linked patient card */}
                    {selectedPatient && (
                      <div className="p-3.5 rounded-lg border border-border bg-surface-alt/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                            <Building2 className="size-3.5" />
                            <span>Hồ sơ liên kết</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-card text-primary font-mono text-[10px]"
                          >
                            {selectedParticipantCode}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {selectedPatient.fullName}
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-card text-muted-foreground font-mono text-[10px]"
                            >
                              {selectedPatient.patientCode}
                            </Badge>
                          </div>
                          <div className="text-secondary-foreground text-[11px] space-y-0.5">
                            <div>
                              SĐT:{" "}
                              <strong className="text-foreground">
                                {selectedPatient.phoneNumber}
                              </strong>
                            </div>
                            <div>
                              CCCD:{" "}
                              <span className="font-mono text-foreground font-semibold">
                                {selectedPatient.identificationNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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

              {/* Right Column (7 cols): Scheduling Inputs */}
              <div className="md:col-span-7 space-y-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  2. Lịch khám & Chuyên khoa
                </span>

                {/* Field: Examination Type */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="examType"
                    className="text-xs font-medium text-foreground"
                  >
                    Loại khám <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={examinationTypeValue}
                    onValueChange={(val) => {
                      if (val) {
                        setValue("examinationType", val, { shouldValidate: true })
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="examType" className="h-9 text-xs">
                      <SelectValue placeholder="Chọn loại khám" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_EXAM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.examinationType && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.examinationType.message}
                    </p>
                  )}
                </div>

                {/* Field: Room & Doctor */}
                <div className="space-y-1.5">
                  <Label htmlFor="roomDoctor" className="text-xs font-medium text-foreground">
                    Bác sĩ & Phòng khám <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={roomIdValue}
                    onValueChange={(val) => {
                      if (val) {
                        setValue("roomId", val, { shouldValidate: true })
                        const r = rooms?.find((rm) => rm.id === val)
                        if (r) {
                          setValue("physicianId", r.physicianId, { shouldValidate: true })
                        }
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="roomDoctor" className="h-9 text-xs">
                      <SelectValue placeholder="Chọn bác sĩ và phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms?.map((rm) => (
                        <SelectItem key={rm.id} value={rm.id}>
                          {rm.name} — {rm.physicianName} ({rm.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row: Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-medium text-foreground">
                      Ngày hẹn <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      {...register("date")}
                      className="h-9 text-xs"
                      disabled={isPending}
                      aria-invalid={!!errors.date}
                    />
                    {errors.date && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="text-xs font-medium text-foreground">
                      Giờ hẹn <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      {...register("time")}
                      className="h-9 text-xs"
                      disabled={isPending}
                      aria-invalid={!!errors.time}
                    />
                    {errors.time && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Field: Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-medium text-foreground">
                    Ghi chú hẹn khám
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Yêu cầu cụ thể, dặn nhịn ăn sáng, mang theo kết quả cũ..."
                    {...register("notes")}
                    rows={2}
                    className="text-xs resize-none"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t border-border bg-card flex items-center justify-between gap-2 sm:gap-2">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Nhấn ESC để đóng
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !selectedPatient}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Tạo lịch hẹn"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


