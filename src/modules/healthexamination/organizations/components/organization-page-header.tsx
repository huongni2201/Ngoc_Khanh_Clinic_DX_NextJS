"use client"

import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/shared/ui"

interface OrganizationPageHeaderProps {
  /** Omitted when the account may not create Organizations: the action is then not shown. */
  onOpenCreateDialog?: () => void
}

export function OrganizationPageHeader({
  onOpenCreateDialog,
}: OrganizationPageHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[{ label: "Đơn vị" }]}
      title="Đơn vị"
      description="Quản lý đơn vị và các thỏa thuận sức khỏe"
      actions={
        onOpenCreateDialog ? (
          <Button type="button" onClick={onOpenCreateDialog}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Thêm đơn vị
          </Button>
        ) : undefined
      }
    />
  )
}

