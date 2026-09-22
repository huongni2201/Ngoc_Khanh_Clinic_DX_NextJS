import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { EnterpriseDetailPage } from "@/modules/companies"
import { Skeleton } from "@/components/ui/skeleton"

interface EnterpriseDetailPageProps {
  params: Promise<{
    enterpriseId: string
  }>
}

export async function generateMetadata({
  params,
}: EnterpriseDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `Chi tiết doanh nghiệp — Ngọc Khánh Clinic`,
    description: `Chi tiết doanh nghiệp ${resolvedParams.enterpriseId} tại Ngọc Khánh Clinic`,
  }
}

export default async function EnterprisePage({
  params,
}: EnterpriseDetailPageProps) {
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
        <EnterpriseDetailPage enterpriseId={resolvedParams.enterpriseId} />
      </Suspense>
    </AppShell>
  )
}
