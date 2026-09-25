import { redirect } from "next/navigation"

interface LegacyExamBatchRouteProps {
  params: Promise<{ enterpriseId: string; batchId: string }>
}

export default async function LegacyExamBatchRoute({ params }: LegacyExamBatchRouteProps) {
  const { enterpriseId, batchId } = await params
  redirect(`/organizations/${enterpriseId}/health-examination-batches/${batchId}`)
}
