"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PageHeader, ScreenLayout } from "@/shared/ui"
import { HealthExaminationBatchTabs, HealthExaminationBatchTabType } from "../components/health-examination-batch-tabs"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"
import { useHealthExaminationBatchDetail } from "../hooks/use-health-examination-batches"

interface HealthExaminationBatchDetailPageProps {
  organizationId: string
  batchId: string
}

export function HealthExaminationBatchDetailPage({
  organizationId,
  batchId,
}: HealthExaminationBatchDetailPageProps) {
  const {
    data: batch,
    isLoading,
    isError,
    error,
    refetch,
  } = useHealthExaminationBatchDetail(organizationId, batchId)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const tabParam = searchParams?.get("tab")
  const activeTab: HealthExaminationBatchTabType =
    tabParam === "details" || tabParam === "examination"
      ? "examination"
      : tabParam === "report"
      ? "report"
      : "participants"

  const handleTabChange = (tab: HealthExaminationBatchTabType) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (tab === "participants") {
      params.delete("tab")
    } else if (tab === "examination") {
      params.set("tab", "details")
    } else if (tab === "report") {
      params.set("tab", "report")
    }
    const query = params.toString() ? `?${params.toString()}` : ""
    router.push(`${pathname}${query}`, { scroll: false })
  }

  const subtitle =
    activeTab === "participants"
      ? "Danh sách người khám trong đợt"
      : "API cho phần này chưa được cung cấp"

  return (
    <ScreenLayout data-slot="health-examination-batch-detail-page" className="gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Đơn vị", href: `/organizations/${organizationId}` },
          { label: "Đợt khám" },
          { label: batch ? batch.code : batchId },
        ]}
        title={batch?.name || (isLoading ? "Đang tải đợt khám…" : "Đợt khám")}
        description={subtitle}
      />

      {isError && (
        <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p>{error instanceof Error ? error.message : "Không thể tải thông tin đợt khám."}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="font-medium text-primary underline underline-offset-4"
          >
            Thử lại
          </button>
        </div>
      )}

      <HealthExaminationBatchTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="pt-1">
        {activeTab === "participants" && (
          <ParticipantsTab
            batchId={batchId}
            organizationId={organizationId}
          />
        )}

        {(activeTab === "examination" || activeTab === "report") && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Chưa có API cho nội dung này.
            </p>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}




