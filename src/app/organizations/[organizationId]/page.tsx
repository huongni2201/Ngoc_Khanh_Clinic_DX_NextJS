import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { OrganizationDetailPage } from "@/modules/organizations"
import { Skeleton } from "@/components/ui/skeleton"

interface OrganizationDetailPageProps {
  params: Promise<{
    organizationId: string
  }>
}

export async function generateMetadata({
  params,
}: OrganizationDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `Chi tiết đơn vị — Ngọc Khánh Clinic`,
    description: `Chi tiết đơn vị ${resolvedParams.organizationId} tại Ngọc Khánh Clinic`,
  }
}

export default async function OrganizationPage({
  params,
}: OrganizationDetailPageProps) {
  const resolvedParams = await params

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <OrganizationDetailPage organizationId={resolvedParams.organizationId} />
      </Suspense>
    </AppShell>
  )
}

