import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { HealthExaminationAgreementDetailPage } from "@/modules/healthexamination"
import { ScreenLoadingSkeleton } from "@/shared/ui"

interface HealthExaminationAgreementDetailPageProps {
  params: Promise<{
    organizationId: string
    agreementId: string
  }>
}

export async function generateMetadata({
  params,
}: HealthExaminationAgreementDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: "Chi tiết thỏa thuận — Ngọc Khánh Clinic",
    description: "Chi tiết thỏa thuận " + resolvedParams.agreementId + " tại Ngọc Khánh Clinic",
  }
}

export default async function HealthExaminationAgreementPage({
  params,
}: HealthExaminationAgreementDetailPageProps) {
  const resolvedParams = await params

  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="detail" />}
      >
        <HealthExaminationAgreementDetailPage
          organizationId={resolvedParams.organizationId}
          agreementId={resolvedParams.agreementId}
        />
      </Suspense>
    </AppShell>
  )
}

