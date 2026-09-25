"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PageHeader, ScreenLayout } from "@/shared/ui"
import { Button } from "@/components/ui/button"
import { RefreshCw, Filter, ChevronRight } from "@/shared/ui/product-icon"
import { DoctorCountersStrip } from "../components/doctor-counters-strip"
import { DoctorFilterToolbar } from "../components/doctor-filter-toolbar"
import { DoctorEncounterTable } from "../components/doctor-encounter-table"
import { DoctorQuickViewSheet } from "../components/doctor-quick-view-sheet"
import { DoctorAdvancedFilterDialog } from "../components/doctor-advanced-filter-dialog"
import {
  useDoctorWorklist,
  useDoctorCounters,
  useDoctorNextAction,
  useStartDoctorEncounter,
} from "../hooks/use-doctor-worklist"
import { DoctorEncounter, DoctorEncounterStatus } from "../types"
import { cn } from "@/lib/utils"

export function DoctorWorklistPage() {
  const router = useRouter()

  // Filter & Search State
  const [searchTerm, setSearchTerm] = React.useState<string>("")
  const [selectedRoom, setSelectedRoom] = React.useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = React.useState<DoctorEncounterStatus | "ALL">("ALL")
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>("Của tôi")
  const [selectedDate, setSelectedDate] = React.useState<string>("25/09/2026")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const pageSize = 8

  // Advanced Filter Modal State
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL")
  const [examTypeFilter, setExamTypeFilter] = React.useState<string>("ALL")
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState<boolean>(false)

  // Dialog & Sheet States
  const [selectedEncounter, setSelectedEncounter] = React.useState<DoctorEncounter | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false)

  // Server state via TanStack Query
  const {
    data: worklistData,
    isLoading: isLoadingWorklist,
    refetch: refetchWorklist,
  } = useDoctorWorklist({
    search: searchTerm,
    room: selectedRoom,
    status: selectedStatus,
    doctor: selectedDoctor,
    date: selectedDate,
    page: currentPage,
    pageSize,
    sortDirection,
    priority: priorityFilter,
    examType: examTypeFilter,
  })

  const {
    data: countersData,
    isLoading: isLoadingCounters,
    refetch: refetchCounters,
  } = useDoctorCounters()

  const {
    data: nextAction,
    refetch: refetchNextAction,
  } = useDoctorNextAction(selectedDoctor)

  const startEncounterMutation = useStartDoctorEncounter()

  const encounters = worklistData?.items ?? []
  const totalItems = worklistData?.total ?? 43
  const totalPages = worklistData?.totalPages ?? 6

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refetchWorklist(), refetchCounters(), refetchNextAction()])
    setTimeout(() => {
      setIsRefreshing(false)
    }, 400)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedRoom("ALL")
    setSelectedStatus("ALL")
    setSelectedDoctor("Của tôi")
    setSelectedDate("25/09/2026")
    setPriorityFilter("ALL")
    setExamTypeFilter("ALL")
    setCurrentPage(1)
  }

  // Header Contextual Action: "Tiếp tục lượt đang khám" hoặc "Khám bệnh nhân tiếp theo"
  const handleNextAction = async () => {
    if (!nextAction || nextAction.actionType === "NONE" || !nextAction.encounter) {
      return
    }
    const encounter = nextAction.encounter
    if (nextAction.actionType === "NEXT") {
      await startEncounterMutation.mutateAsync(encounter.id)
    }
    const tabParam = encounter.status === "WAITING_CLS" ? "?tab=lab" : ""
    router.push(`/patients/${encounter.patientId}/encounters/${encounter.id}${tabParam}`)
  }

  // Row Action Handlers: Navigate straight to Encounter Detail Workspace
  const handleOpenEncounter = async (encounter: DoctorEncounter) => {
    if (encounter.status === "WAITING_EXAM") {
      await startEncounterMutation.mutateAsync(encounter.id)
    }
    const tabParam = encounter.status === "WAITING_CLS" ? "?tab=lab" : ""
    router.push(`/patients/${encounter.patientId}/encounters/${encounter.id}${tabParam}`)
  }

  const handleQuickView = (encounter: DoctorEncounter) => {
    setSelectedEncounter(encounter)
    setIsQuickViewOpen(true)
  }

  const handleToggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const handleStatusFilterFromCard = (status: DoctorEncounterStatus | "ALL") => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }


  return (
    <ScreenLayout data-slot="doctor-worklist-page">
      {/* PAGE HEADER */}
      <PageHeader
        breadcrumbs={[
          { label: "Bác sĩ", href: "/doctor" },
          { label: "Danh sách lượt khám" },
        ]}
        title="Danh sách lượt khám"
        description="Theo dõi bệnh nhân đang chờ, đang khám và tiến độ xử lý trong ngày."
        actions={
          <div className="flex items-center gap-2">
            {/* Secondary Action: Làm mới */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-9 gap-1.5 border-border bg-card text-xs font-medium text-foreground hover:bg-hover cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
              <span>Làm mới</span>
            </Button>

            {/* Secondary Action: Bộ lọc nâng cao */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className="h-9 gap-1.5 border-border bg-card text-xs font-medium text-foreground hover:bg-hover cursor-pointer"
            >
              <Filter className="size-3.5 text-secondary-foreground" />
              <span>Bộ lọc nâng cao</span>
            </Button>

            {/* Primary Action: Tiếp tục khám / Khám bệnh nhân tiếp theo */}
            <Button
              type="button"
              size="sm"
              onClick={handleNextAction}
              disabled={!nextAction || nextAction.actionType === "NONE"}
              title={
                nextAction?.actionType === "CONTINUE"
                  ? `Tiếp tục khám: ${nextAction.encounter?.patientName} (${nextAction.encounter?.encounterCode})`
                  : nextAction?.actionType === "NEXT"
                  ? `Khám tiếp theo: ${nextAction.encounter?.patientName} (${nextAction.encounter?.encounterCode})`
                  : "Không có lượt khám chờ tiếp theo"
              }
              className="h-9 gap-1.5 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
              <span>
                {nextAction?.actionType === "CONTINUE"
                  ? "Tiếp tục lượt đang khám"
                  : "Khám bệnh nhân tiếp theo"}
              </span>
            </Button>
          </div>
        }
      />

      {/* DAILY WORKLOAD SUMMARY (5 compact status cards) */}
      <DoctorCountersStrip
        counters={countersData}
        isLoading={isLoadingCounters}
        activeStatus={selectedStatus}
        onSelectStatus={handleStatusFilterFromCard}
      />

      {/* FILTER TOOLBAR */}
      <DoctorFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setCurrentPage(1)
        }}
        room={selectedRoom}
        onRoomChange={(val) => {
          setSelectedRoom(val)
          setCurrentPage(1)
        }}
        status={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val)
          setCurrentPage(1)
        }}
        doctor={selectedDoctor}
        onDoctorChange={(val) => {
          setSelectedDoctor(val)
          setCurrentPage(1)
        }}
        date={selectedDate}
        onDateChange={setSelectedDate}
        onResetFilters={handleResetFilters}
      />

      {/* OPERATIONAL ENCOUNTERS TABLE */}
      <DoctorEncounterTable
        encounters={encounters}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoadingWorklist}
        sortDirection={sortDirection}
        onToggleSort={handleToggleSort}
        onOpenEncounter={handleOpenEncounter}
        onQuickView={handleQuickView}
        onResetFilters={handleResetFilters}
      />

      {/* DRAWER 01: Xem nhanh thông tin bệnh nhân */}
      <DoctorQuickViewSheet
        encounter={selectedEncounter}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        onOpenEncounter={handleOpenEncounter}
      />

      {/* MODAL 02: Bộ lọc nâng cao */}
      <DoctorAdvancedFilterDialog
        open={isAdvancedFilterOpen}
        onOpenChange={setIsAdvancedFilterOpen}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        examType={examTypeFilter}
        onExamTypeChange={setExamTypeFilter}
        onApply={() => {
          refetchWorklist()
          setCurrentPage(1)
        }}
        onReset={() => {
          setPriorityFilter("ALL")
          setExamTypeFilter("ALL")
          refetchWorklist()
        }}
      />
    </ScreenLayout>
  )
}
