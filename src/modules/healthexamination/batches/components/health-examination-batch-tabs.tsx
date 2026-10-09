"use client"

import { cn } from "@/lib/utils"

export type HealthExaminationBatchTabType = "overview" | "participants" | "examination" | "report"

interface HealthExaminationBatchTabsProps {
  activeTab: HealthExaminationBatchTabType
  onTabChange: (tab: HealthExaminationBatchTabType) => void
  /** Tabs the account may not use are left out; the backend still checks every request. */
  hiddenTabs?: readonly HealthExaminationBatchTabType[]
}

export function HealthExaminationBatchTabs({
  activeTab,
  onTabChange,
  hiddenTabs = [],
}: HealthExaminationBatchTabsProps) {
  const tabs: { key: HealthExaminationBatchTabType; label: string }[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "participants", label: "Người khám" },
    { key: "examination", label: "Chi tiết khám" },
    { key: "report", label: "Báo cáo" },
  ]

  return (
    <div className="border-b border-border">
      <nav aria-label="Tabs" className="-mb-px flex gap-6 overflow-x-auto no-scrollbar">
        {tabs.filter((tab) => !hiddenTabs.includes(tab.key)).map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "cursor-pointer select-none whitespace-nowrap border-b-2 px-0.5 py-3 text-sm font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-secondary-foreground hover:border-border hover:text-foreground"
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
