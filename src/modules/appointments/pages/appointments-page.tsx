"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"
import { AppointmentHeaderActions } from "../components/appointment-header-actions"
import { AppointmentCountersStrip } from "../components/appointment-counters-strip"
import { AppointmentTable } from "../components/appointment-table"
import { DataTablePagination } from "@/shared/ui"
import { CreateAppointmentDialog } from "../components/create-appointment-dialog"
import { EditAppointmentDialog } from "../components/edit-appointment-dialog"
import { AppointmentDetailDialog } from "../components/appointment-detail-dialog"
import {
  PatientSearchDialog,
  CreatePatientDialog,
  Patient,
} from "@/modules/patients"
import {
  useAppointments,
  useAppointmentCounters,
  useConfirmArrived,
  useCancelAppointment,
} from "../hooks/use-appointments"
import { Appointment, AppointmentTab, CareProgram } from "../types"

export function AppointmentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const organizationIdParam = searchParams?.get("organizationId") || undefined
  const healthExaminationBatchIdParam = searchParams?.get("healthExaminationBatchId") || undefined
  const participantCodeParam = searchParams?.get("participantCode") || undefined
  const createParam = searchParams?.get("create") === "true"

  // URL state synchronization
  const activeTab = (searchParams?.get("tab") as AppointmentTab) || "ALL"
  const searchTerm = searchParams?.get("q") || ""
  const selectedDoctorId = searchParams?.get("physicianId") || "ALL"
  const selectedExamType = searchParams?.get("examType") || "ALL"
  const selectedCareProgram =
    (searchParams?.get("careProgram") as CareProgram | "ALL") ||
    (organizationIdParam ? "ORGANIZATION_HEALTH_EXAMINATION" : "ALL")
  const page = parseInt(searchParams?.get("page") || "1", 10)
  const pageSize = 10

  const updateUrlParams = React.useCallback(
    (newParams: {
      tab?: string
      q?: string
      physicianId?: string
      examType?: string
      careProgram?: string
      page?: number
    }) => {
      const current = new URLSearchParams(
        Array.from(searchParams?.entries() || [])
      )

      if (newParams.tab !== undefined) {
        if (newParams.tab && newParams.tab !== "ALL") {
          current.set("tab", newParams.tab)
        } else {
          current.delete("tab")
        }
        current.set("page", "1")
      }

      if (newParams.q !== undefined) {
        if (newParams.q.trim()) {
          current.set("q", newParams.q.trim())
        } else {
          current.delete("q")
        }
        current.set("page", "1")
      }

      if (newParams.physicianId !== undefined) {
        if (newParams.physicianId && newParams.physicianId !== "ALL") {
          current.set("physicianId", newParams.physicianId)
        } else {
          current.delete("physicianId")
        }
        current.set("page", "1")
      }

      if (newParams.examType !== undefined) {
        if (newParams.examType && newParams.examType !== "ALL") {
          current.set("examType", newParams.examType)
        } else {
          current.delete("examType")
        }
        current.set("page", "1")
      }

      if (newParams.careProgram !== undefined) {
        if (newParams.careProgram && newParams.careProgram !== "ALL") {
          current.set("careProgram", newParams.careProgram)
        } else {
          current.delete("careProgram")
        }
        current.set("page", "1")
      }

      if (newParams.page !== undefined) {
        current.set("page", newParams.page.toString())
      }

      const searchStr = current.toString()
      const query = searchStr ? `?${searchStr}` : ""
      router.replace(`${pathname}${query}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = React.useState(createParam)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isPatientSearchOpen, setIsPatientSearchOpen] = React.useState(false)
  const [isCreatePatientOpen, setIsCreatePatientOpen] = React.useState(false)

  // Selected item contexts
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<Appointment | null>(null)
  const [selectedPatientForAppt, setSelectedPatientForAppt] =
    React.useState<Patient | null>(null)

  // Queries & Mutations
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAppointments({
    tab: activeTab,
    search: searchTerm,
    physicianId: selectedDoctorId !== "ALL" ? selectedDoctorId : undefined,
    examinationType: selectedExamType !== "ALL" ? selectedExamType : undefined,
    careProgram:
      selectedCareProgram !== "ALL" ? (selectedCareProgram as CareProgram) : undefined,
    organizationId: organizationIdParam,
  })

  const {
    data: counters,
    isLoading: isLoadingCounters,
  } = useAppointmentCounters()

  const confirmArrivedMutation = useConfirmArrived()
  const cancelMutation = useCancelAppointment()

  // Sliced data for pagination
  const totalCount = appointments.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const paginatedAppointments = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return appointments.slice(startIndex, startIndex + pageSize)
  }, [appointments, page, pageSize])

  // Handlers
  const handleOpenCreate = () => {
    setSelectedPatientForAppt(null)
    setIsCreateOpen(true)
  }

  const handleViewAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsDetailOpen(true)
  }

  const handleEditAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsEditOpen(true)
  }

  const handleConfirmArrived = async (apt: Appointment) => {
    await confirmArrivedMutation.mutateAsync(apt.id)
    refetch()
  }

  const handleCheckInAppointment = (apt: Appointment) => {
    // Navigate to reception with appointmentId and patient checkinCode
    router.push(
      `/reception?appointmentId=${apt.id}&checkinCode=${apt.patientCode}`
    )
  }

  const handleCancelAppointment = async (apt: Appointment) => {
    await cancelMutation.mutateAsync({
      id: apt.id,
      reason: "Hủy từ danh sách thao tác nhanh",
    })
    refetch()
  }

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatientForAppt(patient)
    setIsPatientSearchOpen(false)
    setIsCreateOpen(true)
  }

  const handlePatientCreated = (patient: Patient) => {
    setSelectedPatientForAppt(patient)
    setIsCreatePatientOpen(false)
    setIsCreateOpen(true)
  }

  const handleCounterFilter = (key: string) => {
    if (key === "TODAY") {
      updateUrlParams({ tab: "TODAY" })
    } else if (key === "CONFIRMED") {
      updateUrlParams({ tab: "UPCOMING" })
    } else if (key === "ARRIVED") {
      updateUrlParams({ tab: "ARRIVED" })
    } else if (key === "ORGANIZATION") {
      updateUrlParams({ careProgram: "ORGANIZATION_HEALTH_EXAMINATION" })
    } else if (key === "EXAMINED") {
      updateUrlParams({ tab: "EXAMINED" })
    } else {
      updateUrlParams({ tab: "ALL", careProgram: "ALL" })
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-5 w-full">
      <PageHeader
        breadcrumbs={[
          { label: "Bàn tiếp đón", href: "/reception" },
          { label: "Lịch hẹn" },
        ]}
        title="Lịch hẹn"
        description="Danh sách quản lý lịch hẹn khám bệnh và điều phối tiếp nhận"
        actions={
          <AppointmentHeaderActions
            onOpenCreateAppointment={handleOpenCreate}
            onOpenFindPatient={() => setIsPatientSearchOpen(true)}
            onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
          />
        }
      />

      {/* 2. Compact Operational Counters Strip (Height 76px) */}
      <AppointmentCountersStrip
        counters={counters}
        isLoading={isLoadingCounters}
        onFilterStatus={handleCounterFilter}
        activeStatusKey={activeTab}
      />

      {/* 3. Error state */}
      {isError && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {(error as Error)?.message ||
                "Có lỗi xảy ra khi tải danh sách lịch hẹn"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10 cursor-pointer"
          >
            <RefreshCw className="size-3 mr-1" />
            Tải lại
          </Button>
        </div>
      )}

      {/* 4. Main Appointment Table */}
      {!isError && (
        <div className="flex-1 flex flex-col">
          <AppointmentTable
            appointments={paginatedAppointments}
            isLoading={isLoading}
            activeTab={activeTab}
            onTabChange={(newTab) => updateUrlParams({ tab: newTab })}
            searchTerm={searchTerm}
            onSearchChange={(q) => updateUrlParams({ q })}
            selectedDoctorId={selectedDoctorId}
            onDoctorChange={(doc) => updateUrlParams({ physicianId: doc })}
            selectedExamType={selectedExamType}
            onExamTypeChange={(exam) => updateUrlParams({ examType: exam })}
            selectedCareProgram={selectedCareProgram}
            onCareProgramChange={(program) => updateUrlParams({ careProgram: program })}
            onViewAppointment={handleViewAppointment}
            onEditAppointment={handleEditAppointment}
            onConfirmArrived={handleConfirmArrived}
            onCheckInAppointment={handleCheckInAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        </div>
      )}

      {/* 5. Pagination */}
      {!isError && !isLoading && totalCount > 0 && (
        <div className="pt-1 mt-1">
          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={totalCount}
            totalPages={totalPages}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            entityName="lịch hẹn"
          />
        </div>
      )}

      {/* 6. Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialPatient={selectedPatientForAppt}
        initialOrganizationId={organizationIdParam}
        initialHealthExaminationBatchId={healthExaminationBatchIdParam}
        initialParticipantCode={participantCodeParam}
        initialCareProgram={
          organizationIdParam ? "ORGANIZATION_HEALTH_EXAMINATION" : "INDIVIDUAL"
        }
        onOpenPatientSearch={() => setIsPatientSearchOpen(true)}
        onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
        onSuccess={() => refetch()}
      />

      {/* 7. Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        appointment={selectedAppointment}
        onSuccess={() => refetch()}
      />

      {/* 8. View Appointment Detail Dialog */}
      <AppointmentDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        appointment={selectedAppointment}
        onEdit={(apt) => {
          setSelectedAppointment(apt)
          setIsEditOpen(true)
        }}
        onConfirmArrived={handleConfirmArrived}
        onCheckIn={handleCheckInAppointment}
      />

      {/* 9. Patient Search Dialog */}
      <PatientSearchDialog
        open={isPatientSearchOpen}
        onOpenChange={setIsPatientSearchOpen}
        onSelectPatient={handlePatientSelected}
        onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
      />

      {/* 10. Create Patient Dialog */}
      <CreatePatientDialog
        open={isCreatePatientOpen}
        onOpenChange={setIsCreatePatientOpen}
        onSuccess={handlePatientCreated}
      />
    </div>
  )
}

