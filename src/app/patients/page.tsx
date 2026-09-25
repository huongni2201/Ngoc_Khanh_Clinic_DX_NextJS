import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { PatientsPage } from "@/modules/patients"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Danh sách bệnh nhân — Ngọc Khánh Clinic",
  description: "Quản lý thông tin hồ sơ bệnh nhân của Phòng Khám Ngọc Khánh",
}

export default function PatientsRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-5 w-full">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-52" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <Skeleton className="h-10 w-40 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>

            {/* Toolbar skeleton */}
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-10 flex-1 max-w-xl rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-36 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </div>

            {/* Table skeleton */}
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <PatientsPage />
      </Suspense>
    </AppShell>
  )
}
