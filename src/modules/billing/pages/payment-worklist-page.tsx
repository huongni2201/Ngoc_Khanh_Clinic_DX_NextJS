"use client"

import * as React from "react"
import { RefreshCw, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination, PageHeader, ScreenLayout } from "@/shared/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PaymentDialog } from "../components/payment-dialog"
import { PaymentCountersStrip } from "../components/payment-counters-strip"
import { PaymentTable } from "../components/payment-table"
import { usePaymentCounters, usePayments } from "../hooks/use-billing"
import type { BillableEncounter, Invoice, PaymentStatusFilter } from "../types"

const statuses: PaymentStatusFilter[] = ["ALL", "PENDING", "ATTENTION", "PAID_TODAY", "PAID"]
const isStatus = (value: string | null): value is PaymentStatusFilter => Boolean(value && statuses.includes(value as PaymentStatusFilter))

export function PaymentWorklistPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")
  const status: PaymentStatusFilter = isStatus(statusParam) ? statusParam : "ALL"
  const query = searchParams.get("q")?.trim() ?? ""
  const rawPage = Number(searchParams.get("page") ?? "1")
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const [selected, setSelected] = React.useState<Invoice | null>(null)
  const { data, isLoading, isError, error, refetch } = usePayments({ status, search: query, page, pageSize: 10 })
  const { data: counters, isLoading: countersLoading } = usePaymentCounters()

  const updateUrl = React.useCallback((next: { status?: PaymentStatusFilter; q?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString())
    const nextStatus = next.status ?? status
    const nextQuery = next.q ?? query
    const nextPage = next.page ?? page
    if (nextStatus === "ALL") params.delete("status")
    else params.set("status", nextStatus)
    if (nextQuery) params.set("q", nextQuery)
    else params.delete("q")
    if (nextPage > 1) params.set("page", String(nextPage))
    else params.delete("page")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [page, pathname, query, router, searchParams, status])

  const selectedEncounter: BillableEncounter | null = selected ? { id: selected.encounterId, encounterCode: selected.encounterCode, patientId: selected.patientId, patientCode: selected.patientCode, patientName: selected.patientName, examinationType: selected.examinationType } : null

  const filterButtons = statuses.slice(0, 5)
  const filterLabel = (item: PaymentStatusFilter) => item === "ALL" ? "Tất cả" : item === "PENDING" ? "Chờ thu" : item === "ATTENTION" ? "Cần kiểm tra" : item === "PAID" ? "Đã thanh toán" : "Đã thu hôm nay"
  return <ScreenLayout data-slot="payment-worklist-page"><PageHeader breadcrumbs={[{ label: "Bàn tiếp đón", href: "/reception" }, { label: "Thanh toán" }]} title="Danh sách thu phí" description="Theo dõi các khoản chờ thu, chuyển khoản đang xử lý và thanh toán trong ngày" actions={<Button variant="outline" onClick={() => refetch()}><RefreshCw className="size-4" />Làm mới</Button>} /><PaymentCountersStrip counters={counters} isLoading={countersLoading} activeStatus={status} onFilter={(nextStatus) => updateUrl({ status: nextStatus, page: 1 })} /><div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => updateUrl({ q: event.target.value, page: 1 })} placeholder="Tìm bệnh nhân, mã BN, mã lượt khám..." className="pl-9" aria-label="Tìm kiếm thanh toán" /></div><div className="flex flex-wrap gap-2" role="group" aria-label="Lọc trạng thái">{filterButtons.map((item) => <Button key={item} size="sm" variant={status === item ? "default" : "outline"} aria-pressed={status === item} onClick={() => updateUrl({ status: item, page: 1 })}>{filterLabel(item)}</Button>)}</div></div></div>{isError && <Alert variant="destructive"><AlertDescription className="flex items-center justify-between gap-3"><span>{(error as Error)?.message ?? "Không thể tải danh sách thanh toán."}</span><Button size="sm" variant="outline" onClick={() => refetch()}>Thử lại</Button></AlertDescription></Alert>}<PaymentTable invoices={data?.data ?? []} isLoading={isLoading} onSelect={setSelected} /><DataTablePagination currentPage={data?.page ?? page} pageSize={data?.pageSize ?? 10} totalItems={data?.total ?? 0} totalPages={data?.totalPages ?? 1} onPageChange={(nextPage) => updateUrl({ page: nextPage })} entityName="thanh toán" /><PaymentDialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }} encounter={selectedEncounter} onPaid={() => { refetch() }} /></ScreenLayout>
}
