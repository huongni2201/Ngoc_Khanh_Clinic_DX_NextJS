"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, ChevronRight, Plus, UserCheck, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataTablePagination } from "@/shared/ui/data-table-pagination"
import { PatientCountersStrip } from "../components/patient-counters-strip"
import { PatientToolbar } from "../components/patient-toolbar"
import { PatientTable } from "../components/patient-table"
import { CreatePatientDialog } from "../components/create-patient-dialog"
import { EditPatientDialog } from "../components/edit-patient-dialog"
import { ReceivePatientDialog } from "@/modules/reception"
import { useSearchPatients, usePatientCounters } from "../hooks/use-patients"
import { Patient, PatientAgeGroup, PatientGender } from "../types"

const PAGE_SIZE = 8

export function PatientsPage() {
  const router = useRouter()

  // Filters & Search state
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [genderFilter, setGenderFilter] = React.useState<PatientGender | "ALL">("ALL")
  const [ageGroupFilter, setAgeGroupFilter] = React.useState<PatientAgeGroup>("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false)
  const [selectedPatientForEdit, setSelectedPatientForEdit] = React.useState<Patient | null>(null)
  const [selectedPatientForReceive, setSelectedPatientForReceive] = React.useState<Patient | null>(null)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset page when filters change
  const handleGenderChange = (val: PatientGender | "ALL") => {
    setGenderFilter(val)
    setCurrentPage(1)
  }

  const handleAgeGroupChange = (val: PatientAgeGroup) => {
    setAgeGroupFilter(val)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
    setGenderFilter("ALL")
    setAgeGroupFilter("ALL")
    setCurrentPage(1)
  }

  // TanStack Query for patients
  const {
    data: allPatients = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchPatients(debouncedSearch, {
    gender: genderFilter,
    ageGroup: ageGroupFilter,
  })

  // Counters hook
  const { data: counters, isLoading: isCountersLoading } = usePatientCounters()

  // Pagination calculation
  const totalItems = allPatients.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const paginatedPatients = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return allPatients.slice(start, start + PAGE_SIZE)
  }, [allPatients, currentPage])

  // Selection handlers
  const handleSelectPatient = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const handleSelectAllCurrentPage = (selected: boolean) => {
    const currentPageIds = paginatedPatients.map((p) => p.id)
    if (selected) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
    }
  }

  // Row action handlers
  const handleViewPatient = (patient: Patient) => {
    router.push(`/patients/${patient.id}`)
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatientForEdit(patient)
    setIsEditOpen(true)
  }

  const handleReceivePatient = (patient: Patient) => {
    setSelectedPatientForReceive(patient)
    setIsReceiveOpen(true)
  }

  const handleOpenReceiveGeneral = () => {
    // If a patient is selected via checkbox, pick the first one
    if (selectedIds.length > 0) {
      const found = allPatients.find((p) => p.id === selectedIds[0])
      setSelectedPatientForReceive(found || null)
    } else {
      setSelectedPatientForReceive(null)
    }
    setIsReceiveOpen(true)
  }

  const hasActiveFilters =
    debouncedSearch.trim() !== "" ||
    genderFilter !== "ALL" ||
    ageGroupFilter !== "ALL"

  return (
    <div className="flex flex-col flex-1 gap-5 w-full" data-slot="patients-page">
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
            <span className="font-medium text-foreground">Bệnh nhân</span>
          </nav>

          {/* Header Titles */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Danh sách bệnh nhân
            </h1>
            <p className="text-sm text-secondary-foreground">
              Quản lý thông tin hồ sơ bệnh nhân của phòng khám.
            </p>
          </div>
        </div>

        {/* Right: Actions Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Secondary CTA: Tiếp nhận bệnh nhân */}
          <Button
            variant="outline"
            onClick={handleOpenReceiveGeneral}
            className="gap-2 h-10 rounded-lg border-border/80 hover:bg-hover text-foreground px-4 text-xs sm:text-sm font-medium shadow-2xs cursor-pointer"
          >
            <UserCheck className="size-4 stroke-[2]" />
            <span>Tiếp nhận bệnh nhân</span>
          </Button>

          {/* Primary CTA: Tạo bệnh nhân mới */}
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-4 text-xs sm:text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="size-4 stroke-[2]" />
            <span>Tạo bệnh nhân mới</span>
          </Button>
        </div>
      </div>

      {/* 2.5. Operational Counters Strip */}
      <PatientCountersStrip
        counters={counters}
        isLoading={isCountersLoading}
        activeGender={genderFilter}
        activeAgeGroup={ageGroupFilter}
        onFilterGender={handleGenderChange}
        onFilterAgeGroup={handleAgeGroupChange}
      />

      {/* 3. Toolbar: Search + Gender filter + Age group filter + Filter button */}
      <PatientToolbar
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        selectedGender={genderFilter}
        onGenderChange={handleGenderChange}
        selectedAgeGroup={ageGroupFilter}
        onAgeGroupChange={handleAgeGroupChange}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Error state if query fails */}
      {isError && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between text-xs">
            <span>
              {error instanceof Error
                ? error.message
                : "Không thể tải danh sách bệnh nhân. Vui lòng thử lại."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-7 text-xs font-semibold border-destructive/40"
            >
              <RefreshCw className="mr-1 size-3" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 5. Patient Data Table */}
      <PatientTable
        patients={paginatedPatients}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectPatient={handleSelectPatient}
        onSelectAll={handleSelectAllCurrentPage}
        onViewPatient={handleViewPatient}
        onEditPatient={handleEditPatient}
        onReceivePatient={handleReceivePatient}
        onCreatePatient={() => setIsCreateOpen(true)}
        onResetFilters={handleResetFilters}
        isFiltered={hasActiveFilters}
      />

      {/* 6. Pagination Footer */}
      {!isLoading && totalItems > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          entityName="bệnh nhân"
          showSinglePageNavigation={true}
          className="pt-1"
        />
      )}

      {/* 7. Dialogs */}
      <CreatePatientDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={(newPatient) => {
          refetch()
          // Optionally highlight newly created patient
          setSelectedIds([newPatient.id])
        }}
      />

      <EditPatientDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        patient={selectedPatientForEdit}
        onSuccess={() => {
          refetch()
        }}
      />

      <ReceivePatientDialog
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
        initialPatient={selectedPatientForReceive}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
