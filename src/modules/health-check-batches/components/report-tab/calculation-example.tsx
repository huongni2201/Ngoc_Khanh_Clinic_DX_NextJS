import * as React from "react"
import { Info } from "lucide-react"

export function CalculationExample() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4 flex items-center gap-3">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
        <Info className="size-3.5 stroke-[2.5]" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-semibold text-foreground">
          Ví dụ cách tính
        </h4>
        <p className="text-xs sm:text-sm text-foreground/80">
          Khám nội tổng quát: 100.000 x 50 = 5.000.000 đ
        </p>
      </div>
    </div>
  )
}
