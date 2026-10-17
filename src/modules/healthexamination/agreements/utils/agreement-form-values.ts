import type { ClinicalService } from "@/modules/catalog"
import type { HealthExaminationAgreement, HealthExaminationAgreementServiceInput } from "../types"
import type {
  HealthExaminationAgreementFormValues,
  HealthExaminationAgreementServiceFormValue,
  ValidatedHealthExaminationAgreementFormValues,
} from "../schemas/health-examination-agreement.schema"

export const MISSING_SERVICE_NAME = "Dịch vụ không còn trong danh mục"

/**
 * One row per active catalog service. In edit mode the agreement's own choices are preselected, and a
 * service the catalog no longer lists stays as a selected row so saving never drops it silently.
 */
function buildServiceRows(
  catalog: ClinicalService[],
  agreement?: HealthExaminationAgreement
): HealthExaminationAgreementServiceFormValue[] {
  // Only the services still offered are part of the form: a retired line is history.
  const activeServices = (agreement?.services ?? []).filter((service) => service.active !== false)
  const chosen = new Map(activeServices.map((service) => [service.serviceId, service]))

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
  const orphans = activeServices
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
  options: { agreement?: HealthExaminationAgreement }
): HealthExaminationAgreementFormValues {
  const { agreement } = options
  return {
    agreementName: agreement?.name ?? "",
    validFrom: agreement?.validFrom ?? "",
    validTo: agreement?.validTo ?? "",
    services: buildServiceRows(catalog, agreement),
  }
}

/** An empty date field means no limit; the backend takes null. */
export function toValidityDates(values: ValidatedHealthExaminationAgreementFormValues) {
  return { validFrom: values.validFrom || null, validTo: values.validTo || null }
}

export function toServiceInputs(
  values: ValidatedHealthExaminationAgreementFormValues
): HealthExaminationAgreementServiceInput[] {
  return values.services
    .filter((service) => service.selected)
    .map((service) => ({
      serviceId: service.serviceId,
      negotiatedPrice: service.negotiatedPrice,
    }))
}
