import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { PatientDetailPage } from "@/modules/patients/pages/patient-detail-page"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Hồ sơ bệnh nhân — Ngọc Khánh Clinic",
  description: "Chi tiết hồ sơ bệnh nhân và lịch sử khám tại Ngọc Khánh Clinic",
}

export default function PatientDetailRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <PatientDetailPage />
      </Suspense>
    </AppShell>
  )
}
