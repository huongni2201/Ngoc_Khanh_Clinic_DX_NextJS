"use client"

import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"

interface EnterprisePageHeaderProps {
  onOpenCreateDialog: () => void
}

export function EnterprisePageHeader({
  onOpenCreateDialog,
}: EnterprisePageHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[{ label: "Doanh nghiệp" }]}
      title="Doanh nghiệp"
      description="Quản lý doanh nghiệp và các đợt khám sức khỏe"
      actions={
        <Button
          onClick={onOpenCreateDialog}
          className="cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Thêm doanh nghiệp
        </Button>
      }
    />
  )
}
