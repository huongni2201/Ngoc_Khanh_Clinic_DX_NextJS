import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { HealthExaminationBatchDetailPage } from "@/modules/health-examinations"
import { ScreenLoadingSkeleton } from "@/shared/ui"

interface BatchDetailPageProps {
  params: Promise<{
    organizationId: string
    batchId: string
  }>
}

export async function generateMetadata({
  params,
}: BatchDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: "Chi tiết đợt khám — Ngọc Khánh Clinic",
    description: `Chi tiết đợt khám ${resolvedParams.batchId} tại Ngọc Khánh Clinic`,
  }
}

export default async function BatchDetailPage({
  params,
}: BatchDetailPageProps) {
  const resolvedParams = await params

  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingSkeleton variant="detail" />}>
        <HealthExaminationBatchDetailPage
          organizationId={resolvedParams.organizationId}
          batchId={resolvedParams.batchId}
        />
      </Suspense>
    </AppShell>
  )
}
