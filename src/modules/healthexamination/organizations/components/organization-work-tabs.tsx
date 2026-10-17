"use client"

import { cn } from "@/lib/utils"

export type OrganizationWorkTab = "agreements" | "sessions"

const TABS: { key: OrganizationWorkTab; label: string }[] = [
  { key: "agreements", label: "Thỏa thuận" },
  { key: "sessions", label: "Lịch khám" },
]

interface OrganizationWorkTabsProps {
  activeTab: OrganizationWorkTab
  onTabChange: (tab: OrganizationWorkTab) => void
  /** Tabs the account may not use are left out; the backend still checks every request. */
  hiddenTabs?: readonly OrganizationWorkTab[]
}

/** Switches the work area of an Organization between its agreements and its sessions (Lịch khám). */
export function OrganizationWorkTabs({
  activeTab,
  onTabChange,
  hiddenTabs = [],
}: OrganizationWorkTabsProps) {
  return (
    <div className="border-b border-border">
      <nav aria-label="Công việc của đơn vị" className="-mb-px flex gap-6 overflow-x-auto no-scrollbar">
        {TABS.filter((tab) => !hiddenTabs.includes(tab.key)).map((tab) => {
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
