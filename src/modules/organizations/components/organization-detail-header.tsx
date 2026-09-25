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
}

export function OrganizationDetailHeader({
  organization,
  onEditClick,
  onCreateBatchClick,
}: OrganizationDetailHeaderProps) {
  const getStatusLabel = (status: string, partnershipStatus?: string) => {
    switch (partnershipStatus ?? status) {
      case "PARTNERING":
        return "Đang hợp tác"
      case "ACTIVE":
        return "Hoạt động"
      case "INACTIVE":
        return "Ngừng hợp tác"
      case "IN_PROGRESS":
        return "Đang khám"
      case "COMPLETED":
        return "Đã khám"
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
        <span className="inline-flex items-center gap-1.5 rounded-md bg-status-in-progress-bg px-2 py-1 text-xs font-medium text-primary">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          {getStatusLabel(organization.status, organization.partnershipStatus)}
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
          <Button type="button" onClick={onCreateBatchClick}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tạo đợt khám mới
          </Button>
        </>
      }
    />
  )
}

