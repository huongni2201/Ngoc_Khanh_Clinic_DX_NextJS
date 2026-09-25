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
} from "lucide-react"
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
import { useExaminationRooms } from "@/modules/reception"
import { useEnterprises } from "@/modules/companies/hooks/use-enterprises"
import {
  useEnterpriseHealthExaminationBatches,
  useHealthExaminationBatchEmployees,
} from "@/modules/health-examinations/hooks/use-health-examination-batches"
import { searchPatients, createPatient } from "@/modules/patients/api"
import { Patient } from "@/modules/patients"
import { Appointment, AppointmentType } from "../types"
import { cn } from "@/lib/utils"

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPatient?: Patient | null
  initialEnterpriseId?: string
  initialBatchId?: string
  initialEmployeeCode?: string
  initialType?: AppointmentType
  onOpenPatientSearch?: () => void
  onOpenCreatePatient?: () => void
  onSuccess?: (created: Appointment) => void
}

const APPOINTMENT_EXAM_TYPES = [
  "Khám tổng quát",
  "Khám sức khỏe doanh nghiệp",
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
  initialEnterpriseId,
  initialBatchId,
  initialEmployeeCode,
  initialType = "INDIVIDUAL",
  onOpenPatientSearch,
  onOpenCreatePatient,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const [appointmentType, setAppointmentType] =
    React.useState<AppointmentType>(initialType)
  const [patientOverride, setPatientOverride] = React.useState<Patient | null>(null)
  const selectedPatient = patientOverride ?? initialPatient ?? null
  const [serverError, setServerError] = React.useState<string | null>(null)

  // Enterprise selection state
  const [selectedEnterpriseId, setSelectedEnterpriseId] = React.useState<string>(
    initialEnterpriseId || ""
  )
  const [selectedBatchId, setSelectedBatchId] = React.useState<string>(
    initialBatchId || ""
  )
  const [selectedEmployeeCode, setSelectedEmployeeCode] = React.useState<string>(
    initialEmployeeCode || ""
  )
  const [isLinkingEmployee, setIsLinkingEmployee] = React.useState(false)

  // Data queries
  const { data: rooms } = useExaminationRooms()
  const { data: enterprisesData } = useEnterprises()
  const enterprises = React.useMemo(
    () => enterprisesData?.data || [],
    [enterprisesData?.data]
  )
  const { data: batchesData } = useEnterpriseHealthExaminationBatches(selectedEnterpriseId)
  const batches = React.useMemo(() => batchesData?.data || [], [batchesData?.data])
  const { data: employeesData } = useHealthExaminationBatchEmployees(selectedBatchId, {
    pageSize: 100,
  })
  const employees = React.useMemo(
    () => employeesData?.data || [],
    [employeesData?.data]
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
      type: initialType,
      enterpriseId: initialEnterpriseId || "",
      batchId: initialBatchId || "",
      employeeCode: initialEmployeeCode || "",
    },
  })

  const examinationTypeValue = useWatch({ control, name: "examinationType" })
  const roomIdValue = useWatch({ control, name: "roomId" })

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (initialType) setAppointmentType(initialType)
      if (initialEnterpriseId) setSelectedEnterpriseId(initialEnterpriseId)
      if (initialBatchId) setSelectedBatchId(initialBatchId)
      if (initialEmployeeCode) setSelectedEmployeeCode(initialEmployeeCode)
    }
  }

  const linkEmployeeToPatient = React.useCallback(
    async (emp: (typeof employees)[0]) => {
      try {
        setIsLinkingEmployee(true)
        setServerError(null)

        // Search existing patient by CCCD or phone
        const queryKey = emp.cccd || emp.phone
        const existing = await searchPatients(queryKey)
        const matched = existing.find(
          (p) =>
            (emp.cccd && p.identificationNumber === emp.cccd) ||
            (emp.phone && p.phoneNumber === emp.phone)
        )

        let linkedPatient: Patient
        if (matched) {
          linkedPatient = matched
        } else {
          // Auto-create patient from employee roster per domain rules
          linkedPatient = await createPatient({
            fullName: emp.fullName,
            dateOfBirth: emp.dob || "1990-01-01",
            gender: emp.gender === "Nữ" ? "FEMALE" : "MALE",
            identificationNumber: emp.cccd || `CCCD-${emp.employeeCode}`,
            phoneNumber: emp.phone || "0900000000",
            address: emp.address || "Hà Nội",
          })
        }

        setPatientOverride(linkedPatient)
        setValue("patientId", linkedPatient.id, { shouldValidate: true })
        setValue("examinationType", "Khám sức khỏe doanh nghiệp", {
          shouldValidate: true,
        })

        const ent = enterprises.find((e) => e.id === selectedEnterpriseId)
        const batch = batches.find((b) => b.id === selectedBatchId)

        setValue("type", "ENTERPRISE")
        setValue("enterpriseId", selectedEnterpriseId)
        setValue("enterpriseName", ent?.name || "")
        setValue("batchId", selectedBatchId)
        setValue("batchName", batch?.name || "")
        setValue("employeeCode", emp.employeeCode)
      } catch (err) {
        setServerError(
          (err as Error)?.message || "Không thể liên kết nhân sự với hồ sơ bệnh nhân"
        )
      } finally {
        setIsLinkingEmployee(false)
      }
    },
    [batches, enterprises, selectedBatchId, selectedEnterpriseId, setValue]
  )

  // Synchronize form fields when opening
  React.useEffect(() => {
    if (open) {
      if (initialType) {
        setValue("type", initialType)
      }
      if (initialEnterpriseId) {
        setValue("enterpriseId", initialEnterpriseId)
      }
      if (initialBatchId) {
        setValue("batchId", initialBatchId)
      }
      if (initialEmployeeCode) {
        setValue("employeeCode", initialEmployeeCode)
      }
      if (selectedPatient?.id) {
        setValue("patientId", selectedPatient.id)
      }
    }
  }, [
    open,
    initialType,
    initialEnterpriseId,
    initialBatchId,
    initialEmployeeCode,
    selectedPatient?.id,
    setValue,
  ])

  // Auto-link initial employee if provided
  React.useEffect(() => {
    if (open && initialEmployeeCode && employees.length > 0 && !selectedPatient) {
      const emp = employees.find((e) => e.employeeCode === initialEmployeeCode)
      if (emp) {
        const timer = setTimeout(() => {
          void linkEmployeeToPatient(emp)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [open, initialEmployeeCode, employees, selectedPatient, linkEmployeeToPatient])

  React.useEffect(() => {
    if (selectedPatient?.id) {
      setValue("patientId", selectedPatient.id, { shouldValidate: true })
    }
  }, [selectedPatient?.id, setValue])

  const handleSelectEmployee = (empCode: string) => {
    setSelectedEmployeeCode(empCode)
    const emp = employees.find((e) => e.employeeCode === empCode)
    if (emp) {
      linkEmployeeToPatient(emp)
    }
  }

  const handleSwitchType = (type: AppointmentType) => {
    setAppointmentType(type)
    setValue("type", type)
    setServerError(null)

    if (type === "INDIVIDUAL") {
      setValue("examinationType", "Khám tổng quát")
      setValue("enterpriseId", "")
      setValue("enterpriseName", "")
      setValue("batchId", "")
      setValue("batchName", "")
      setValue("employeeCode", "")
      if (appointmentType === "ENTERPRISE") {
        setPatientOverride(null)
      }
    } else {
      setValue("examinationType", "Khám sức khỏe doanh nghiệp")
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setServerError(null)
      setPatientOverride(null)
      setSelectedEnterpriseId("")
      setSelectedBatchId("")
      setSelectedEmployeeCode("")
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

      const ent = enterprises.find((e) => e.id === selectedEnterpriseId)
      const batch = batches.find((b) => b.id === selectedBatchId)

      const created = await createMutation.mutateAsync({
        patientId: selectedPatient.id,
        examinationType: data.examinationType,
        physicianId: data.physicianId,
        roomId: data.roomId,
        date: data.date,
        time: data.time,
        notes: data.notes || undefined,
        source: "RECEPTION",
        type: appointmentType,
        enterpriseId:
          appointmentType === "ENTERPRISE" ? selectedEnterpriseId : undefined,
        enterpriseName:
          appointmentType === "ENTERPRISE" ? ent?.name : undefined,
        batchId: appointmentType === "ENTERPRISE" ? selectedBatchId : undefined,
        batchName:
          appointmentType === "ENTERPRISE" ? batch?.name : undefined,
        employeeCode:
          appointmentType === "ENTERPRISE" ? selectedEmployeeCode : undefined,
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
      <DialogContent className="sm:max-w-3xl md:max-w-4xl w-full p-0 gap-0 overflow-hidden bg-card border-border sm:rounded-xl">
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

            {/* Appointment Type Toggle: Khám cá nhân vs Khám doanh nghiệp */}
            <div className="flex items-center gap-2 p-1 bg-surface-alt rounded-lg w-fit border border-border">
              <button
                type="button"
                onClick={() => handleSwitchType("INDIVIDUAL")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  appointmentType === "INDIVIDUAL"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="size-3.5" />
                <span>Khám cá nhân</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchType("ENTERPRISE")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  appointmentType === "ENTERPRISE"
                    ? "bg-card text-primary shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="size-3.5" />
                <span>Khám doanh nghiệp</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Patient Info & Metadata */}
              <div className="md:col-span-5 space-y-3.5">
                {appointmentType === "INDIVIDUAL" ? (
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
                      <div className="p-4 rounded-xl border border-border bg-surface-alt/50 space-y-3">
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
                      <div className="p-6 rounded-xl border border-dashed border-border bg-surface-alt/40 flex flex-col items-center justify-center text-center gap-2.5">
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
                  /* Enterprise Workflow */
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      1. Chọn đoàn & Nhân viên
                    </span>

                    {/* Enterprise select */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground">
                        Doanh nghiệp <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedEnterpriseId}
                        onValueChange={(val) => {
                          setSelectedEnterpriseId(val || "")
                          setSelectedBatchId("")
                          setSelectedEmployeeCode("")
                          setPatientOverride(null)
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-card">
                          <SelectValue placeholder="-- Chọn công ty / doanh nghiệp --" />
                        </SelectTrigger>
                        <SelectContent>
                          {enterprises.map((ent) => (
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
                        value={selectedBatchId}
                        onValueChange={(val) => {
                          setSelectedBatchId(val || "")
                          setSelectedEmployeeCode("")
                          setPatientOverride(null)
                        }}
                        disabled={!selectedEnterpriseId || isPending}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-card">
                          <SelectValue
                            placeholder={
                              selectedEnterpriseId
                                ? "-- Chọn đợt khám --"
                                : "Vui lòng chọn doanh nghiệp trước"
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

                    {/* Employee select */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-foreground">
                        Nhân viên trong đợt khám{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedEmployeeCode}
                        onValueChange={(val) => {
                          if (val) handleSelectEmployee(val)
                        }}
                        disabled={!selectedBatchId || isPending || isLinkingEmployee}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-card">
                          <SelectValue
                            placeholder={
                              selectedBatchId
                                ? isLinkingEmployee
                                ? "Đang liên kết hồ sơ..."
                                : "-- Chọn nhân viên khám --"
                                : "Vui lòng chọn đợt khám trước"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.employeeCode}>
                              {emp.employeeCode} - {emp.fullName} ({emp.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Linked patient card */}
                    {selectedPatient && (
                      <div className="p-3.5 rounded-xl border border-border bg-surface-alt/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                            <Building2 className="size-3.5" />
                            <span>Hồ sơ liên kết</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-card text-primary font-mono text-[10px]"
                          >
                            {selectedEmployeeCode}
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

                <div className="p-3.5 rounded-xl border border-border/70 bg-surface-alt/30 space-y-1.5 text-xs">
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
