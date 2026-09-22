"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMasterExaminationCatalog,
  fetchExamBatchesByEnterprise,
  fetchExamBatchById,
  createExamBatch,
  fetchExamBatchEmployees,
  fetchExamBatchMatrix,
  fetchExamBatchReport,
  fetchExamDetailExportData,
  fetchExamSummaryExportData,
  importEmployeesToBatch,
  populateSampleEmployeesForBatch,
} from "../api"
import {
  downloadFile,
  generateDetailHorizontalCSV,
  generateSummaryVerticalCSV,
  sanitizeFileName,
} from "../utils/export-excel"
import {
  CreateExamBatchRequest,
  ExamBatchFilterParams,
  ExamBatch,
  MasterExaminationItem,
  ExamBatchListResponse,
  EmployeeListFilterParams,
  EmployeeListResponse,
  EmployeeMatrixFilterParams,
  EmployeeMatrixResponse,
  ExamBatchReportSummary,
  EmployeeInBatch,
} from "../types"

export function useMasterExaminationItems() {
  return useQuery<MasterExaminationItem[]>({
    queryKey: ["master-examination-items"],
    queryFn: () => fetchMasterExaminationCatalog(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useEnterpriseExamBatches(
  enterpriseId: string,
  params?: ExamBatchFilterParams
) {
  return useQuery<ExamBatchListResponse>({
    queryKey: ["exam-batches", enterpriseId, params],
    queryFn: () => fetchExamBatchesByEnterprise(enterpriseId, params),
    enabled: Boolean(enterpriseId),
    staleTime: 30 * 1000,
  })
}

export function useExamBatchDetail(batchId: string) {
  return useQuery<ExamBatch | null>({
    queryKey: ["exam-batch", batchId],
    queryFn: () => fetchExamBatchById(batchId),
    enabled: Boolean(batchId),
  })
}

export function useCreateExamBatch() {
  const queryClient = useQueryClient()

  return useMutation<ExamBatch, Error, CreateExamBatchRequest>({
    mutationFn: (request: CreateExamBatchRequest) => createExamBatch(request),
    onSuccess: (newBatch) => {
      // Invalidate enterprise exam batches queries
      queryClient.invalidateQueries({
        queryKey: ["exam-batches", newBatch.enterpriseId],
      })
      queryClient.invalidateQueries({
        queryKey: ["exam-batches"],
      })
      // Invalidate enterprise details
      queryClient.invalidateQueries({
        queryKey: ["enterprise", newBatch.enterpriseId],
      })
    },
  })
}

export function useExamBatchEmployees(
  batchId: string,
  params?: EmployeeListFilterParams
) {
  return useQuery<EmployeeListResponse>({
    queryKey: ["exam-batch-employees", batchId, params],
    queryFn: () => fetchExamBatchEmployees(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useExamBatchMatrix(
  batchId: string,
  params?: EmployeeMatrixFilterParams
) {
  return useQuery<EmployeeMatrixResponse>({
    queryKey: ["exam-batch-matrix", batchId, params],
    queryFn: () => fetchExamBatchMatrix(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useExamBatchReport(batchId: string) {
  return useQuery<ExamBatchReportSummary>({
    queryKey: ["exam-batch-report", batchId],
    queryFn: () => fetchExamBatchReport(batchId),
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
      queryClient.invalidateQueries({ queryKey: ["exam-batch", batchId] })
      queryClient.invalidateQueries({
        queryKey: ["exam-batch-employees", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["exam-batch-matrix", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["exam-batch-report", batchId],
      })
    },
  })
}

export function usePopulateSampleEmployees() {
  const queryClient = useQueryClient()

  return useMutation<{ count: number }, Error, string>({
    mutationFn: (batchId: string) => populateSampleEmployeesForBatch(batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: ["exam-batch", batchId] })
      queryClient.invalidateQueries({
        queryKey: ["exam-batch-employees", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["exam-batch-matrix", batchId],
      })
      queryClient.invalidateQueries({
        queryKey: ["exam-batch-report", batchId],
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

