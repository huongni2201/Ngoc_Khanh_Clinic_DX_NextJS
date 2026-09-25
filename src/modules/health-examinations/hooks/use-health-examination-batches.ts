"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchClinicalServiceCatalog,
  fetchHealthExaminationBatchesByOrganization,
  fetchHealthExaminationBatchById,
  createHealthExaminationBatch,
  fetchHealthExaminationBatchParticipants,
  fetchHealthExaminationBatchMatrix,
  fetchHealthExaminationBatchReport,
  fetchExaminationDetailExportData,
  fetchExaminationSummaryExportData,
  importParticipantsToBatch,
  populateSampleParticipantsForBatch,
} from "@/modules/health-examinations/api"
import {
  downloadFile,
  generateDetailHorizontalCSV,
  generateSummaryVerticalCSV,
  sanitizeFileName,
} from "../utils/export-excel"
import {
  CreateHealthExaminationBatchRequest,
  HealthExaminationBatchFilterParams,
  HealthExaminationBatch,
  ClinicalService,
  HealthExaminationBatchListResponse,
  ParticipantListFilterParams,
  ParticipantListResponse,
  ExaminationProgressFilterParams,
  ExaminationProgressResponse,
  HealthExaminationBatchReportSummary,
  HealthExaminationParticipant,
} from "../types"

export function useClinicalServices() {
  return useQuery<ClinicalService[]>({
    queryKey: ["clinical-services"],
    queryFn: () => fetchClinicalServiceCatalog(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrganizationHealthExaminationBatches(
  organizationId: string,
  params?: HealthExaminationBatchFilterParams
) {
  return useQuery<HealthExaminationBatchListResponse>({
    queryKey: ["health-examination-batches", organizationId, params],
    queryFn: () => fetchHealthExaminationBatchesByOrganization(organizationId, params),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  })
}

export function useHealthExaminationBatchDetail(batchId: string) {
  return useQuery<HealthExaminationBatch | null>({
    queryKey: ["health-examination-batch", batchId],
    queryFn: () => fetchHealthExaminationBatchById(batchId),
    enabled: Boolean(batchId),
  })
}

export function useCreateHealthExaminationBatch() {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationBatch, Error, CreateHealthExaminationBatchRequest>({
    mutationFn: (request: CreateHealthExaminationBatchRequest) => createHealthExaminationBatch(request),
    onSuccess: (newBatch) => {
      // Invalidate organization exam batches queries
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batches", newBatch.organizationId],
      })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batches"],
      })
      // Invalidate organization details
      queryClient.invalidateQueries({
        queryKey: ["organization", newBatch.organizationId],
      })
    },
  })
}

export function useHealthExaminationBatchParticipants(
  batchId: string,
  params?: ParticipantListFilterParams
) {
  return useQuery<ParticipantListResponse>({
    queryKey: ["health-examination-batch-participants", batchId, params],
    queryFn: () => fetchHealthExaminationBatchParticipants(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useHealthExaminationBatchMatrix(
  batchId: string,
  params?: ExaminationProgressFilterParams
) {
  return useQuery<ExaminationProgressResponse>({
    queryKey: ["health-examination-batch-matrix", batchId, params],
    queryFn: () => fetchHealthExaminationBatchMatrix(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useHealthExaminationBatchReport(batchId: string) {
  return useQuery<HealthExaminationBatchReportSummary>({
    queryKey: ["health-examination-batch-report", batchId],
    queryFn: () => fetchHealthExaminationBatchReport(batchId),
    enabled: Boolean(batchId),
  })
}

export function useImportBatchParticipants() {
  const queryClient = useQueryClient()

  return useMutation<
    { count: number },
    Error,
    { batchId: string; participants: HealthExaminationParticipant[] }
  >({
    mutationFn: ({ batchId, participants }) =>
      importParticipantsToBatch(batchId, participants),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ["health-examination-batch", batchId] })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-participants", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-matrix", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-report", batchId],
      })
    },
  })
}

export function usePopulateSampleParticipants() {
  const queryClient = useQueryClient()

  return useMutation<{ count: number }, Error, string>({
    mutationFn: (batchId: string) => populateSampleParticipantsForBatch(batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: ["health-examination-batch", batchId] })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-participants", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-matrix", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-report", batchId],
      })
    },
  })
}

export function useExportExamDetail() {
  return useMutation<
    { filename: string; rowCount: number },
    Error,
    { batchId: string; batchName?: string }
  >({
    mutationFn: async ({ batchId, batchName }) => {
      const data = await fetchExaminationDetailExportData(batchId)
      const csv = generateDetailHorizontalCSV(data)
      const sanitized =
        sanitizeFileName(batchName || data.batchName) || data.batchCode || batchId
      const filename = `chi-tiet-kham-${sanitized}.csv`
      downloadFile(csv, filename)
      return { filename, rowCount: data.rows.length }
    },
  })
}

export function useExportExamSummary() {
  return useMutation<
    { filename: string; itemCount: number },
    Error,
    { batchId: string; batchName?: string }
  >({
    mutationFn: async ({ batchId, batchName }) => {
      const data = await fetchExaminationSummaryExportData(batchId)
      const csv = generateSummaryVerticalCSV(data)
      const sanitized =
        sanitizeFileName(batchName || data.batchName) || data.batchCode || batchId
      const filename = `bao-cao-tong-hop-${sanitized}.csv`
      downloadFile(csv, filename)
      return { filename, itemCount: data.items.length }
    },
  })
}



