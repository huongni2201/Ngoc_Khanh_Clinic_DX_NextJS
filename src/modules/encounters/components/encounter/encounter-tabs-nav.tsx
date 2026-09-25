"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type EncounterTabKey = "summary" | "diagnosis" | "prescriptions" | "lab" | "documents"

interface EncounterTabsNavProps {
  activeTab: EncounterTabKey
  onTabChange: (tab: EncounterTabKey) => void
}

export const ENCOUNTER_TABS: { key: EncounterTabKey; label: string }[] = [
  { key: "summary", label: "Tóm tắt" },
  { key: "diagnosis", label: "Chẩn đoán" },
  { key: "prescriptions", label: "Đơn thuốc" },
  { key: "lab", label: "Kết quả cận lâm sàng" },
  { key: "documents", label: "Tài liệu" },
]

export function EncounterTabsNav({ activeTab, onTabChange }: EncounterTabsNavProps) {
  return (
    <div className="border-b border-border/80">
      <nav aria-label="Các phân hệ lượt khám" className="flex items-center gap-2 -mb-px overflow-x-auto">
        {ENCOUNTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "relative py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
