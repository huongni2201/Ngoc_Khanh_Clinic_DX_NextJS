import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { OrganizationDetailPage } from "@/modules/healthexamination"
import { ScreenLoadingSkeleton } from "@/shared/ui"

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
        fallback={<ScreenLoadingSkeleton variant="detail" />}
      >
        <OrganizationDetailPage organizationId={resolvedParams.organizationId} />
      </Suspense>
    </AppShell>
  )
}

