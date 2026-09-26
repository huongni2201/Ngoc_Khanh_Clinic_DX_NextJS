"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type OrganizationTabType = "info" | "batches" | "examinations" | "reports"

interface OrganizationTabsProps {
  activeTab: OrganizationTabType
  onTabChange: (tab: OrganizationTabType) => void
}

export function OrganizationTabs({
  activeTab,
  onTabChange,
}: OrganizationTabsProps) {
  const tabs = [
    { id: "info" as const, label: "Thông tin" },
    { id: "batches" as const, label: "Đợt khám" },
    { id: "examinations" as const, label: "Chi tiết khám" },
    { id: "reports" as const, label: "Báo cáo" },
  ]

  return (
    <div className="w-full border-b border-border">
      <nav className="flex items-center gap-8 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "pb-3 text-sm transition-colors cursor-pointer select-none focus-visible:outline-hidden",
                isActive
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "border-b-2 border-transparent font-medium text-secondary-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

