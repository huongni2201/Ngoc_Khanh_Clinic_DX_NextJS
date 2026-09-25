import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { DoctorWorklistPage } from "@/modules/doctor"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Danh sách lượt khám — Bác sĩ — Ngọc Khánh Clinic",
  description: "Theo dõi bệnh nhân đang chờ, đang khám và tiến độ xử lý trong ngày tại Ngọc Khánh Clinic",
}

export default function DoctorRoute() {
  return (
    <AppShell
      user={{
        name: "BS. Trần Minh Khoa",
        role: "Bác sĩ",
        initials: "MK",
      }}
    >
      <Suspense
        fallback={
          <div className="space-y-5 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-44" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Skeleton className="h-18 rounded-xl" />
              <Skeleton className="h-18 rounded-xl" />
              <Skeleton className="h-18 rounded-xl" />
              <Skeleton className="h-18 rounded-xl" />
              <Skeleton className="h-18 rounded-xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <DoctorWorklistPage />
      </Suspense>
    </AppShell>
  )
}
