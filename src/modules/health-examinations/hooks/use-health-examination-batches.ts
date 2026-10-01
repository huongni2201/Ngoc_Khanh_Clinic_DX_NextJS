"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchClinicalServiceCatalog,
  fetchHealthExaminationBatchesByOrganization,
  fetchHealthExaminationBatchById,
  createHealthExaminationBatch,
  fetchHealthExaminationBatchMatrix,
  fetchHealthExaminationBatchReport,
  fetchExaminationDetailExportData,
  fetchExaminationSummaryExportData,
} from "@/modules/health-examinations/api"
import { fetchHealthExaminationBatchParticipants } from "../api/participants"
import { healthExaminationKeys } from "../query-keys"
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
} from "../types"

export function useClinicalServices() {
  return useQuery<ClinicalService[]>({
    queryKey: healthExaminationKeys.clinicalServices(),
    queryFn: () => fetchClinicalServiceCatalog(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrganizationHealthExaminationBatches(
  organizationId: string,
  params?: HealthExaminationBatchFilterParams
) {
  return useQuery<HealthExaminationBatchListResponse>({
    queryKey: healthExaminationKeys.batchList(organizationId, params),
    queryFn: () => fetchHealthExaminationBatchesByOrganization(organizationId, params),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  })
}

export function useHealthExaminationBatchDetail(
  organizationId: string,
  batchId: string
) {
  return useQuery<HealthExaminationBatch>({
    queryKey: healthExaminationKeys.batchById(batchId),
    queryFn: () => fetchHealthExaminationBatchById(organizationId, batchId),
    enabled: Boolean(organizationId && batchId),
  })
}

export function useCreateHealthExaminationBatch() {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationBatch, Error, CreateHealthExaminationBatchRequest>({
    mutationFn: (request: CreateHealthExaminationBatchRequest) => createHealthExaminationBatch(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.batchLists(),
      })
    },
  })
}

export function useHealthExaminationBatchParticipants(
  organizationId: string,
  batchId: string,
  params?: ParticipantListFilterParams
) {
  return useQuery<ParticipantListResponse>({
    queryKey: healthExaminationKeys.participants(
      organizationId,
      batchId,
      params ?? {}
    ),
    queryFn: ({ signal }) =>
      fetchHealthExaminationBatchParticipants(organizationId, batchId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useHealthExaminationBatchMatrix(
  batchId: string,
  params?: ExaminationProgressFilterParams
) {
  return useQuery<ExaminationProgressResponse>({
    queryKey: healthExaminationKeys.batchMatrix(batchId, params),
    queryFn: () => fetchHealthExaminationBatchMatrix(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useHealthExaminationBatchReport(batchId: string) {
  return useQuery<HealthExaminationBatchReportSummary>({
    queryKey: healthExaminationKeys.batchReport(batchId),
    queryFn: () => fetchHealthExaminationBatchReport(batchId),
    enabled: Boolean(batchId),
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



