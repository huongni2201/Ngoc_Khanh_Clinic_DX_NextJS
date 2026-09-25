"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type HealthExaminationBatchTabType = "participants" | "examination" | "report"

interface HealthExaminationBatchTabsProps {
  activeTab: HealthExaminationBatchTabType
  onTabChange: (tab: HealthExaminationBatchTabType) => void
}

export function HealthExaminationBatchTabs({
  activeTab,
  onTabChange,
}: HealthExaminationBatchTabsProps) {
  const tabs: { key: HealthExaminationBatchTabType; label: string }[] = [
    { key: "participants", label: "Người khám" },
    { key: "examination", label: "Chi tiết khám" },
    { key: "report", label: "Báo cáo" },
  ]

  return (
    <div className="border-b border-border/80">
      <nav
        aria-label="Tabs"
        className="flex space-x-8 -mb-px overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "py-3 px-1 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer select-none",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary-foreground hover:text-foreground hover:border-border/80 font-medium"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
