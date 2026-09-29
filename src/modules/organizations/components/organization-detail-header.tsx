"use client"

import { Add01Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"
import { OrganizationDetail } from "../types"

interface OrganizationDetailHeaderProps {
  organization: OrganizationDetail
  onEditClick: () => void
  onCreateBatchClick: () => void
  onDeactivateClick: () => void
  isDeactivating: boolean
}

export function OrganizationDetailHeader({
  organization,
  onEditClick,
  onCreateBatchClick,
  onDeactivateClick,
  isDeactivating,
}: OrganizationDetailHeaderProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động"
      case "INACTIVE":
        return "Ngừng hoạt động"
      default:
        return status
    }
  }

  return (
    <PageHeader
      breadcrumbs={[
        { label: "Đơn vị", href: "/organizations" },
        { label: organization.name },
      ]}
      title={organization.name}
      titleAccessory={
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
          <span
            className={`size-1.5 shrink-0 rounded-full ${
              organization.status === "ACTIVE" ? "bg-status-success" : "bg-muted-foreground"
            }`}
          />
          {getStatusLabel(organization.status)}
        </span>
      }
      description="Khách hàng đơn vị"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onEditClick}
          >
            <HugeiconsIcon icon={Edit02Icon} className="size-4" />
            Chỉnh sửa đơn vị
          </Button>
          {organization.status !== "INACTIVE" && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDeactivateClick}
              disabled={isDeactivating}
            >
              {isDeactivating ? "Đang ngừng..." : "Ngừng hoạt động"}
            </Button>
          )}
          <Button type="button" onClick={onCreateBatchClick}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tạo đợt khám mới
          </Button>
        </>
      }
    />
  )
}

