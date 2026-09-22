"use client"

import * as React from "react"
import Link from "next/link"
import { Home, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnterprisePageHeaderProps {
  onOpenCreateDialog: () => void
}

export function EnterprisePageHeader({
  onOpenCreateDialog,
}: EnterprisePageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <span className="font-medium text-foreground">Doanh nghiệp</span>
        </nav>

        {/* Header Titles */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Doanh nghiệp
          </h1>
          <p className="text-sm text-secondary-foreground">
            Danh sách doanh nghiệp đã khám hoặc đang khám
          </p>
        </div>
      </div>

      {/* Top Right Action: SOLE button */}
      <div>
        <Button
          onClick={onOpenCreateDialog}
          className="h-10 rounded-lg px-4 font-medium shadow-xs"
        >
          <Plus className="size-4 mr-1.5 stroke-[2.5]" />
          Thêm doanh nghiệp
        </Button>
      </div>
    </div>
  )
}
