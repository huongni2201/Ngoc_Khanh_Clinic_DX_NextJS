"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ExamBatchTabType = "employees" | "examination" | "report"

interface ExamBatchTabsProps {
  activeTab: ExamBatchTabType
  onTabChange: (tab: ExamBatchTabType) => void
}

export function ExamBatchTabs({
  activeTab,
  onTabChange,
}: ExamBatchTabsProps) {
  const tabs: { key: ExamBatchTabType; label: string }[] = [
    { key: "employees", label: "Nhân sự khám" },
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
                "py-3 px-1 border-b-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none",
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
