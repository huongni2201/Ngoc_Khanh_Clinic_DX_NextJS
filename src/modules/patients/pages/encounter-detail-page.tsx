"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Home,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useEncounterDetail } from "../hooks/use-encounter"
import { EncounterHeaderCard } from "../components/encounter/encounter-header-card"
import {
  EncounterTabsNav,
  EncounterTabKey,
} from "../components/encounter/encounter-tabs-nav"
import { EncounterSummaryView } from "../components/encounter/encounter-summary-view"
import { EncounterDiagnosisView } from "../components/encounter/encounter-diagnosis-view"
import { EncounterPrescriptionView } from "../components/encounter/encounter-prescription-view"
import { EncounterLabOrdersView } from "../components/encounter/encounter-lab-orders-view"
import { EncounterLabDetailCBCView } from "../components/encounter/encounter-lab-detail-cbc-view"
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

  const handleBackToLabOrders = () => {
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
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
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
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="size-3.5" />
          <span className="sr-only">Trang chủ</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link href="/patients" className="hover:text-foreground transition-colors">
          Bệnh nhân
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link
          href={`/patients/${patientId}`}
          className="hover:text-foreground transition-colors"
        >
          {data.patient.fullName}
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="font-medium text-foreground">Lượt khám {encounterId}</span>
        {subView === "cbc" && (
          <>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <button
              type="button"
              onClick={handleBackToLabOrders}
              className="hover:text-foreground transition-colors"
            >
              Cận lâm sàng
            </button>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="font-semibold text-primary">Công thức máu (CBC)</span>
          </>
        )}
        {subView === "xray" && (
          <>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <button
              type="button"
              onClick={handleBackToLabOrders}
              className="hover:text-foreground transition-colors"
            >
              Cận lâm sàng
            </button>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="font-semibold text-primary">X-quang ngực thẳng</span>
          </>
        )}
      </nav>

      {/* Main Page Title Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getPageTitle()}
        </h1>
      </div>

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
          <EncounterLabDetailCBCView
            data={data}
            onBack={handleBackToLabOrders}
          />
        ) : subView === "xray" ? (
          <EncounterImagingDetailXRayView
            data={data}
            onBack={handleBackToLabOrders}
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
          <EncounterLabOrdersView
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
