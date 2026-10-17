"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, RefreshCw, ArrowLeft } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiClientError } from "@/shared/api/api-client"
import { ScreenLayout, ScreenLoadingSkeleton } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { useOrganizationPermissions } from "../hooks/use-organization-permissions"
import {
  useDeactivateOrganization,
  useOrganization,
  useReloadOrganization,
} from "../hooks/use-organizations"
import { OrganizationDetailHeader } from "../components/organization-detail-header"
import { OrganizationInfoCard } from "../components/organization-info-card"
import { OrganizationHealthExaminationAgreementsTab } from "../../agreements/components/organization-agreements-tab"
import { SessionsTab } from "../../agreements/components/session-tab/sessions-tab"
import { useAgreementPermissions } from "../../agreements/hooks/use-agreement-permissions"
import { OrganizationWorkTabs, type OrganizationWorkTab } from "../components/organization-work-tabs"
import { EditOrganizationDialog } from "../components/edit-organization-dialog"

interface OrganizationDetailPageProps {
  organizationId: string
}

export function OrganizationDetailPage({
  organizationId,
}: OrganizationDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Display only; the backend checks every request.
  const { canEdit, canDeactivate } = useOrganizationPermissions()
  const { sessions } = useAgreementPermissions()
  const requestedTab: OrganizationWorkTab =
    searchParams?.get("tab") === "sessions" ? "sessions" : "agreements"
  const activeTab: OrganizationWorkTab =
    requestedTab === "sessions" && !sessions.canRead ? "agreements" : requestedTab

  const handleTabChange = (tab: OrganizationWorkTab) => {
    // Each tab keeps its own filters; leaving the tab drops the ones of the tab it came from.
    const params = new URLSearchParams()
    if (tab === "sessions") params.set("tab", "sessions")
    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const {
    data: organization,
    isLoading,
    isError,
    refetch,
  } = useOrganization(organizationId)
  const deactivateMutation = useDeactivateOrganization(organizationId)
  const reloadMutation = useReloadOrganization(organizationId)
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false)
  const isDeactivateConflict =
    deactivateMutation.error instanceof ApiClientError && deactivateMutation.error.status === 409

  const handleDeactivate = async () => {
    if (!organization) return
    try {
      await deactivateMutation.mutateAsync(organization.rowVersion)
      toast.success(`Đã ngừng hoạt động đơn vị ${organization.name}.`)
      setIsDeactivateOpen(false)
      router.push("/organizations")
    } catch {
      // The mutation error is rendered in the dialog.
    }
  }

  // Reads the latest version after a 409; the deactivation is never resent automatically.
  const handleReloadAfterConflict = async () => {
    try {
      await reloadMutation.mutateAsync()
      deactivateMutation.reset()
    } catch {
      // The reload error is rendered in the dialog.
    }
  }

  const handleDeactivateOpenChange = (open: boolean) => {
    setIsDeactivateOpen(open)
    if (!open) {
      deactivateMutation.reset()
      reloadMutation.reset()
    }
  }

  // Loading skeleton state matching screen layout exactly
  if (isLoading) {
    return <ScreenLoadingSkeleton variant="workspace" />
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
          Định danh &quot;{organizationId}&quot; không tồn tại hoặc đã xảy ra lỗi kết nối mạng.
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
      {/* 1. Identity: name, status, tax code, address and actions */}
      <OrganizationDetailHeader
        organization={organization}
        onEditClick={canEdit ? () => setIsEditDialogOpen(true) : undefined}
        onDeactivateClick={canDeactivate ? () => setIsDeactivateOpen(true) : undefined}
        isDeactivating={deactivateMutation.isPending}
      />

      {/* 2. Work area: the agreements are the job, the organization details are reference */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Công việc của đơn vị" className="min-w-0 space-y-3">
          <OrganizationWorkTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            hiddenTabs={sessions.canRead ? [] : ["sessions"]}
          />
          {activeTab === "sessions" ? (
            <SessionsTab organizationId={organization.id} />
          ) : (
            <OrganizationHealthExaminationAgreementsTab
              organizationId={organization.id}
              organizationName={organization.name}
            />
          )}
        </section>
        <aside aria-label="Thông tin đơn vị" className="min-w-0 lg:sticky lg:top-0">
          <OrganizationInfoCard organization={organization} />
        </aside>
      </div>

      {/* 3. Deactivate confirmation */}
      {canDeactivate && (
        <Dialog open={isDeactivateOpen} onOpenChange={handleDeactivateOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ngừng hoạt động đơn vị</DialogTitle>
              <DialogDescription>
                Đơn vị “{organization.name}” sẽ không còn xuất hiện trong danh sách. Các thỏa thuận đã tạo
                vẫn được giữ lại.
              </DialogDescription>
            </DialogHeader>
            {deactivateMutation.error && (
              <div role="alert" className="space-y-2 text-xs text-destructive">
                <p>{deactivateMutation.error.message || "Không thể ngừng hoạt động đơn vị."}</p>
                {isDeactivateConflict && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReloadAfterConflict}
                    disabled={reloadMutation.isPending}
                  >
                    {reloadMutation.isPending ? "Đang tải..." : "Tải lại dữ liệu mới nhất"}
                  </Button>
                )}
              </div>
            )}
            {reloadMutation.error && (
              <p role="alert" className="text-xs text-destructive">
                {reloadMutation.error.message || "Không thể tải lại dữ liệu đơn vị."}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDeactivateOpenChange(false)}
                disabled={deactivateMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending ? "Đang ngừng..." : "Xác nhận ngừng hoạt động"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 4. Edit Organization Modal Dialog */}
      {canEdit && (
        <EditOrganizationDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          organization={organization}
        />
      )}

    </ScreenLayout>
  )
}

