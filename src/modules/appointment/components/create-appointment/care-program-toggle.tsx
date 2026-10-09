"use client"

import { Building2, User } from "@/shared/ui/product-icon"
import { cn } from "@/lib/utils"
import type { CareProgram } from "../../types"

interface CareProgramToggleProps {
  careProgram: CareProgram
  onChange: (program: CareProgram) => void
}

/** Switch between an individual appointment and an organization health examination. */
export function CareProgramToggle({ careProgram, onChange }: CareProgramToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-surface-alt rounded-lg w-fit border border-border">
      <button
        type="button"
        onClick={() => onChange("INDIVIDUAL")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
          careProgram === "INDIVIDUAL"
            ? "bg-card text-foreground  font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="size-3.5" />
        <span>Khám cá nhân</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("ORGANIZATION_HEALTH_EXAMINATION")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
          careProgram === "ORGANIZATION_HEALTH_EXAMINATION"
            ? "bg-card text-primary  font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Building2 className="size-3.5" />
        <span>Khám đơn vị</span>
      </button>
    </div>
  )
}
