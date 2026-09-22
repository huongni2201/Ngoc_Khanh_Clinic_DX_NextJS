"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type EnterpriseTabType = "info" | "batches"

interface EnterpriseTabsProps {
  activeTab: EnterpriseTabType
  onTabChange: (tab: EnterpriseTabType) => void
}

export function EnterpriseTabs({
  activeTab,
  onTabChange,
}: EnterpriseTabsProps) {
  const tabs = [
    { id: "info" as const, label: "Thông tin" },
    { id: "batches" as const, label: "Đợt khám" },
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
