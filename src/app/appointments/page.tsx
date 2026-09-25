import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { AppointmentsPage } from "@/modules/appointments"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Lịch hẹn — Ngọc Khánh Clinic",
  description: "Quản lý lịch hẹn khám bệnh tại Phòng Khám Ngọc Khánh",
}

export default function AppointmentsRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-40" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <AppointmentsPage />
      </Suspense>
    </AppShell>
  )
}
