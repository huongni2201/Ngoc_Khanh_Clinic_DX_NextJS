export interface LabResult {
  sequence: number
  analyteName: string
  code: string
  value: string
  unit: string
  referenceRange: string
  interpretation: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL"
  interpretationLabel: string
}

export interface LaboratoryReport {
  orderCode: string
  serviceName: string
  sampleCollector: string
  sampledAt: string
  resultReportedAt: string
  orderingPhysician: string
  approvingPhysician: string
  statusLabel: string
  indicators: LabResult[]
  conclusion: string
  notes: string
}

export interface ImagingReport {
  orderCode: string
  serviceName: string
  technique: string
  performedAt: string
  orderingPhysician: string
  radiologist: string
  device: string
  imageUrl: string
  findings: string[]
  impression: string
  recommendation: string
}
