import { redirect } from "next/navigation"

interface LegacyOrganizationRouteProps {
  params: Promise<{ enterpriseId: string }>
}

export default async function LegacyOrganizationRoute({
  params,
}: LegacyOrganizationRouteProps) {
  const { enterpriseId } = await params
  redirect(`/organizations/${enterpriseId}`)
}
