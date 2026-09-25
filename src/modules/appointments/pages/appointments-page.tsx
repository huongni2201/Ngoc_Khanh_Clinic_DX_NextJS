"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Home, ChevronRight, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Appointment, AppointmentTab, AppointmentType } from "../types"

export function AppointmentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const enterpriseIdParam = searchParams?.get("enterpriseId") || undefined
  const batchIdParam = searchParams?.get("batchId") || undefined
  const employeeCodeParam = searchParams?.get("employeeCode") || undefined
  const createParam = searchParams?.get("create") === "true"

  // URL state synchronization
  const activeTab = (searchParams?.get("tab") as AppointmentTab) || "ALL"
  const searchTerm = searchParams?.get("q") || ""
  const selectedDoctorId = searchParams?.get("physicianId") || "ALL"
  const selectedExamType = searchParams?.get("examType") || "ALL"
  const selectedType =
    (searchParams?.get("type") as AppointmentType | "ALL") ||
    (enterpriseIdParam ? "ENTERPRISE" : "ALL")
  const page = parseInt(searchParams?.get("page") || "1", 10)
  const pageSize = 10

  const updateUrlParams = React.useCallback(
    (newParams: {
      tab?: string
      q?: string
      physicianId?: string
      examType?: string
      type?: string
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

      if (newParams.type !== undefined) {
        if (newParams.type && newParams.type !== "ALL") {
          current.set("type", newParams.type)
        } else {
          current.delete("type")
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
    type: selectedType !== "ALL" ? (selectedType as AppointmentType) : undefined,
    enterpriseId: enterpriseIdParam,
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
    } else if (key === "ENTERPRISE") {
      updateUrlParams({ type: "ENTERPRISE" })
    } else if (key === "EXAMINED") {
      updateUrlParams({ tab: "EXAMINED" })
    } else {
      updateUrlParams({ tab: "ALL", type: "ALL" })
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-5 w-full">
      {/* 1. Breadcrumbs & Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Breadcrumbs & Titles */}
        <div className="space-y-1.5">
          {/* Breadcrumb navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link
              href="/dashboard"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <Link
              href="/reception"
              className="hover:text-foreground transition-colors"
            >
              Bàn tiếp đón
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="font-medium text-foreground">Lịch hẹn</span>
          </nav>

          {/* Header Titles */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Lịch hẹn
            </h1>
            <p className="text-sm text-secondary-foreground">
              Danh sách quản lý lịch hẹn khám bệnh và điều phối tiếp nhận
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div>
          <AppointmentHeaderActions
            onOpenCreateAppointment={handleOpenCreate}
            onOpenFindPatient={() => setIsPatientSearchOpen(true)}
            onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
          />
        </div>
      </div>

      {/* 2. Compact Operational Counters Strip (Height 76px) */}
      <AppointmentCountersStrip
        counters={counters}
        isLoading={isLoadingCounters}
        onFilterStatus={handleCounterFilter}
        activeStatusKey={activeTab}
      />

      {/* 3. Error state */}
      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 text-xs text-destructive">
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
            selectedType={selectedType}
            onTypeChange={(t) => updateUrlParams({ type: t })}
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
        initialEnterpriseId={enterpriseIdParam}
        initialBatchId={batchIdParam}
        initialEmployeeCode={employeeCodeParam}
        initialType={enterpriseIdParam ? "ENTERPRISE" : "INDIVIDUAL"}
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
