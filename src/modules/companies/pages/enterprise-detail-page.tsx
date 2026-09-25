"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw, ArrowLeft } from "@/shared/ui/product-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useEnterprise } from "../hooks/use-enterprises"
import { EnterpriseDetailHeader } from "../components/enterprise-detail-header"
import { EnterpriseSummaryStrip } from "../components/enterprise-summary-strip"
import { EnterpriseTabs, type EnterpriseTabType } from "../components/enterprise-tabs"
import { EnterpriseInfoCard } from "../components/enterprise-info-card"
import { EnterpriseHealthExaminationBatchesTab } from "../components/enterprise-health-examination-batches-tab"
import { EditEnterpriseDialog } from "../components/edit-enterprise-dialog"
import { CreateHealthExaminationBatchDialog } from "../components/create-health-examination-batch-dialog"

interface EnterpriseDetailPageProps {
  enterpriseId: string
}

export function EnterpriseDetailPage({
  enterpriseId,
}: EnterpriseDetailPageProps) {
  const [activeTab, setActiveTab] = React.useState<EnterpriseTabType>("info")
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isCreateBatchDialogOpen, setIsCreateBatchDialogOpen] =
    React.useState(false)

  const {
    data: enterprise,
    isLoading,
    isError,
    refetch,
  } = useEnterprise(enterpriseId)

  // Loading skeleton state matching screen layout exactly
  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-52" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-8 w-64 sm:w-80" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-3 pt-1 sm:pt-0">
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>

        {/* Summary Strip Skeleton */}
        <div className="rounded-lg border border-border/80 bg-card p-5 ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                <Skeleton className="size-10 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="border-b border-border/80 pb-3 flex gap-8">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Info Card Skeleton */}
        <div className="rounded-lg border border-border/80 bg-card p-6 sm:p-8  space-y-5">
          <Skeleton className="h-6 w-48 mb-6" />
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-border/40 gap-2 sm:gap-4"
            >
              <Skeleton className="h-4 w-40 sm:w-56 shrink-0" />
              <Skeleton className="h-4 w-60 sm:w-96" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !enterprise) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Không tìm thấy hoặc không thể tải dữ liệu doanh nghiệp
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mb-6">
          Mã doanh nghiệp hoặc định danh &quot;{enterpriseId}&quot; không tồn tại hoặc đã xảy ra lỗi kết nối mạng.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/enterprises">
            <Button variant="outline" size="sm" className="text-xs h-9">
              <ArrowLeft className="size-3.5 mr-1.5" />
              Về danh sách doanh nghiệp
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-9 "
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Breadcrumbs, Titles, Status Badge & Actions */}
      <EnterpriseDetailHeader
        enterprise={enterprise}
        onEditClick={() => setIsEditDialogOpen(true)}
        onCreateBatchClick={() => setIsCreateBatchDialogOpen(true)}
      />

      {/* 2. 4-column Summary Strip */}
      <EnterpriseSummaryStrip enterprise={enterprise} />

      {/* 3. Tab Navigation */}
      <EnterpriseTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 4. Tab Content */}
      <div className="pt-1">
        {activeTab === "info" && (
          <EnterpriseInfoCard enterprise={enterprise} />
        )}

        {activeTab === "batches" && (
          <EnterpriseHealthExaminationBatchesTab
            enterpriseId={enterprise.id}
            onCreateBatchClick={() => setIsCreateBatchDialogOpen(true)}
          />
        )}
      </div>

      {/* 5. Edit Enterprise Modal Dialog */}
      <EditEnterpriseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        enterprise={enterprise}
      />

      {/* 6. Create Exam Batch Placeholder Modal */}
      <CreateHealthExaminationBatchDialog
        open={isCreateBatchDialogOpen}
        onOpenChange={setIsCreateBatchDialogOpen}
        enterprise={enterprise}
      />
    </div>
  )
}
