export const catalogKeys = {
  // Preserve the existing cache namespace while changing its owning module.
  clinicalServices: () => ["health-examinations", "clinical-services"] as const,
}
