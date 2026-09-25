"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import {
  fetchInvoiceByEncounter,
  fetchPaymentCounters,
  fetchPayments,
  processCashPayment,
  recordTransferConfirmation,
  startTransferPayment,
} from "../api"
import type {
  BillableEncounter,
  ConfirmTransferPaymentDto,
  PaymentListParams,
  ProcessCashPaymentDto,
  StartTransferPaymentDto,
} from "../types"

export const BILLING_PAYMENTS_KEY = ["billing", "payments"] as const
export const BILLING_COUNTERS_KEY = ["billing", "counters"] as const
export const billingInvoiceKey = (encounterId: string) => ["billing", "invoice", encounterId] as const

export function usePayments(params: PaymentListParams = {}) {
  const queryClient = useQueryClient()
  const previousStatuses = useRef<Map<string, string>>(new Map())
  const query = useQuery({
    queryKey: [...BILLING_PAYMENTS_KEY, params],
    queryFn: () => fetchPayments(params),
    refetchInterval: 15_000,
  })

  useEffect(() => {
    const changed = query.data?.data.some((invoice) => {
      const previous = previousStatuses.current.get(invoice.id)
      return previous !== undefined && previous !== invoice.paymentStatus
    })
    if (changed) {
      queryClient.invalidateQueries({ queryKey: BILLING_COUNTERS_KEY })
      queryClient.invalidateQueries({ queryKey: ["reception", "worklist"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "counters"] })
    }
    query.data?.data.forEach((invoice) => previousStatuses.current.set(invoice.id, invoice.paymentStatus))
  }, [query.data, queryClient])

  return query
}

export function usePaymentCounters() {
  return useQuery({
    queryKey: BILLING_COUNTERS_KEY,
    queryFn: fetchPaymentCounters,
    refetchInterval: 15_000,
  })
}

export function useInvoice(encounter?: BillableEncounter | null, open = true) {
  const queryClient = useQueryClient()
  const previousStatus = useRef<string | undefined>(undefined)
  const query = useQuery({
    queryKey: billingInvoiceKey(encounter?.id ?? ""),
    queryFn: () => fetchInvoiceByEncounter(encounter!),
    enabled: Boolean(encounter) && open,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: (query) => query.state.data?.paymentStatus === "PENDING" ? 5_000 : false,
  })

  useEffect(() => {
    if (!query.data) return
    if (previousStatus.current !== undefined && previousStatus.current !== query.data.paymentStatus) {
      queryClient.invalidateQueries({ queryKey: BILLING_PAYMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: BILLING_COUNTERS_KEY })
      queryClient.invalidateQueries({ queryKey: ["reception", "worklist"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "counters"] })
    }
    previousStatus.current = query.data.paymentStatus
  }, [query.data, queryClient])

  return query
}

function invalidateBilling(queryClient: ReturnType<typeof useQueryClient>, encounterId?: string) {
  queryClient.invalidateQueries({ queryKey: BILLING_PAYMENTS_KEY })
  queryClient.invalidateQueries({ queryKey: BILLING_COUNTERS_KEY })
  if (encounterId) queryClient.invalidateQueries({ queryKey: billingInvoiceKey(encounterId) })
  queryClient.invalidateQueries({ queryKey: ["reception", "worklist"] })
  queryClient.invalidateQueries({ queryKey: ["reception", "counters"] })
}

export function useStartTransferPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: StartTransferPaymentDto) => startTransferPayment(dto),
    onSuccess: (invoice) => invalidateBilling(queryClient, invoice.encounterId),
  })
}

export function useProcessCashPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: ProcessCashPaymentDto) => processCashPayment(dto),
    onSuccess: (invoice) => invalidateBilling(queryClient, invoice.encounterId),
  })
}

export function useRecordTransferConfirmation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: ConfirmTransferPaymentDto) => recordTransferConfirmation(dto),
    onSuccess: (invoice) => invalidateBilling(queryClient, invoice.encounterId),
  })
}
