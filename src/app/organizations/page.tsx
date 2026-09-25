import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { OrganizationListPage } from "@/modules/organizations"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Đơn vị — Ngọc Khánh Clinic",
  description: "Danh sách đơn vị đã khám hoặc đang khám tại Ngọc Khánh Clinic",
}

export default function OrganizationsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <OrganizationListPage />
      </Suspense>
    </AppShell>
  )
}

