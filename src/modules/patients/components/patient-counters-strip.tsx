import * as React from "react"
import { PatientCounters, PatientGender, PatientAgeGroup } from "../types"
import { cn } from "@/lib/utils"

interface PatientCountersStripProps {
  counters?: PatientCounters
  isLoading?: boolean
  onFilterGender?: (gender: PatientGender | "ALL") => void
  onFilterAgeGroup?: (ageGroup: PatientAgeGroup) => void
  activeGender?: PatientGender | "ALL"
  activeAgeGroup?: PatientAgeGroup
}

export function PatientCountersStrip({
  counters,
  isLoading,
  onFilterGender,
  onFilterAgeGroup,
  activeGender = "ALL",
  activeAgeGroup = "ALL",
}: PatientCountersStripProps) {
  const isAllActive = activeGender === "ALL" && activeAgeGroup === "ALL"

  const items = [
    {
      key: "ALL",
      label: "Tổng hồ sơ bệnh nhân",
      count: counters?.total ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
      isActive: isAllActive,
      onClick: () => {
        onFilterGender?.("ALL")
        onFilterAgeGroup?.("ALL")
      },
    },
    {
      key: "TODAY",
      label: "Đến khám hôm nay",
      count: counters?.todayVisits ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
      isActive: false,
      onClick: undefined,
    },
    {
      key: "MALE",
      label: "Bệnh nhân Nam",
      count: counters?.maleCount ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
      isActive: activeGender === "MALE",
      onClick: () => onFilterGender?.(activeGender === "MALE" ? "ALL" : "MALE"),
    },
    {
      key: "FEMALE",
      label: "Bệnh nhân Nữ",
      count: counters?.femaleCount ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
      isActive: activeGender === "FEMALE",
      onClick: () => onFilterGender?.(activeGender === "FEMALE" ? "ALL" : "FEMALE"),
    },
    {
      key: "ELDERLY",
      label: "Bệnh nhân cao tuổi (>60)",
      count: counters?.elderlyCount ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
      isActive: activeAgeGroup === ">60",
      onClick: () => onFilterAgeGroup?.(activeAgeGroup === ">60" ? "ALL" : ">60"),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, index) => {
        const isClickable = !!item.onClick

        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            disabled={!isClickable}
            aria-pressed={isClickable ? item.isActive : undefined}
            className={cn(
              "flex h-[72px] items-center border bg-card px-4 py-3 text-left transition-colors disabled:opacity-100",
              isClickable ? "cursor-pointer" : "cursor-default",
              item.borderColor,
              item.hoverBorder,
              item.isActive && item.activeRing,
              index > 0 && "-ml-px"
            )}
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xl font-bold text-foreground leading-none tracking-tight">
                {isLoading ? (
                  <span className="inline-block size-5 bg-surface-alt animate-pulse rounded" />
                ) : (
                  item.count
                )}
              </span>
              <span className="text-xs text-secondary-foreground mt-1 truncate font-medium">
                {item.label}
              </span>
            </div>

          </button>
        )
      })}
    </div>
  )
}
