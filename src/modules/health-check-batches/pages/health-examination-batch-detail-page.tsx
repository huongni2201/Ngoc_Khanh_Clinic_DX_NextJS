"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEnterprise } from "@/modules/companies/hooks/use-enterprises"
import { useHealthExaminationBatchDetail } from "../hooks/use-health-examination-batches"
import { HealthExaminationBatchHeader } from "../components/health-examination-batch-header"
import { HealthExaminationBatchSummaryStrip } from "../components/health-examination-batch-summary-strip"
import { HealthExaminationBatchTabs, HealthExaminationBatchTabType } from "../components/health-examination-batch-tabs"
import { EmployeesTab } from "../components/employees-tab/employees-tab"
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { ReportTab } from "../components/report-tab/report-tab"
import { ImportEmployeesDialog } from "../components/import-employees-dialog"

interface HealthExaminationBatchDetailPageProps {
  enterpriseId: string
  batchId: string
}

export function HealthExaminationBatchDetailPage({
  enterpriseId,
  batchId,
}: HealthExaminationBatchDetailPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const tabParam = searchParams?.get("tab")
  const [localTab, setLocalTab] = React.useState<HealthExaminationBatchTabType | null>(null)

  const activeTab: HealthExaminationBatchTabType =
    localTab ??
    (tabParam === "details" || tabParam === "examination"
      ? "examination"
      : tabParam === "report"
      ? "report"
      : "employees")

  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)

  const handleTabChange = (tab: HealthExaminationBatchTabType) => {
    setLocalTab(tab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (tab === "employees") {
      params.delete("tab")
    } else if (tab === "examination") {
      params.set("tab", "details")
    } else if (tab === "report") {
      params.set("tab", "report")
    }
    const query = params.toString() ? `?${params.toString()}` : ""
    if (router && typeof router.replace === "function") {
      router.replace(`${pathname}${query}`, { scroll: false })
    }
  }

  const {
    data: enterprise,
    isLoading: isLoadingEnterprise,
  } = useEnterprise(enterpriseId)

  const {
    data: batch,
    isLoading: isLoadingBatch,
    isError: isErrorBatch,
    refetch: refetchBatch,
  } = useHealthExaminationBatchDetail(batchId)

  const isLoading = isLoadingEnterprise || isLoadingBatch

  // Function to download the standard employee roster Excel template
  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(
        "STT,Mã NV,Họ tên,Ngày sinh,Giới tính,CCCD,Số điện thoại,Phòng ban,Chức vụ,Địa chỉ,Ngày vào làm,Loại HĐ,Ghi chú\n" +
          "1,FPT001,Trần Minh Đức,14/03/1990,Nam,090312345678,0901234567,Khối Công nghệ,Kỹ sư,Hà Nội,01/06/2018,HĐLĐ,\n" +
          "2,FPT002,Nguyễn Thu Hà,22/08/1992,Nữ,001189012345,0987654321,Khối Nhân sự,Chuyên viên,Hà Nội,15/03/2019,HĐLĐ,\n"
      )
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", `mau_danh_sach_nhan_su_${batch?.code || "DK"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Loading skeleton matching visual structure
  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-72 sm:w-96" />
              <Skeleton className="h-4 w-52" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Summary Strip Skeleton */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3.5 px-4 py-2">
                <Skeleton className="size-11 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="border-b border-border/80 pb-2.5 flex gap-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Table Skeleton */}
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  // Error state
  if (isErrorBatch || !batch) {
    return (
      <div className="w-full py-16 text-center space-y-4">
        <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Không tìm thấy đợt khám
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Đợt khám với mã &quot;{batchId}&quot; không tồn tại hoặc đã bị xóa.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href={`/enterprises/${enterpriseId}`}>
            <Button variant="outline" size="sm" className="text-xs h-9">
              <ArrowLeft className="size-3.5 mr-1.5" />
              Về chi tiết doanh nghiệp
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => refetchBatch()}
            className="text-xs h-9 shadow-xs"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  const enterpriseName = enterprise?.name || "Công ty Cổ phần FPT"

  return (
    <div className="w-full space-y-6">
      {/* 1. Breadcrumbs, Title & Top-Right Actions */}
      <HealthExaminationBatchHeader
        batch={batch}
        enterpriseName={enterpriseName}
        activeTab={activeTab}
        onImportClick={() => setIsImportDialogOpen(true)}
        onDownloadTemplateClick={handleDownloadTemplate}
      />

      {/* 2. 4-column Summary Strip */}
      <HealthExaminationBatchSummaryStrip
        batch={batch}
        enterpriseName={enterpriseName}
      />

      {/* 3. 3-tab Navigation */}
      <HealthExaminationBatchTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 4. Tab Content */}
      <div className="pt-1">
        {activeTab === "employees" && (
          <EmployeesTab
            batchId={batch.id}
            enterpriseId={batch.enterpriseId}
            totalBatchEmployees={batch.employeeCount}
            onImportClick={() => setIsImportDialogOpen(true)}
            onDownloadTemplateClick={handleDownloadTemplate}
          />
        )}

        {activeTab === "examination" && (
          <ExaminationDetailTab batchId={batch.id} />
        )}

        {activeTab === "report" && (
          <ReportTab
            batchId={batch.id}
            batchName={batch.name}
          />
        )}
      </div>

      {/* 5. Import Employees Dialog */}
      <ImportEmployeesDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        batchId={batch.id}
        batchName={batch.name}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  )
}
