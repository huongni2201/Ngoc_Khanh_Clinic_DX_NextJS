"use client"

import * as React from "react"
import Link from "next/link"
import { Home, ChevronRight, Edit3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Breadcrumbs & Titles */}
      <div className="space-y-1.5">
        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
          </Link>
          <ChevronRight className="size-3.5 text-muted-foreground/60" />
          <Link
            href="/enterprises"
            className="hover:text-foreground transition-colors"
          >
            Doanh nghiệp
          </Link>
          <ChevronRight className="size-3.5 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{enterprise.name}</span>
        </nav>

        {/* Title + Status Badge */}
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {enterprise.name}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-status-in-progress-bg px-3 py-1 text-xs font-medium text-primary select-none">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            {getStatusLabel(enterprise.status)}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-secondary-foreground">
          Khách hàng doanh nghiệp
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-1 sm:pt-0">
        <Button
          type="button"
          variant="outline"
          onClick={onEditClick}
          className="h-10 rounded-lg px-4 font-medium border-primary/40 bg-card text-primary hover:bg-primary/5 text-xs sm:text-sm shadow-2xs"
        >
          <Edit3 className="size-4 mr-2 stroke-[2]" />
          Chỉnh sửa doanh nghiệp
        </Button>
        <Button
          type="button"
          onClick={onCreateBatchClick}
          className="h-10 rounded-lg px-4 font-medium text-xs sm:text-sm shadow-xs"
        >
          <Plus className="size-4 mr-1.5 stroke-[2.5]" />
          Tạo đợt khám mới
        </Button>
      </div>
    </div>
  )
}
