"use client"

import { Add01Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"
import { EnterpriseDetail } from "../types"

interface EnterpriseDetailHeaderProps {
  enterprise: EnterpriseDetail
  onEditClick: () => void
  onCreateBatchClick: () => void
}

export function EnterpriseDetailHeader({
  enterprise,
  onEditClick,
  onCreateBatchClick,
}: EnterpriseDetailHeaderProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
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
        { label: "Doanh nghiệp", href: "/enterprises" },
        { label: enterprise.name },
      ]}
      title={enterprise.name}
      titleAccessory={
        <span className="inline-flex items-center gap-1.5 rounded-md bg-status-in-progress-bg px-2 py-1 text-xs font-medium text-primary">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          {getStatusLabel(enterprise.status)}
        </span>
      }
      description="Khách hàng doanh nghiệp"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onEditClick}
          >
            <HugeiconsIcon icon={Edit02Icon} className="size-4" />
            Chỉnh sửa doanh nghiệp
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
