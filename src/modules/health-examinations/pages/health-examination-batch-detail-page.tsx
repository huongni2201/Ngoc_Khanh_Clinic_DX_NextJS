"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PageHeader, ScreenLayout } from "@/shared/ui"
import { HealthExaminationBatchTabs, HealthExaminationBatchTabType } from "../components/health-examination-batch-tabs"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"

interface HealthExaminationBatchDetailPageProps {
  organizationId: string
  batchId: string
}

export function HealthExaminationBatchDetailPage({
  organizationId,
  batchId,
}: HealthExaminationBatchDetailPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const tabParam = searchParams?.get("tab")
  const [localTab, setLocalTab] = React.useState<HealthExaminationBatchTabType | null>(null)

  const activeTab: HealthExaminationBatchTabType =
    localTab ??
    (tabParam === "details" || tabParam === "examination"
      ? "examination"
      : tabParam === "report"
      ? "report"
      : "participants")

  const handleTabChange = (tab: HealthExaminationBatchTabType) => {
    setLocalTab(tab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (tab === "participants") {
      params.delete("tab")
    } else if (tab === "examination") {
      params.set("tab", "details")
    } else if (tab === "report") {
      params.set("tab", "report")
    }
    const query = params.toString() ? `?${params.toString()}` : ""
    if (router && typeof router.replace === "function") {
      router.replace(`${pathname}${query}`, { scroll: false })
    }
  }

  const subtitle =
    activeTab === "participants"
      ? "Danh sách nhân viên trong đợt khám"
      : "API cho phần này chưa được cung cấp"

  return (
    <ScreenLayout data-slot="health-examination-batch-detail-page" className="gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Đơn vị", href: `/organizations/${organizationId}` },
          { label: "Đợt khám" },
          { label: batchId },
        ]}
        title={`Đợt khám ${batchId}`}
        description={subtitle}
      />

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




