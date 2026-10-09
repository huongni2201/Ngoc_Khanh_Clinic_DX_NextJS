import type { ClinicalService } from "@/modules/catalog"
import type { HealthExaminationBatch, HealthExaminationBatchServiceInput } from "../types"
import type {
  HealthExaminationBatchFormValues,
  HealthExaminationBatchServiceFormValue,
  ValidatedHealthExaminationBatchFormValues,
} from "../schemas/health-examination-batch.schema"

export const MISSING_SERVICE_NAME = "Dịch vụ không còn trong danh mục"

/**
 * One row per active catalog service. In edit mode the batch's own choices are preselected, and a
 * service the catalog no longer lists stays as a selected row so saving never drops it silently.
 */
function buildServiceRows(
  catalog: ClinicalService[],
  batch?: HealthExaminationBatch
): HealthExaminationBatchServiceFormValue[] {
  const chosen = new Map((batch?.services ?? []).map((service) => [service.serviceId, service]))

  const rows = catalog.map((item) => {
    const current = chosen.get(item.id)
    return {
      serviceId: item.id,
      code: item.code,
      name: item.name,
      referencePrice: item.unitPrice,
      selected: Boolean(current),
      negotiatedPrice: current?.negotiatedPrice ?? item.unitPrice,
    }
  })

  const listed = new Set(catalog.map((item) => item.id))
  const orphans = (batch?.services ?? [])
    .filter((service) => !listed.has(service.serviceId))
    .map((service) => ({
      serviceId: service.serviceId,
      code: service.code ?? "",
      name: service.name ?? MISSING_SERVICE_NAME,
      referencePrice: service.referencePrice,
      selected: true,
      negotiatedPrice: service.negotiatedPrice,
    }))

  return [...rows, ...orphans]
}

export function buildFormValues(
  catalog: ClinicalService[],
  options: { batch?: HealthExaminationBatch; defaultAddress?: string }
): HealthExaminationBatchFormValues {
  const { batch, defaultAddress } = options
  return {
    batchName: batch?.name ?? "",
    examinationDates: batch ? [...batch.examinationDates] : [],
    examinationSiteType: batch?.examinationSiteType ?? "",
    examinationSiteName: batch?.examinationSiteName ?? "",
    examinationSiteAddress: batch ? (batch.examinationSiteAddress ?? "") : (defaultAddress ?? ""),
    services: buildServiceRows(catalog, batch),
  }
}

export function toServiceInputs(
  values: ValidatedHealthExaminationBatchFormValues
): HealthExaminationBatchServiceInput[] {
  return values.services
    .filter((service) => service.selected)
    .map((service) => ({
      serviceId: service.serviceId,
      negotiatedPrice: service.negotiatedPrice,
    }))
}
