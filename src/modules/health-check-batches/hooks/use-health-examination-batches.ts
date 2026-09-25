"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMasterExaminationCatalog,
  fetchHealthExaminationBatchesByEnterprise,
  fetchHealthExaminationBatchById,
  createHealthExaminationBatch,
  fetchHealthExaminationBatchEmployees,
  fetchHealthExaminationBatchMatrix,
  fetchHealthExaminationBatchReport,
  fetchExamDetailExportData,
  fetchExamSummaryExportData,
  importEmployeesToBatch,
  populateSampleEmployeesForBatch,
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
  MasterExaminationItem,
  HealthExaminationBatchListResponse,
  EmployeeListFilterParams,
  EmployeeListResponse,
  EmployeeMatrixFilterParams,
  EmployeeMatrixResponse,
  HealthExaminationBatchReportSummary,
  EmployeeInBatch,
} from "../types"

export function useMasterExaminationItems() {
  return useQuery<MasterExaminationItem[]>({
    queryKey: ["master-examination-items"],
    queryFn: () => fetchMasterExaminationCatalog(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useEnterpriseHealthExaminationBatches(
  enterpriseId: string,
  params?: HealthExaminationBatchFilterParams
) {
  return useQuery<HealthExaminationBatchListResponse>({
    queryKey: ["health-examination-batches", enterpriseId, params],
    queryFn: () => fetchHealthExaminationBatchesByEnterprise(enterpriseId, params),
    enabled: Boolean(enterpriseId),
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
      // Invalidate enterprise exam batches queries
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batches", newBatch.enterpriseId],
      })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batches"],
      })
      // Invalidate enterprise details
      queryClient.invalidateQueries({
        queryKey: ["enterprise", newBatch.enterpriseId],
      })
    },
  })
}

export function useHealthExaminationBatchEmployees(
  batchId: string,
  params?: EmployeeListFilterParams
) {
  return useQuery<EmployeeListResponse>({
    queryKey: ["health-examination-batch-employees", batchId, params],
    queryFn: () => fetchHealthExaminationBatchEmployees(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useHealthExaminationBatchMatrix(
  batchId: string,
  params?: EmployeeMatrixFilterParams
) {
  return useQuery<EmployeeMatrixResponse>({
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

export function useImportBatchEmployees() {
  const queryClient = useQueryClient()

  return useMutation<
    { count: number },
    Error,
    { batchId: string; employees: EmployeeInBatch[] }
  >({
    mutationFn: ({ batchId, employees }) =>
      importEmployeesToBatch(batchId, employees),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ["health-examination-batch", batchId] })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-employees", batchId],
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

export function usePopulateSampleEmployees() {
  const queryClient = useQueryClient()

  return useMutation<{ count: number }, Error, string>({
    mutationFn: (batchId: string) => populateSampleEmployeesForBatch(batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: ["health-examination-batch", batchId] })
      queryClient.invalidateQueries({
        queryKey: ["health-examination-batch-employees", batchId],
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
      const data = await fetchExamDetailExportData(batchId)
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
      const data = await fetchExamSummaryExportData(batchId)
      const csv = generateSummaryVerticalCSV(data)
      const sanitized =
        sanitizeFileName(batchName || data.batchName) || data.batchCode || batchId
      const filename = `bao-cao-tong-hop-${sanitized}.csv`
      downloadFile(csv, filename)
      return { filename, itemCount: data.items.length }
    },
  })
}
