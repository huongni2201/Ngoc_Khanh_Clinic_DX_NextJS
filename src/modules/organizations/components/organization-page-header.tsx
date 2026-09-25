"use client"

import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"

interface OrganizationPageHeaderProps {
  onOpenCreateDialog: () => void
}

export function OrganizationPageHeader({
  onOpenCreateDialog,
}: OrganizationPageHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[{ label: "Đơn vị" }]}
      title="Đơn vị"
      description="Quản lý đơn vị và các đợt khám sức khỏe"
      actions={
        <Button
          onClick={onOpenCreateDialog}
          className="cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Thêm đơn vị
        </Button>
      }
    />
  )
}

