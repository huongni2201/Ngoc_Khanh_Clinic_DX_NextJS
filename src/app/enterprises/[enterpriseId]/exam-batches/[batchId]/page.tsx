import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { ExamBatchDetailPage } from "@/modules/health-check-batches"
import { Skeleton } from "@/components/ui/skeleton"

interface ExamBatchDetailPageProps {
  params: Promise<{
    enterpriseId: string
    batchId: string
  }>
}

export async function generateMetadata({
  params,
}: ExamBatchDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `Chi tiết đợt khám — Ngọc Khánh Clinic`,
    description: `Chi tiết đợt khám ${resolvedParams.batchId} tại Ngọc Khánh Clinic`,
  }
}

export default async function ExamBatchPage({
  params,
}: ExamBatchDetailPageProps) {
  const resolvedParams = await params

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="w-full space-y-6 animate-pulse">
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                <div className="space-y-1.5">
                  <Skeleton className="h-8 w-72 sm:w-96" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32 rounded-lg" />
                  <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <ExamBatchDetailPage
          enterpriseId={resolvedParams.enterpriseId}
          batchId={resolvedParams.batchId}
        />
      </Suspense>
    </AppShell>
  )
}
