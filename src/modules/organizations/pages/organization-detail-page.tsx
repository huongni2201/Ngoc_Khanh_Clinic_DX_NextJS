"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw, ArrowLeft } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { ScreenLayout, ScreenLoadingSkeleton } from "@/shared/ui"
import { useOrganization } from "../hooks/use-organizations"
import { OrganizationDetailHeader } from "../components/organization-detail-header"
import { OrganizationSummaryStrip } from "../components/organization-summary-strip"
import { OrganizationTabs, type OrganizationTabType } from "../components/organization-tabs"
import { OrganizationInfoCard } from "../components/organization-info-card"
import { OrganizationHealthExaminationBatchesTab } from "../components/organization-health-examination-batches-tab"
import { EditOrganizationDialog } from "../components/edit-organization-dialog"
import { CreateHealthExaminationBatchDialog } from "../components/create-health-examination-batch-dialog"

interface OrganizationDetailPageProps {
  organizationId: string
}

export function OrganizationDetailPage({
  organizationId,
}: OrganizationDetailPageProps) {
  const [activeTab, setActiveTab] = React.useState<OrganizationTabType>("info")
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isCreateBatchDialogOpen, setIsCreateBatchDialogOpen] =
    React.useState(false)

  const {
    data: organization,
    isLoading,
    isError,
    refetch,
  } = useOrganization(organizationId)

  // Loading skeleton state matching screen layout exactly
  if (isLoading) {
    return <ScreenLoadingSkeleton variant="detail" />
  }

  // Error state
  if (isError || !organization) {
    return (
      <ScreenLayout data-slot="organization-detail-error" className="items-center justify-center py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Không tìm thấy hoặc không thể tải dữ liệu đơn vị
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mb-6">
          Mã đơn vị hoặc định danh &quot;{organizationId}&quot; không tồn tại hoặc đã xảy ra lỗi kết nối mạng.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/organizations">
            <Button variant="outline" size="sm" className="text-xs h-9">
              <ArrowLeft className="size-3.5 mr-1.5" />
              Về danh sách đơn vị
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
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout data-slot="organization-detail-page" className="gap-6">
      {/* 1. Breadcrumbs, Titles, Status Badge & Actions */}
      <OrganizationDetailHeader
        organization={organization}
        onEditClick={() => setIsEditDialogOpen(true)}
        onCreateBatchClick={() => setIsCreateBatchDialogOpen(true)}
      />

      {/* 2. 4-column Summary Strip */}
      <OrganizationSummaryStrip organization={organization} />

      {/* 3. Tab Navigation */}
      <OrganizationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 4. Tab Content */}
      <div className="pt-1">
        {activeTab === "info" && (
          <OrganizationInfoCard organization={organization} />
        )}

        {activeTab === "batches" && (
          <OrganizationHealthExaminationBatchesTab
            organizationId={organization.id}
            onCreateBatchClick={() => setIsCreateBatchDialogOpen(true)}
          />
        )}
      </div>

      {/* 5. Edit Organization Modal Dialog */}
      <EditOrganizationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        organization={organization}
      />

      {/* 6. Create Exam Batch Placeholder Modal */}
      <CreateHealthExaminationBatchDialog
        open={isCreateBatchDialogOpen}
        onOpenChange={setIsCreateBatchDialogOpen}
        organization={organization}
      />
    </ScreenLayout>
  )
}

