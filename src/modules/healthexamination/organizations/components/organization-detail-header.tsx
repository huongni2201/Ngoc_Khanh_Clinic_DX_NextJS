"use client"

import { Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { PageHeader, StatusPill } from "@/shared/ui"
import { Building2, MapPin } from "@/shared/ui/product-icon"
import { OrganizationDetail } from "../types"

interface OrganizationDetailHeaderProps {
  organization: OrganizationDetail
  onEditClick: () => void
  onDeactivateClick: () => void
  isDeactivating: boolean
}

export function OrganizationDetailHeader({
  organization,
  onEditClick,
  onDeactivateClick,
  isDeactivating,
}: OrganizationDetailHeaderProps) {
  const isActive = organization.status === "ACTIVE"
  const statusLabel =
    organization.status === "ACTIVE"
      ? "Hoạt động"
      : organization.status === "INACTIVE"
        ? "Ngừng hoạt động"
        : organization.status

  return (
    <PageHeader
      breadcrumbs={[
        { label: "Đơn vị", href: "/organizations" },
        { label: organization.name },
      ]}
      leading={
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-xl border border-border bg-selected text-primary"
        >
          <Building2 className="size-6" />
        </span>
      }
      title={organization.name}
      titleAccessory={<StatusPill tone={isActive ? "success" : "neutral"}>{statusLabel}</StatusPill>}
      description={
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {organization.taxCode ? (
            <span>
              Mã số thuế{" "}
              <span className="font-mono text-[13px] tabular-nums text-foreground">
                {organization.taxCode}
              </span>
            </span>
          ) : (
            <span>Chưa có mã số thuế</span>
          )}
          {organization.address ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate" title={organization.address}>
                {organization.address}
              </span>
            </span>
          ) : null}
        </span>
      }
      actions={
        <>
          <Button type="button" variant="outline" onClick={onEditClick}>
            <HugeiconsIcon icon={Edit02Icon} className="size-4" />
            Chỉnh sửa đơn vị
          </Button>
          {organization.status !== "INACTIVE" && (
            <Button
              type="button"
              variant="ghost"
              onClick={onDeactivateClick}
              disabled={isDeactivating}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeactivating ? "Đang ngừng..." : "Ngừng hoạt động"}
            </Button>
          )}
        </>
      }
    />
  )
}
