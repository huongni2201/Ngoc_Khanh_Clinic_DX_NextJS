import { notFound } from "next/navigation"

// The batch route was replaced by /organizations/{organizationId}/agreements/{agreementId}.
// This file could not be deleted automatically (file permissions); delete the whole
// `health-examination-batches` folder.
export default function RemovedBatchRoute() {
  notFound()
}
