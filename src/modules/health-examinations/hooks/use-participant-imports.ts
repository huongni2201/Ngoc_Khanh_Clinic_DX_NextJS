"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  cancelParticipantImport,
  confirmParticipantImport,
  downloadParticipantImportTemplate,
  fetchParticipantImport,
  fetchParticipantImportRows,
  uploadParticipantImport,
  validateParticipantImport,
  type ParticipantImportMapping,
} from "../api/participant-imports"
import { healthExaminationKeys } from "../query-keys"

export function useDownloadParticipantImportTemplate() {
  return useMutation({
    mutationFn: ({ organizationId, batchId }: { organizationId: string; batchId: string }) =>
      downloadParticipantImportTemplate(organizationId, batchId),
  })
}

export function useUploadParticipantImport() {
  return useMutation({
    mutationFn: ({ organizationId, batchId, file }: {
      organizationId: string
      batchId: string
      file: File
    }) => uploadParticipantImport(organizationId, batchId, file),
  })
}

export function useValidateParticipantImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, batchId, importId, columns }: {
      organizationId: string
      batchId: string
      importId: string
      columns: ParticipantImportMapping
    }) => validateParticipantImport(organizationId, batchId, importId, columns),
    onSuccess: (summary, variables) => {
      queryClient.setQueryData(
        healthExaminationKeys.participantImport(
          variables.organizationId,
          variables.batchId,
          variables.importId
        ),
        summary
      )
      queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantImportRowsRoot(
          variables.organizationId,
          variables.batchId,
          variables.importId
        ),
      })
    },
  })
}

export function useParticipantImport(
  organizationId: string,
  batchId: string,
  importId: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: healthExaminationKeys.participantImport(organizationId, batchId, importId),
    queryFn: () => fetchParticipantImport(organizationId, batchId, importId),
    enabled: Boolean(organizationId && batchId && importId && enabled),
  })
}

export function useParticipantImportRows(
  organizationId: string,
  batchId: string,
  importId: string,
  params: { page: number; size: number; status: string },
  enabled: boolean
) {
  return useQuery({
    queryKey: healthExaminationKeys.participantImportRows(
      organizationId,
      batchId,
      importId,
      params
    ),
    queryFn: () => fetchParticipantImportRows(organizationId, batchId, importId, params),
    enabled: Boolean(organizationId && batchId && importId && enabled),
  })
}

export function useConfirmParticipantImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, batchId, importId }: {
      organizationId: string
      batchId: string
      importId: string
    }) => confirmParticipantImport(organizationId, batchId, importId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(variables.organizationId, variables.batchId),
      })
      queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantImport(
          variables.organizationId,
          variables.batchId,
          variables.importId
        ),
      })
    },
  })
}

export function useCancelParticipantImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, batchId, importId }: {
      organizationId: string
      batchId: string
      importId: string
    }) => cancelParticipantImport(organizationId, batchId, importId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantImport(
          variables.organizationId,
          variables.batchId,
          variables.importId
        ),
      })
    },
  })
}
