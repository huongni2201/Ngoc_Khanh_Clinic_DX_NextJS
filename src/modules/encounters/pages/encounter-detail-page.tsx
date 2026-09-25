"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, AlertCircle } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/shared/ui"
import { useEncounterDetail } from "../hooks/use-encounter"
import { EncounterHeaderCard } from "../components/encounter/encounter-header-card"
import {
  EncounterTabsNav,
  EncounterTabKey,
} from "../components/encounter/encounter-tabs-nav"
import { EncounterSummaryView } from "../components/encounter/encounter-summary-view"
import { EncounterDiagnosisView } from "../components/encounter/encounter-diagnosis-view"
import { EncounterPrescriptionView } from "../components/encounter/encounter-prescription-view"
import { EncounterDiagnosticOrdersView } from "../components/encounter/encounter-diagnostic-orders-view"
import { EncounterLaboratoryDetailView } from "../components/encounter/encounter-lab-detail-cbc-view"
import { EncounterImagingDetailXRayView } from "../components/encounter/encounter-imaging-detail-xray-view"
import { EncounterDocumentsView } from "../components/encounter/encounter-documents-view"

export function EncounterDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const patientId = (params?.id as string) || "pat-mock-01"
  const encounterId = (params?.encounterId as string) || "LK000456"

  const activeTab = (searchParams.get("tab") as EncounterTabKey) || "summary"
  const subView = searchParams.get("view") || null
  const isPrintModalOpen = searchParams.get("modal") === "print"

  const { data, isLoading, isError, error } = useEncounterDetail(patientId, encounterId)

  const handleTabChange = (tab: EncounterTabKey) => {
    const newParams = new URLSearchParams()
    newParams.set("tab", tab)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  const handleOpenLabDetail = (key: string) => {
    const newParams = new URLSearchParams()
    newParams.set("tab", "lab")
    newParams.set("view", key)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  const handleBackToDiagnosticOrders = () => {
    const newParams = new URLSearchParams()
    newParams.set("tab", "lab")
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  const handleTogglePrintModal = (open: boolean) => {
    const newParams = new URLSearchParams()
    newParams.set("tab", "prescriptions")
    if (open) {
      newParams.set("modal", "print")
    }
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-44 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/patients/${patientId}`)}
          className="text-xs"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Quay lại hồ sơ bệnh nhân
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Không tìm thấy dữ liệu lượt khám."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getPageTitle = () => {
    if (subView === "cbc") {
      return `Chi tiết kết quả xét nghiệm – Công thức máu (CBC)`
    }
    if (subView === "xray") {
      return `Chi tiết kết quả chẩn đoán hình ảnh – X-quang ngực thẳng`
    }
    switch (activeTab) {
      case "summary":
        return `Chi tiết lượt khám ${encounterId} – Tóm tắt`
      case "diagnosis":
        return `Chi tiết lượt khám ${encounterId} – Chẩn đoán`
      case "prescriptions":
        return `Chi tiết lượt khám ${encounterId} – Đơn thuốc`
      case "lab":
        return `Chi tiết lượt khám ${encounterId} – Kết quả cận lâm sàng`
      case "documents":
        return `Chi tiết lượt khám ${encounterId} – Tài liệu`
      default:
        return `Chi tiết lượt khám ${encounterId}`
    }
  }

  return (
    <div className="space-y-6 flex-1 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Bệnh nhân", href: "/patients" },
          { label: data.patient.fullName, href: `/patients/${patientId}` },
          ...(subView
            ? [
                { label: `Lượt khám ${encounterId}`, href: `?tab=lab` },
                {
                  label:
                    subView === "cbc"
                      ? "Công thức máu (CBC)"
                      : "X-quang ngực thẳng",
                },
              ]
            : [{ label: `Lượt khám ${encounterId}` }]),
        ]}
        title={getPageTitle()}
        description={`Bệnh nhân ${data.patient.fullName}`}
      />

      {/* Persistent Encounter Header Summary Card */}
      <EncounterHeaderCard
        data={data}
        onEditClick={() => alert("Chỉnh sửa thông tin hành chính lượt khám...")}
      />

      {/* Tab Navigation (Hidden when inside a deep detail view like CBC or X-Ray) */}
      {!subView && (
        <EncounterTabsNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* Active Tab View Rendering */}
      <div>
        {subView === "cbc" ? (
          <EncounterLaboratoryDetailView
            data={data}
            onBack={handleBackToDiagnosticOrders}
          />
        ) : subView === "xray" ? (
          <EncounterImagingDetailXRayView
            data={data}
            onBack={handleBackToDiagnosticOrders}
          />
        ) : activeTab === "summary" ? (
          <EncounterSummaryView
            data={data}
            onNavigateTab={(tab) => handleTabChange(tab)}
          />
        ) : activeTab === "diagnosis" ? (
          <EncounterDiagnosisView data={data} />
        ) : activeTab === "prescriptions" ? (
          <EncounterPrescriptionView
            data={data}
            isPrintModalOpen={isPrintModalOpen}
            onTogglePrintModal={handleTogglePrintModal}
          />
        ) : activeTab === "lab" ? (
                <EncounterDiagnosticOrdersView
            data={data}
            onViewDetail={handleOpenLabDetail}
          />
        ) : activeTab === "documents" ? (
          <EncounterDocumentsView data={data} />
        ) : null}
      </div>
    </div>
  )
}
