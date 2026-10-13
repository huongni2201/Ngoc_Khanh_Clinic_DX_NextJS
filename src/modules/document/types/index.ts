export interface EncounterDocument {
  id: string
  sequence: number
  name: string
  type: string
  sizeFormat: string
  createdAt: string
  createdBy: string
}

export * from "./render-job"
