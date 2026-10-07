"use client"

import type { ReactNode } from "react"
import { Users } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyParticipantsStateProps {
  /** Import actions, shown only when the signed-in account may import into this batch. */
  actions?: ReactNode
  /** Why nobody can be added yet, when the batch no longer accepts imports. */
  note?: string
}

export function EmptyParticipantsState({ actions, note }: EmptyParticipantsStateProps) {
  return (
    <Card className="rounded-lg border border-border bg-card ">
      <CardContent className="py-16 px-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Users className="size-7 stroke-[1.5]" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Chưa có người khám trong đợt khám
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {note ?? "Người khám sẽ xuất hiện tại đây sau khi được thêm vào đợt khám."}
          </p>
          {actions && <div className="mt-4 flex flex-wrap justify-center gap-2">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
