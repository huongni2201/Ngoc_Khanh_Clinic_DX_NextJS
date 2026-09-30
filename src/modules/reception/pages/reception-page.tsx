"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { PageHeader, ScreenLayout } from "@/shared/ui"
import { ReceptionHeaderActions } from "../components/reception-header-actions"
import { ReceptionCountersStrip } from "../components/reception-counters-strip"
import { ReceptionPatientTable } from "../components/reception-patient-table"
import {
  PatientCheckInDialog,
} from "../components/patient-check-in-dialog"
import { AssignRoomDialog } from "../components/assign-room-dialog"
import { PrintExaminationDialog } from "../components/print-examination-dialog"
import { EncounterDetailDialog } from "../components/encounter-detail-dialog"
import { TodayAppointmentsDialog } from "../components/today-appointments-dialog"
import {
  PatientSearchDialog,
  CreatePatientDialog,
  Patient,
} from "@/modules/patients"
import {
  useReceptionWorklist,
  useReceptionCounters,
  useClinicRooms,
} from "../hooks/use-reception"
import {
  useAppointments,
  type Appointment,
} from "@/modules/appointments"
import { Encounter, ReceptionTab } from "../types"
import { PaymentDialog } from "@/modules/billing"

export function ReceptionPage() {
  const searchParams = useSearchParams()

  // Query parameters & local filter state
  const [activeTab, setActiveTab] = React.useState<ReceptionTab>("ALL")
  const [searchTerm, setSearchTerm] = React.useState<string>("")
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>("ALL")

  // Server state via TanStack Query
  const {
    data: encounters = [],
    isLoading: isLoadingWorklist,
    isError: isErrorWorklist,
    error: worklistError,
    refetch: refetchWorklist,
  } = useReceptionWorklist({
    tab: activeTab,
    search: searchTerm,
    roomId: selectedRoomId !== "ALL" ? selectedRoomId : undefined,
  })

  const {
    data: counters,
    isLoading: isLoadingCounters,
    refetch: refetchCounters,
  } = useReceptionCounters()

  const { data: rooms = [] } = useClinicRooms()

  // Appointments synchronization
  const {
    data: todayAppointments = [],
    isError: isTodayAppointmentsError,
  } = useAppointments({ tab: "TODAY" })

  const pendingAppointmentsCount = React.useMemo(() => {
    return todayAppointments.filter(
      (a) =>
        a.status === "BOOKED" ||
        a.status === "CONFIRMED" ||
        a.status === "ARRIVED"
    ).length
  }, [todayAppointments])
  const todayPendingAppointmentsCount = isTodayAppointmentsError
    ? undefined
    : pendingAppointmentsCount

  // Dialog State Management
  const [isSearchPatientOpen, setIsSearchPatientOpen] = React.useState(false)
  const [isCreatePatientOpen, setIsCreatePatientOpen] = React.useState(false)
  const [isReceivePatientOpen, setIsReceivePatientOpen] = React.useState(false)
  const [isAssignRoomOpen, setIsAssignRoomOpen] = React.useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)
  const [isPrintFormOpen, setIsPrintFormOpen] = React.useState(false)
  const [isEncounterDetailOpen, setIsEncounterDetailOpen] = React.useState(false)
  const [isTodayAppointmentsOpen, setIsTodayAppointmentsOpen] = React.useState(false)

  // Target context for dialogs
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null)
  const [selectedEncounter, setSelectedEncounter] = React.useState<Encounter | null>(null)
  const [checkInUnavailableError, setCheckInUnavailableError] = React.useState<string | null>(null)

  // Handlers for Header Actions
  const handleOpenReceiveWithCleanState = () => {
    setSelectedPatient(null)
    setSelectedEncounter(null)
    setCheckInUnavailableError(null)
    setIsReceivePatientOpen(true)
  }

  const handleOpenFindPatient = () => {
    setIsSearchPatientOpen(true)
  }

  const handleOpenCreatePatient = () => {
    setIsCreatePatientOpen(true)
  }

  // Handlers for Row Actions
  const handleRowReceive = (encounter: Encounter) => {
    setSelectedPatient(null)
    setSelectedEncounter(encounter)
    setIsReceivePatientOpen(true)
  }

  const handleRowAssignRoom = (encounter: Encounter) => {
    setSelectedEncounter(encounter)
    setIsAssignRoomOpen(true)
  }

  const handleRowViewEncounter = (encounter: Encounter) => {
    setSelectedEncounter(encounter)
    setIsEncounterDetailOpen(true)
  }

  const handleRowPayment = (encounter: Encounter) => {
    setSelectedEncounter(encounter)
    setIsPaymentOpen(true)
  }

  const handleRowPrint = (encounter: Encounter) => {
    setSelectedEncounter(encounter)
    setIsPrintFormOpen(true)
  }

  // Synchronize incoming query params (e.g. from /appointments?appointmentId=...)
  const incomingAppointmentId = searchParams?.get("appointmentId")
  const incomingCheckinCode = searchParams?.get("checkinCode")
  const appointmentCheckInError =
    incomingAppointmentId || incomingCheckinCode
      ? "Backend chưa cung cấp API tra cứu hồ sơ bệnh nhân từ lịch hẹn."
      : checkInUnavailableError

  const handleCheckInFromAppointmentList = (apt: Appointment) => {
    void apt
    setCheckInUnavailableError(
      "Backend chưa cung cấp API tra cứu hồ sơ bệnh nhân từ lịch hẹn."
    )
  }

  // Cross-dialog Transitions
  const handleSelectPatientFromSearch = (patient: Patient) => {
    setSelectedPatient(patient)
    setSelectedEncounter(null)
    setIsReceivePatientOpen(true)
  }

  const handlePatientCreated = (newPatient: Patient) => {
    setSelectedPatient(newPatient)
    setSelectedEncounter(null)
    setIsReceivePatientOpen(true)
  }

  const handleReceptionSuccess = async (
    newEncounter: Encounter,
    shouldPrint: boolean
  ) => {
    refetchWorklist()
    refetchCounters()
    if (shouldPrint) {
      setSelectedEncounter(newEncounter)
      setIsPrintFormOpen(true)
    }
  }

  // Counter filter click
  const handleCounterFilter = (statusKey: string) => {
    if (statusKey === "WAITING_CHECK_IN") {
      setActiveTab("WAITING_CHECK_IN")
    } else if (statusKey === "IN_EXAMINATION") {
      setActiveTab("IN_EXAMINATION")
    } else if (statusKey === "WAITING_PAYMENT") {
      setActiveTab("WAITING_PAYMENT")
    } else if (statusKey === "WAITING_DIAGNOSTIC_RESULTS") {
      setActiveTab("WAITING_DIAGNOSTIC_RESULTS")
    } else if (statusKey === "COMPLETED") {
      setActiveTab("COMPLETED")
    } else {
      setActiveTab("ALL")
    }
  }

  return (
    <ScreenLayout data-slot="reception-page">
      <PageHeader
        breadcrumbs={[{ label: "Bàn tiếp đón" }, { label: "Lễ tân" }]}
        title="Lễ tân"
        description="Danh sách tiếp nhận bệnh nhân và điều phối phòng khám hôm nay"
        actions={
          <ReceptionHeaderActions
            onOpenReceivePatient={handleOpenReceiveWithCleanState}
            onOpenFindPatient={handleOpenFindPatient}
            onOpenCreatePatient={handleOpenCreatePatient}
            onOpenTodayAppointments={() => {
              setCheckInUnavailableError(null)
              setIsTodayAppointmentsOpen(true)
            }}
            todayAppointmentsCount={todayPendingAppointmentsCount}
          />
        }
      />

      {/* Compact Operational Counters Strip (Height 72-88px) */}
      <ReceptionCountersStrip
        counters={counters}
        isLoading={isLoadingCounters}
        onFilterStatus={handleCounterFilter}
        activeStatusKey={activeTab}
      />

      {/* Error state if worklist fetch fails */}
      {isErrorWorklist && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {worklistError instanceof Error
                ? worklistError.message
                : "Có lỗi xảy ra khi tải danh sách bệnh nhân hôm nay"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchWorklist()}
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10"
          >
            <RefreshCw className="size-3 mr-1" />
            Tải lại
          </Button>
        </div>
      )}

      {appointmentCheckInError && !isTodayAppointmentsOpen && (
        <p role="alert" className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
          {appointmentCheckInError}
        </p>
      )}

      {/* Main Work Area: Bệnh nhân hôm nay */}
      <ReceptionPatientTable
        encounters={encounters}
        isLoading={isLoadingWorklist}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onRoomChange={setSelectedRoomId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReceivePatient={handleRowReceive}
        onAssignRoom={handleRowAssignRoom}
        onViewEncounter={handleRowViewEncounter}
        onProcessPayment={handleRowPayment}
        onPrintForm={handleRowPrint}
      />

      {/* Screen 02: Tìm bệnh nhân */}
      <PatientSearchDialog
        open={isSearchPatientOpen}
        onOpenChange={setIsSearchPatientOpen}
        onSelectPatient={handleSelectPatientFromSearch}
        onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
      />

      {/* Screen 03: Tạo bệnh nhân mới */}
      <CreatePatientDialog
        open={isCreatePatientOpen}
        onOpenChange={setIsCreatePatientOpen}
        onSuccess={handlePatientCreated}
      />

      {/* Screen 04: Tiếp nhận bệnh nhân / Tạo Encounter */}
      <PatientCheckInDialog
        open={isReceivePatientOpen}
        onOpenChange={setIsReceivePatientOpen}
        initialPatient={selectedPatient}
        initialEncounter={selectedEncounter}
        onOpenPatientSearch={() => setIsSearchPatientOpen(true)}
        onSuccess={handleReceptionSuccess}
      />

      {/* Lịch hẹn hôm nay Dialog */}
      <TodayAppointmentsDialog
        open={isTodayAppointmentsOpen}
        onOpenChange={setIsTodayAppointmentsOpen}
        onCheckInAppointment={handleCheckInFromAppointmentList}
        checkInError={appointmentCheckInError}
      />

      {/* Screen 05: Phân phòng / Bác sĩ */}
      <AssignRoomDialog
        open={isAssignRoomOpen}
        onOpenChange={setIsAssignRoomOpen}
        encounter={selectedEncounter}
        onSuccess={() => {
          refetchWorklist()
          refetchCounters()
        }}
      />

      {/* Screen 06: Thu phí */}
      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        encounter={selectedEncounter}
        onPaid={() => {
          refetchWorklist()
          refetchCounters()
        }}
      />

      {/* Screen 07: In giấy khám bệnh */}
      <PrintExaminationDialog
        open={isPrintFormOpen}
        onOpenChange={setIsPrintFormOpen}
        encounter={selectedEncounter}
      />

      {/* Detail Inspector Dialog */}
      <EncounterDetailDialog
        open={isEncounterDetailOpen}
        onOpenChange={setIsEncounterDetailOpen}
        encounter={selectedEncounter}
        onAssignRoom={handleRowAssignRoom}
        onProcessPayment={handleRowPayment}
        onPrintForm={handleRowPrint}
      />
    </ScreenLayout>
  )
}

