import { redirect } from "next/navigation"

interface LegacyBatchRouteProps {
  params: Promise<{ enterpriseId: string; batchId: string }>
}

export default async function LegacyBatchRoute({ params }: LegacyBatchRouteProps) {
  const { enterpriseId, batchId } = await params
  redirect(`/organizations/${enterpriseId}/health-examination-batches/${batchId}`)
}
